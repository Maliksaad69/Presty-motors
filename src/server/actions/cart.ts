"use server";

import {
  validateCartStock,
  validatePromoCode,
  StockValidationItem,
  PromoValidationResult,
  StockValidationResult,
} from "@/server/services/cart.service";

export async function validateStockAction(
  items: StockValidationItem[]
): Promise<StockValidationResult> {
  try {
    return await validateCartStock(items);
  } catch (error: any) {
    console.error("validateStockAction error:", error);
    return {
      valid: false,
      items: [],
      errorMessage: error.message || "Failed to validate catalog stock levels.",
    };
  }
}

export async function applyPromoCodeAction(
  code: string,
  subtotal: number
): Promise<PromoValidationResult> {
  try {
    return await validatePromoCode(code, subtotal);
  } catch (error: any) {
    console.error("applyPromoCodeAction error:", error);
    return {
      valid: false as const,
      discountAmount: 0,
      errorMessage: error.message || "Failed to validate promo code.",
    };
  }
}
