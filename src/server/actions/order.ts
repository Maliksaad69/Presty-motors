"use server";

import {
  createOrder,
  lookupOrder,
  getRecentOrders,
  CreateOrderInput,
  OrderResult,
} from "@/server/services/order.service";

export async function createOrderAction(input: CreateOrderInput): Promise<OrderResult> {
  try {
    return await createOrder(input);
  } catch (error: any) {
    console.error("createOrderAction error:", error);
    return {
      success: false as const,
      errorMessage: error.message || "An unexpected error occurred while placing order.",
    };
  }
}

export async function lookupOrderAction(orderNumber: string, email: string) {
  try {
    const order = await lookupOrder(orderNumber, email);
    if (!order) {
      return {
        success: false,
        errorMessage: "No order found matching this reference number and email address.",
      };
    }
    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        fulfillmentType: order.fulfillmentType,
        paymentStatus: order.paymentStatus,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discountAmount: Number(order.discountAmount),
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        guestName: order.guestName,
        guestEmail: order.guestEmail,
        guestPhone: order.guestPhone,
        items: order.items.map((i) => ({
          id: i.id,
          title: i.productTitle,
          sku: i.productSku,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          totalPrice: Number(i.totalPrice),
        })),
        shippingAddress: order.shippingAddressSnapshot as any,
        quote: order.shippingQuote
          ? {
              quoteNumber: order.shippingQuote.quoteNumber,
              status: order.shippingQuote.status,
              destinationCountry: order.shippingQuote.destinationCountry,
              destinationCity: order.shippingQuote.destinationCity,
            }
          : null,
        shipment: order.shipments[0]
          ? {
              carrier: order.shipments[0].carrier,
              trackingNumber: order.shipments[0].trackingNumber,
              status: order.shipments[0].status,
            }
          : null,
      },
    };
  } catch (error: any) {
    console.error("lookupOrderAction error:", error);
    return {
      success: false,
      errorMessage: error.message || "Failed to locate order details.",
    };
  }
}

export async function getRecentOrdersAction(email?: string) {
  try {
    const orders = await getRecentOrders(email);
    return {
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        fulfillmentType: order.fulfillmentType,
        paymentStatus: order.paymentStatus,
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
        itemsCount: order.items.length,
        firstItemTitle: order.items[0]?.productTitle || "Motorsport Equipment",
        trackingNumber: order.shipments[0]?.trackingNumber || null,
        quoteNumber: order.shippingQuote?.quoteNumber || null,
      })),
    };
  } catch (error: any) {
    console.error("getRecentOrdersAction error:", error);
    return {
      success: false,
      orders: [],
      errorMessage: error.message || "Failed to load recent orders.",
    };
  }
}
