import { db } from "@/lib/db";

export interface StockValidationItem {
  id: string;
  sku?: string;
  quantity: number;
}

export interface StockValidationResult {
  valid: boolean;
  items: {
    id: string;
    availableStock: number;
    requestedQuantity: number;
    inStock: boolean;
    title: string;
    price: number;
  }[];
  errorMessage?: string;
}

export type PromoValidationResult =
  | {
      valid: true;
      code: string;
      description?: string;
      discountType: "PERCENTAGE" | "FIXED_AMOUNT";
      discountValue: number;
      discountAmount: number;
      errorMessage?: undefined;
    }
  | {
      valid: false;
      discountAmount: 0;
      errorMessage: string;
      code?: undefined;
      description?: undefined;
      discountType?: undefined;
      discountValue?: undefined;
    };

/**
 * Validates requested cart items against real-time PostgreSQL inventory levels.
 */
export async function validateCartStock(
  items: StockValidationItem[]
): Promise<StockValidationResult> {
  if (!items || items.length === 0) {
    return { valid: true, items: [] };
  }

  const ids = items.map((i) => i.id);

  // Find products matching either id or sku or slug
  const products = await db.product.findMany({
    where: {
      OR: [
        { id: { in: ids } },
        { sku: { in: ids } },
        { slug: { in: ids } },
      ],
    },
    include: {
      inventory: true,
      translations: true,
    },
  });

  const productMap = new Map();
  for (const prod of products) {
    productMap.set(prod.id, prod);
    productMap.set(prod.sku, prod);
    productMap.set(prod.slug, prod);
  }

  const validatedItems = [];
  let allInStock = true;
  let firstError = "";

  for (const item of items) {
    const prod = productMap.get(item.id);
    if (!prod) {
      allInStock = false;
      firstError = `Product ${item.sku || item.id} is no longer available in catalog.`;
      validatedItems.push({
        id: item.id,
        availableStock: 0,
        requestedQuantity: item.quantity,
        inStock: false,
        title: "Unavailable Machine",
        price: 0,
      });
      continue;
    }

    const availableStock = prod.inventory?.quantity ?? 0;
    const inStock = availableStock >= item.quantity;
    if (!inStock) {
      allInStock = false;
      const title = prod.translations[0]?.title || prod.slug;
      firstError = `Insufficient stock for "${title}". Only ${availableStock} unit(s) remaining.`;
    }

    const price = prod.salePrice ? Number(prod.salePrice) : Number(prod.price);
    const title = prod.translations[0]?.title || prod.slug;

    validatedItems.push({
      id: prod.id,
      availableStock,
      requestedQuantity: item.quantity,
      inStock,
      title,
      price,
    });
  }

  return {
    valid: allInStock,
    items: validatedItems,
    errorMessage: allInStock ? undefined : firstError,
  };
}

/**
 * Validates a promotional discount code against active rules in the database.
 */
export async function validatePromoCode(
  code: string,
  subtotal: number
): Promise<PromoValidationResult> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { valid: false as const, discountAmount: 0, errorMessage: "Please enter a promotional code." };
  }

  const promo = await db.promotion.findUnique({
    where: { code: normalizedCode },
  });

  if (!promo || !promo.isActive) {
    return {
      valid: false as const,
      discountAmount: 0,
      errorMessage: `Code "${normalizedCode}" is invalid or has expired.`,
    };
  }

  const now = new Date();
  if (promo.startDate && promo.startDate > now) {
    return {
      valid: false as const,
      discountAmount: 0,
      errorMessage: "This promotional campaign has not started yet.",
    };
  }

  if (promo.endDate && promo.endDate < now) {
    return {
      valid: false as const,
      discountAmount: 0,
      errorMessage: "This promotional campaign has expired.",
    };
  }

  if (promo.usageLimit !== null && promo.timesUsed >= promo.usageLimit) {
    return {
      valid: false as const,
      discountAmount: 0,
      errorMessage: "This promotional code has reached its maximum redemptions.",
    };
  }

  const minOrder = promo.minOrderAmount ? Number(promo.minOrderAmount) : 0;
  if (subtotal < minOrder) {
    return {
      valid: false as const,
      discountAmount: 0,
      errorMessage: `Minimum order amount of €${minOrder} required for code "${normalizedCode}".`,
    };
  }

  let discountAmount = 0;
  const discountVal = Number(promo.discountValue);

  if (promo.discountType === "PERCENTAGE") {
    discountAmount = (subtotal * discountVal) / 100;
  } else {
    discountAmount = discountVal;
  }

  if (promo.maxDiscount) {
    const max = Number(promo.maxDiscount);
    if (discountAmount > max) {
      discountAmount = max;
    }
  }

  // Ensure discount does not exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    valid: true as const,
    code: promo.code,
    description: promo.description || undefined,
    discountType: promo.discountType,
    discountValue: discountVal,
    discountAmount,
  };
}
