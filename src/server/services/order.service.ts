import { db } from "@/lib/db";
import { FulfillmentType, OrderStatus, PaymentStatus, QuoteStatus, ShipmentStatus } from "@prisma/client";
import { validatePromoCode } from "./cart.service";

export interface CreateOrderItemInput {
  id: string; // product id, sku, or slug
  quantity: number;
}

export interface AddressInput {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  stateOrProvince?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrderInput {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  fulfillmentType: FulfillmentType;
  shippingAddress?: AddressInput;
  billingAddress?: AddressInput;
  paymentMethod: "CARD" | "TRANSFER" | "ON_PICKUP";
  items: CreateOrderItemInput[];
  promoCode?: string;
  notes?: string;
}

export type OrderResult =
  | {
      success: true;
      orderNumber: string;
      quoteNumber?: string;
      orderId: string;
      status: OrderStatus;
      fulfillmentType: FulfillmentType;
      subtotal: number;
      shippingFee: number;
      discountAmount: number;
      total: number;
      items: {
        title: string;
        sku: string;
        unitPrice: number;
        quantity: number;
        totalPrice: number;
      }[];
      errorMessage?: undefined;
    }
  | {
      success: false;
      errorMessage: string;
      orderNumber?: undefined;
      quoteNumber?: undefined;
      orderId?: undefined;
      status?: undefined;
      fulfillmentType?: undefined;
      subtotal?: undefined;
      shippingFee?: undefined;
      discountAmount?: undefined;
      total?: undefined;
      items?: undefined;
    };

/**
 * Creates an order atomically in PostgreSQL with price tamper verification,
 * inventory reservation, audit logging, and shipping quote support.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderResult> {
  const { customer, fulfillmentType, items, promoCode, paymentMethod, notes } = input;

  if (!items || items.length === 0) {
    return { success: false as const, errorMessage: "Cart is empty. Please add items before checking out." };
  }

  if (!customer.email || !customer.fullName) {
    return { success: false as const, errorMessage: "Customer contact details are incomplete." };
  }

  // Execute database transaction for data integrity and race condition prevention
  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Fetch authoritative product records from DB
      const itemIdentifiers = items.map((i) => i.id);
      const dbProducts = await tx.product.findMany({
        where: {
          OR: [
            { id: { in: itemIdentifiers } },
            { sku: { in: itemIdentifiers } },
            { slug: { in: itemIdentifiers } },
          ],
        },
        include: {
          inventory: true,
          translations: true,
        },
      });

      const prodMap = new Map();
      for (const prod of dbProducts) {
        prodMap.set(prod.id, prod);
        prodMap.set(prod.sku, prod);
        prodMap.set(prod.slug, prod);
      }

      // 2. Validate availability and compute exact server-authoritative subtotal
      let computedSubtotal = 0;
      const orderItemsData = [];

      for (const reqItem of items) {
        const prod = prodMap.get(reqItem.id);
        if (!prod) {
          throw new Error(`Product ${reqItem.id} was not found in the showroom catalog.`);
        }

        const availableQty = prod.inventory?.quantity ?? 0;
        if (availableQty < reqItem.quantity) {
          const title = prod.translations[0]?.title || prod.slug;
          throw new Error(`Insufficient stock for "${title}". Only ${availableQty} available.`);
        }

        // Server authoritative unit price (salePrice if available, otherwise regular price)
        const unitPrice = prod.salePrice ? Number(prod.salePrice) : Number(prod.price);
        const itemTotal = unitPrice * reqItem.quantity;
        computedSubtotal += itemTotal;

        const title = prod.translations[0]?.title || prod.slug;

        orderItemsData.push({
          productId: prod.id,
          productTitle: title,
          productSku: prod.sku,
          unitPrice,
          quantity: reqItem.quantity,
          totalPrice: itemTotal,
          inventoryId: prod.inventory?.id,
          currentStock: availableQty,
        });
      }

      // 3. Compute promotional discount
      let discountAmount = 0;
      if (promoCode) {
        const promoResult = await validatePromoCode(promoCode, computedSubtotal);
        if (promoResult.valid) {
          discountAmount = promoResult.discountAmount;
          // Increment promotion usage
          await tx.promotion.update({
            where: { code: promoResult.code! },
            data: { timesUsed: { increment: 1 } },
          });
        }
      }

      // 4. Compute shipping fee based on fulfillment choice
      let shippingFee = 0;
      if (fulfillmentType === "DOMESTIC_DELIVERY") {
        shippingFee = 150; // Flat domestic express freight
      } else if (fulfillmentType === "SHOWROOM_PICKUP") {
        shippingFee = 0;
      } else if (fulfillmentType === "INTERNATIONAL_QUOTE") {
        shippingFee = 0; // Quoted separately
      }

      const total = Math.max(0, computedSubtotal - discountAmount + shippingFee);

      // 5. Generate unique order number (e.g. PM-2026-849102)
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const orderNumber = `PM-2026-${randomSuffix}`;

      // 6. Determine order and payment status
      const isInternationalQuote = fulfillmentType === "INTERNATIONAL_QUOTE";
      const orderStatus: OrderStatus = isInternationalQuote
        ? OrderStatus.PENDING_QUOTE
        : OrderStatus.PENDING;

      let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;
      if (!isInternationalQuote && paymentMethod === "CARD") {
        // Pre-authorized simulated card payment
        paymentStatus = PaymentStatus.AUTHORIZED;
      }

      // 7. Decrement inventory and record audit movements
      for (const item of orderItemsData) {
        if (item.inventoryId) {
          const newQty = item.currentStock - item.quantity;
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: { quantity: newQty },
          });

          await tx.inventoryMovement.create({
            data: {
              inventoryId: item.inventoryId,
              type: "PURCHASE",
              quantityChange: -item.quantity,
              previousQuantity: item.currentStock,
              newQuantity: newQty,
              reason: `Order purchase #${orderNumber}`,
              referenceId: orderNumber,
            },
          });
        }
      }

      // 8. Create the Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          guestName: customer.fullName,
          guestEmail: customer.email,
          guestPhone: customer.phone,
          status: orderStatus,
          fulfillmentType,
          paymentStatus,
          subtotal: computedSubtotal,
          shippingFee,
          discountAmount,
          total,
          currency: "EUR",
          shippingAddressSnapshot: (input.shippingAddress || null) as unknown as object,
          billingAddressSnapshot: (input.billingAddress || input.shippingAddress || null) as unknown as object,
          notes,
          items: {
            create: orderItemsData.map((oi) => ({
              productId: oi.productId,
              productTitle: oi.productTitle,
              productSku: oi.productSku,
              unitPrice: oi.unitPrice,
              quantity: oi.quantity,
              totalPrice: oi.totalPrice,
            })),
          },
          payments: {
            create: {
              provider: paymentMethod === "CARD" ? "stripe_simulated" : paymentMethod === "TRANSFER" ? "bank_wire" : "showroom_pos",
              transactionId: `TX-${randomSuffix}`,
              amount: total,
              currency: "EUR",
              status: paymentStatus,
            },
          },
        },
        include: {
          items: true,
        },
      });

      // 9. If International Quote, generate ShippingQuote entity
      let quoteNumber: string | undefined;
      if (isInternationalQuote) {
        quoteNumber = `PM-QUOTE-${Math.floor(10000 + Math.random() * 90000)}`;
        await tx.shippingQuote.create({
          data: {
            orderId: createdOrder.id,
            quoteNumber,
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            destinationCountry: input.shippingAddress?.country || "International",
            destinationCity: input.shippingAddress?.city || "Unknown",
            destinationPostalCode: input.shippingAddress?.postalCode || null,
            destinationAddress: input.shippingAddress?.streetLine1 || "Overseas Address Provided",
            requestedItems: orderItemsData.map((oi) => ({
              sku: oi.productSku,
              title: oi.productTitle,
              quantity: oi.quantity,
              unitPrice: oi.unitPrice,
            })),
            status: QuoteStatus.REQUESTED,
            customerNotes: notes || null,
          },
        });
      } else {
        // Create initial shipment tracking entity
        await tx.shipment.create({
          data: {
            orderId: createdOrder.id,
            carrier: fulfillmentType === "SHOWROOM_PICKUP" ? "Paris 16e Flagship" : "Geodis Motorsport Logistics",
            trackingNumber: `TRK-${randomSuffix}`,
            status: ShipmentStatus.PREPARING,
          },
        });
      }

      return {
        success: true as const,
        orderId: createdOrder.id,
        orderNumber,
        quoteNumber,
        status: orderStatus,
        fulfillmentType,
        subtotal: computedSubtotal,
        shippingFee,
        discountAmount,
        total,
        items: orderItemsData.map((oi) => ({
          title: oi.productTitle,
          sku: oi.productSku,
          unitPrice: oi.unitPrice,
          quantity: oi.quantity,
          totalPrice: oi.totalPrice,
        })),
      };
    });

    return result;
  } catch (error: any) {
    console.error("Order creation transaction error:", error);
    return {
      success: false as const,
      errorMessage: error.message || "Failed to process order. Please try again.",
    };
  }
}

/**
 * Looks up an order by order reference and customer email.
 */
export async function lookupOrder(orderNumber: string, email: string) {
  const normalizedNumber = orderNumber.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  const order = await db.order.findFirst({
    where: {
      orderNumber: normalizedNumber,
      guestEmail: { equals: normalizedEmail, mode: "insensitive" },
    },
    include: {
      items: true,
      payments: true,
      shipments: true,
      shippingQuote: true,
    },
  });

  return order;
}

/**
 * Retrieves recent orders for the customer portal.
 */
export async function getRecentOrders(email?: string, limit = 10) {
  if (!email) {
    // Return sample/latest orders if no email filter provided
    return db.order.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        shipments: true,
        shippingQuote: true,
        payments: true,
      },
    });
  }

  return db.order.findMany({
    where: {
      guestEmail: { equals: email.trim().toLowerCase(), mode: "insensitive" },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shipments: true,
      shippingQuote: true,
      payments: true,
    },
  });
}
