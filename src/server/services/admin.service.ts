import { db } from "@/lib/db";
import {
  OrderStatus,
  QuoteStatus,
  ProductStatus,
  VehicleType,
  DiscountType,
  InventoryMovementType,
  ShipmentStatus,
} from "@prisma/client";
import { createProductSchema } from "@/lib/validations/product";
import { generateSlug } from "@/lib/utils";
import crypto from "crypto";

export interface UploadedImageData {
  data: string; // base64 data URI or raw base64
  mimeType?: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface CreateProductInput {
  slug?: string | null;
  sku?: string | null;
  price: number;
  salePrice?: number | null;
  categoryId: string;
  vehicleType: VehicleType;
  ageGroup?: string | null;
  engineCapacity?: string | null;
  status?: ProductStatus;
  isFeatured?: boolean;
  initialStock: number;
  imageUrl?: string | null;
  images?: UploadedImageData[];
  translations: {
    locale: string;
    title: string;
    shortDescription?: string;
    description: string;
    specifications?: any;
  }[];
}

export interface UpdateProductInput {
  sku?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number;
  threshold?: number;
  categoryId?: string;
  vehicleType?: VehicleType;
  status?: ProductStatus;
  isFeatured?: boolean;
  ageGroup?: string | null;
  engineCapacity?: string | null;
  translations?: {
    locale: string;
    title: string;
    shortDescription?: string;
    description: string;
    specifications?: any;
  }[];
  newImages?: UploadedImageData[];
  deleteImageIds?: string[];
  primaryImageId?: string;
}

function parseBase64Image(dataString: string): { buffer: Buffer; mimeType: string } {
  const matches = dataString.match(/^data:([A-Za-z0-9-+\/.]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      buffer: Buffer.from(matches[2], "base64"),
    };
  }
  return {
    mimeType: "image/jpeg",
    buffer: Buffer.from(dataString, "base64"),
  };
}

export async function getAdminOverview() {
  const [
    totalOrders,
    pendingOrdersCount,
    pendingQuotesCount,
    products,
    recentOrders,
    recentMovements,
  ] = await Promise.all([
    db.order.findMany({
      where: { status: { not: OrderStatus.CANCELLED } },
      select: { total: true },
    }),
    db.order.count({
      where: {
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.AWAITING_PAYMENT] },
      },
    }),
    db.shippingQuote.count({
      where: {
        status: { in: [QuoteStatus.REQUESTED, QuoteStatus.REVIEWING] },
      },
    }),
    db.product.findMany({
      include: {
        inventory: true,
        translations: true,
        category: {
          include: {
            translations: true,
          },
        },
      },
    }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        shippingQuote: true,
      },
    }),
    db.inventoryMovement.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        inventory: {
          include: {
            product: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalRevenue = totalOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const lowStockProducts = products.filter(
    (p) => (p.inventory?.quantity ?? 0) <= (p.inventory?.lowStockThreshold ?? 2)
  );

  return {
    totalRevenue,
    totalProductsCount: products.length,
    lowStockCount: lowStockProducts.length,
    pendingOrdersCount,
    pendingQuotesCount,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.guestName || "Showroom Customer",
      customerEmail: o.guestEmail,
      status: o.status,
      fulfillmentType: o.fulfillmentType,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      itemsCount: o.items.length,
      quoteNumber: o.shippingQuote?.quoteNumber,
    })),
    recentMovements: recentMovements.map((m) => ({
      id: m.id,
      productTitle:
        m.inventory.product.translations[0]?.title || m.inventory.product.slug,
      type: m.type,
      quantityChange: m.quantityChange,
      previousQuantity: m.previousQuantity,
      newQuantity: m.newQuantity,
      reason: m.reason || "Manual update",
      referenceId: m.referenceId,
      createdAt: m.createdAt.toISOString(),
    })),
    lowStockProducts: lowStockProducts.map((p) => ({
      id: p.id,
      title: p.translations[0]?.title || p.slug,
      sku: p.sku,
      currentStock: p.inventory?.quantity ?? 0,
      threshold: p.inventory?.lowStockThreshold ?? 2,
    })),
  };
}

export async function getAdminProducts() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        include: {
          translations: true,
        },
      },
      inventory: true,
      translations: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return products.map((p) => {
    const frTrans = p.translations.find((t) => t.locale === "fr") || p.translations[0];
    const enTrans = p.translations.find((t) => t.locale === "en");
    const esTrans = p.translations.find((t) => t.locale === "es");
    const arTrans = p.translations.find((t) => t.locale === "ar");

    return {
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      vehicleType: p.vehicleType,
      ageGroup: p.ageGroup,
      engineCapacity: p.engineCapacity,
      status: p.status,
      isFeatured: p.isFeatured,
      categoryName: p.category.translations[0]?.name || p.category.slug,
      categoryId: p.categoryId,
      stock: p.inventory?.quantity ?? 0,
      threshold: p.inventory?.lowStockThreshold ?? 2,
      imageUrl: p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || null,
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      titleFr: frTrans?.title || p.slug,
      descFr: frTrans?.description || "",
      titleEn: enTrans?.title || "",
      descEn: enTrans?.description || "",
      titleEs: esTrans?.title || "",
      descEs: esTrans?.description || "",
      titleAr: arTrans?.title || "",
      descAr: arTrans?.description || "",
      specifications: (frTrans?.specifications || p.translations[0]?.specifications || {}) as any,
      translations: p.translations,
      createdAt: p.createdAt.toISOString(),
    };
  });
}

export async function createAdminProduct(input: CreateProductInput) {
  const primaryTitle =
    input.translations.find((t) => t.locale === "fr")?.title ||
    input.translations[0]?.title ||
    "Machine";

  const finalSlug =
    input.slug && input.slug.trim().length > 0
      ? input.slug.toLowerCase().trim()
      : generateSlug(primaryTitle);

  const finalSku =
    input.sku && input.sku.trim().length > 0
      ? input.sku.toUpperCase().trim()
      : `PM-${input.vehicleType.slice(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const payloadToValidate = {
    ...input,
    slug: finalSlug,
    sku: finalSku,
  };

  const parsed = createProductSchema.safeParse(payloadToValidate);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    throw new Error(`Product validation error: ${errorMsg}`);
  }

  return db.$transaction(async (tx) => {
    // 1. Create the product
    const product = await tx.product.create({
      data: {
        slug: finalSlug,
        sku: finalSku,
        price: input.price,
        salePrice: input.salePrice || null,
        categoryId: input.categoryId,
        vehicleType: input.vehicleType,
        ageGroup: input.ageGroup || null,
        engineCapacity: input.engineCapacity || null,
        status: input.status || ProductStatus.PUBLISHED,
        isFeatured: input.isFeatured ?? false,
        translations: {
          create: input.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            shortDescription: t.shortDescription || null,
            description: t.description,
            specifications: (t.specifications || {}) as unknown as object,
          })),
        },
        inventory: {
          create: {
            quantity: input.initialStock,
            reservedQuantity: 0,
            lowStockThreshold: 2,
          },
        },
      },
      include: {
        inventory: true,
      },
    });

    // 2. Store local uploaded images directly in PostgreSQL BYTEA column
    if (input.images && input.images.length > 0) {
      for (let i = 0; i < input.images.length; i++) {
        const img = input.images[i];
        const { buffer, mimeType } = parseBase64Image(img.data);
        const imageId = crypto.randomUUID();
        await tx.productImage.create({
          data: {
            id: imageId,
            productId: product.id,
            url: `/api/images/${imageId}`,
            imageData: new Uint8Array(buffer),
            mimeType: img.mimeType || mimeType,
            altText: img.altText || primaryTitle,
            sortOrder: i,
            isPrimary: i === 0 || !!img.isPrimary,
          },
        });
      }
    } else if (input.imageUrl) {
      await tx.productImage.create({
        data: {
          productId: product.id,
          url: input.imageUrl,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    // 3. Create initial restock movement log
    if (product.inventory) {
      await tx.inventoryMovement.create({
        data: {
          inventoryId: product.inventory.id,
          type: InventoryMovementType.RESTOCK,
          quantityChange: input.initialStock,
          previousQuantity: 0,
          newQuantity: input.initialStock,
          reason: "Initial machine creation in PostgreSQL catalog",
          referenceId: product.sku,
        },
      });
    }

    return product;
  });
}

export async function updateAdminProduct(
  id: string,
  input: UpdateProductInput
) {
  return db.$transaction(async (tx) => {
    // 1. Update basic product info
    const product = await tx.product.update({
      where: { id },
      data: {
        sku: input.sku ? input.sku.toUpperCase().trim() : undefined,
        price: input.price !== undefined ? input.price : undefined,
        salePrice: input.salePrice !== undefined ? input.salePrice : undefined,
        categoryId: input.categoryId || undefined,
        vehicleType: input.vehicleType || undefined,
        status: input.status,
        isFeatured: input.isFeatured,
        ageGroup: input.ageGroup !== undefined ? input.ageGroup : undefined,
        engineCapacity: input.engineCapacity !== undefined ? input.engineCapacity : undefined,
      },
      include: {
        inventory: true,
      },
    });

    // 2. Update stock & threshold if provided
    if (input.stock !== undefined && product.inventory) {
      const prevStock = product.inventory.quantity;
      if (input.stock !== prevStock) {
        await tx.inventory.update({
          where: { id: product.inventory.id },
          data: {
            quantity: input.stock,
            lowStockThreshold: input.threshold !== undefined ? input.threshold : undefined,
          },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryId: product.inventory.id,
            type: input.stock > prevStock ? InventoryMovementType.RESTOCK : InventoryMovementType.ADJUSTMENT,
            quantityChange: input.stock - prevStock,
            previousQuantity: prevStock,
            newQuantity: input.stock,
            reason: "Admin stock update via vehicle editor",
            referenceId: product.sku,
          },
        });
      } else if (input.threshold !== undefined) {
        await tx.inventory.update({
          where: { id: product.inventory.id },
          data: { lowStockThreshold: input.threshold },
        });
      }
    }

    // 3. Update translations
    if (input.translations && input.translations.length > 0) {
      for (const t of input.translations) {
        await tx.productTranslation.upsert({
          where: {
            productId_locale: {
              productId: id,
              locale: t.locale,
            },
          },
          update: {
            title: t.title,
            description: t.description,
            shortDescription: t.shortDescription || null,
            specifications: (t.specifications || {}) as unknown as object,
          },
          create: {
            productId: id,
            locale: t.locale,
            title: t.title,
            description: t.description,
            shortDescription: t.shortDescription || null,
            specifications: (t.specifications || {}) as unknown as object,
          },
        });
      }
    }

    // 4. Delete images if requested
    if (input.deleteImageIds && input.deleteImageIds.length > 0) {
      await tx.productImage.deleteMany({
        where: {
          id: { in: input.deleteImageIds },
          productId: id,
        },
      });
    }

    // 5. Add new local images directly into PostgreSQL
    if (input.newImages && input.newImages.length > 0) {
      const highestImg = await tx.productImage.findFirst({
        where: { productId: id },
        orderBy: { sortOrder: "desc" },
      });
      let nextOrder = (highestImg?.sortOrder ?? -1) + 1;

      for (let i = 0; i < input.newImages.length; i++) {
        const img = input.newImages[i];
        const { buffer, mimeType } = parseBase64Image(img.data);
        const imageId = crypto.randomUUID();
        await tx.productImage.create({
          data: {
            id: imageId,
            productId: id,
            url: `/api/images/${imageId}`,
            imageData: new Uint8Array(buffer),
            mimeType: img.mimeType || mimeType,
            altText: img.altText || null,
            sortOrder: nextOrder++,
            isPrimary: !!img.isPrimary,
          },
        });
      }
    }

    // 6. Set primary image if requested
    if (input.primaryImageId) {
      await tx.productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      });
      await tx.productImage.update({
        where: { id: input.primaryImageId },
        data: { isPrimary: true },
      });
    }

    return product;
  });
}

export async function deleteAdminProduct(id: string) {
  return db.product.delete({
    where: { id },
  });
}

export async function getAdminInventory() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      inventory: true,
      translations: true,
    },
  });

  const movements = await db.inventoryMovement.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      inventory: {
        include: {
          product: {
            include: {
              translations: true,
            },
          },
        },
      },
    },
  });

  return {
    items: products.map((p) => ({
      id: p.id,
      title: p.translations[0]?.title || p.slug,
      sku: p.sku,
      currentStock: p.inventory?.quantity ?? 0,
      reserved: p.inventory?.reservedQuantity ?? 0,
      threshold: p.inventory?.lowStockThreshold ?? 2,
      inventoryId: p.inventory?.id,
      updatedAt: p.inventory?.updatedAt.toISOString() || p.updatedAt.toISOString(),
    })),
    movements: movements.map((m) => ({
      id: m.id,
      productTitle:
        m.inventory.product.translations[0]?.title || m.inventory.product.slug,
      productSku: m.inventory.product.sku,
      type: m.type,
      quantityChange: m.quantityChange,
      previousQuantity: m.previousQuantity,
      newQuantity: m.newQuantity,
      reason: m.reason || "Manual adjustment",
      referenceId: m.referenceId,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function adjustInventoryStock(
  productId: string,
  newQuantity: number,
  reason: string
) {
  return db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product || !product.inventory) {
      throw new Error("Product inventory record not found.");
    }

    const previousQuantity = product.inventory.quantity;
    const diff = newQuantity - previousQuantity;

    if (diff === 0) {
      return product.inventory;
    }

    const updatedInventory = await tx.inventory.update({
      where: { id: product.inventory.id },
      data: { quantity: newQuantity },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryId: product.inventory.id,
        type: diff > 0 ? InventoryMovementType.RESTOCK : InventoryMovementType.ADJUSTMENT,
        quantityChange: diff,
        previousQuantity,
        newQuantity,
        reason: reason || "Admin manual stock level update",
        referenceId: `ADJ-${Date.now().toString().slice(-6)}`,
      },
    });

    return updatedInventory;
  });
}

export async function getAdminOrders() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shipments: true,
      shippingQuote: true,
      payments: true,
    },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.guestName || "Showroom Customer",
    customerEmail: o.guestEmail || "N/A",
    customerPhone: o.guestPhone || "N/A",
    status: o.status,
    fulfillmentType: o.fulfillmentType,
    paymentStatus: o.paymentStatus,
    subtotal: Number(o.subtotal),
    shippingFee: Number(o.shippingFee),
    discountAmount: Number(o.discountAmount),
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      title: i.productTitle,
      sku: i.productSku,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
    shipment: o.shipments[0]
      ? {
          id: o.shipments[0].id,
          carrier: o.shipments[0].carrier,
          trackingNumber: o.shipments[0].trackingNumber,
          status: o.shipments[0].status,
        }
      : null,
    quoteNumber: o.shippingQuote?.quoteNumber,
  }));
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
  carrier?: string,
  trackingNumber?: string
) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status },
      include: { shipments: true },
    });

    if (carrier || trackingNumber) {
      if (order.shipments.length > 0) {
        await tx.shipment.update({
          where: { id: order.shipments[0].id },
          data: {
            carrier: carrier || order.shipments[0].carrier,
            trackingNumber: trackingNumber || order.shipments[0].trackingNumber,
            status:
              status === OrderStatus.DELIVERED
                ? ShipmentStatus.DELIVERED
                : status === OrderStatus.SHIPPED
                ? ShipmentStatus.IN_TRANSIT
                : ShipmentStatus.PREPARING,
          },
        });
      } else {
        await tx.shipment.create({
          data: {
            orderId: order.id,
            carrier: carrier || "Geodis Motorsport Logistics",
            trackingNumber: trackingNumber || `TRK-${Date.now().toString().slice(-6)}`,
            status:
              status === OrderStatus.DELIVERED
                ? ShipmentStatus.DELIVERED
                : ShipmentStatus.IN_TRANSIT,
          },
        });
      }
    }

    return order;
  });
}

export async function getAdminQuotes() {
  const quotes = await db.shippingQuote.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: true,
    },
  });

  return quotes.map((q) => ({
    id: q.id,
    quoteNumber: q.quoteNumber,
    orderNumber: q.order?.orderNumber || "N/A",
    fullName: q.fullName,
    email: q.email,
    phone: q.phone,
    destinationCountry: q.destinationCountry,
    destinationCity: q.destinationCity,
    destinationAddress: q.destinationAddress,
    status: q.status,
    quotedAmount: q.quotedAmount ? Number(q.quotedAmount) : null,
    requestedItems: q.requestedItems as any,
    customerNotes: q.customerNotes,
    adminNotes: q.adminNotes,
    createdAt: q.createdAt.toISOString(),
  }));
}

export async function updateAdminQuote(
  quoteId: string,
  status: QuoteStatus,
  quotedAmount?: number,
  adminNotes?: string
) {
  return db.shippingQuote.update({
    where: { id: quoteId },
    data: {
      status,
      quotedAmount: quotedAmount !== undefined ? quotedAmount : undefined,
      adminNotes: adminNotes !== undefined ? adminNotes : undefined,
    },
  });
}

export async function getAdminPromotions() {
  const promos = await db.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return promos.map((p) => ({
    id: p.id,
    code: p.code,
    description: p.description,
    discountType: p.discountType,
    discountValue: Number(p.discountValue),
    minOrderAmount: p.minOrderAmount ? Number(p.minOrderAmount) : null,
    timesUsed: p.timesUsed,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function createAdminPromotion(data: {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
}) {
  return db.promotion.create({
    data: {
      code: data.code.toUpperCase().trim(),
      description: data.description || null,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minOrderAmount: data.minOrderAmount || null,
      isActive: true,
    },
  });
}

export async function togglePromotionStatus(id: string, isActive: boolean) {
  return db.promotion.update({
    where: { id },
    data: { isActive },
  });
}

export async function getAdminSettings() {
  return db.siteSetting.findMany({
    orderBy: { group: "asc" },
  });
}

export async function updateAdminSetting(key: string, value: string) {
  return db.siteSetting.update({
    where: { key },
    data: { value },
  });
}
