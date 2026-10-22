"use server";

import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string, type?: "page" | "layout") {
  try {
    revalidatePath(path, type);
  } catch {
    // Safe fallback when called in standalone scripts or out-of-context execution
  }
}
import {
  getAdminOverview,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminInventory,
  adjustInventoryStock,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminQuotes,
  updateAdminQuote,
  getAdminPromotions,
  createAdminPromotion,
  togglePromotionStatus,
  getAdminSettings,
  updateAdminSetting,
  CreateProductInput,
  UpdateProductInput,
} from "@/server/services/admin.service";
import { OrderStatus, QuoteStatus, DiscountType } from "@prisma/client";

export async function getAdminOverviewAction() {
  try {
    const data = await getAdminOverview();
    return { success: true, data };
  } catch (error: any) {
    console.error("getAdminOverviewAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to load overview data." };
  }
}

export async function getAdminProductsAction() {
  try {
    const data = await getAdminProducts();
    return { success: true, data };
  } catch (error: any) {
    console.error("getAdminProductsAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to load products." };
  }
}

export async function createAdminProductAction(input: CreateProductInput) {
  try {
    const product = await createAdminProduct(input);
    safeRevalidatePath("/[locale]/admin/products", "page");
    safeRevalidatePath("/[locale]/shop", "page");
    return { success: true, product };
  } catch (error: any) {
    console.error("createAdminProductAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to create product." };
  }
}

export async function updateAdminProductAction(id: string, input: UpdateProductInput) {
  try {
    const product = await updateAdminProduct(id, input);
    safeRevalidatePath("/[locale]/admin/products", "page");
    safeRevalidatePath("/[locale]/shop", "page");
    return { success: true, product };
  } catch (error: any) {
    console.error("updateAdminProductAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to update product." };
  }
}

export async function deleteAdminProductAction(id: string) {
  try {
    await deleteAdminProduct(id);
    safeRevalidatePath("/[locale]/admin/products", "page");
    safeRevalidatePath("/[locale]/shop", "page");
    return { success: true };
  } catch (error: any) {
    console.error("deleteAdminProductAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to delete product." };
  }
}

export async function getAdminInventoryAction() {
  try {
    const data = await getAdminInventory();
    return { success: true, data };
  } catch (error: any) {
    console.error("getAdminInventoryAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to load inventory." };
  }
}

export async function adjustInventoryStockAction(
  productId: string,
  newQuantity: number,
  reason: string
) {
  try {
    const inventory = await adjustInventoryStock(productId, newQuantity, reason);
    safeRevalidatePath("/[locale]/admin/inventory", "page");
    safeRevalidatePath("/[locale]/shop", "page");
    return { success: true, inventory };
  } catch (error: any) {
    console.error("adjustInventoryStockAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to adjust stock." };
  }
}

export async function getAdminOrdersAction() {
  try {
    const data = await getAdminOrders();
    return { success: true, data };
  } catch (error: any) {
    console.error("getAdminOrdersAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to load orders." };
  }
}

export async function updateAdminOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  carrier?: string,
  trackingNumber?: string
) {
  try {
    const order = await updateAdminOrderStatus(orderId, status, carrier, trackingNumber);
    safeRevalidatePath("/[locale]/admin/orders", "page");
    safeRevalidatePath("/[locale]/account", "page");
    return { success: true, order };
  } catch (error: any) {
    console.error("updateAdminOrderStatusAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to update order status." };
  }
}

export async function getAdminQuotesAction() {
  try {
    const data = await getAdminQuotes();
    return { success: true, data };
  } catch (error: any) {
    console.error("getAdminQuotesAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to load quotes." };
  }
}

export async function updateAdminQuoteAction(
  quoteId: string,
  status: QuoteStatus,
  quotedAmount?: number,
  adminNotes?: string
) {
  try {
    const quote = await updateAdminQuote(quoteId, status, quotedAmount, adminNotes);
    safeRevalidatePath("/[locale]/admin/quotes", "page");
    return { success: true, quote };
  } catch (error: any) {
    console.error("updateAdminQuoteAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to update quote." };
  }
}

export async function getAdminPromotionsAction() {
  try {
    const data = await getAdminPromotions();
    return { success: true, data };
  } catch (error: any) {
    console.error("getAdminPromotionsAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to load promotions." };
  }
}

export async function createAdminPromotionAction(data: {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
}) {
  try {
    const promo = await createAdminPromotion(data);
    safeRevalidatePath("/[locale]/admin/promotions", "page");
    return { success: true, promo };
  } catch (error: any) {
    console.error("createAdminPromotionAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to create promo." };
  }
}

export async function togglePromotionStatusAction(id: string, isActive: boolean) {
  try {
    const promo = await togglePromotionStatus(id, isActive);
    safeRevalidatePath("/[locale]/admin/promotions", "page");
    return { success: true, promo };
  } catch (error: any) {
    console.error("togglePromotionStatusAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to toggle promotion." };
  }
}

export async function getAdminSettingsAction() {
  try {
    const data = await getAdminSettings();
    return { success: true, data };
  } catch (error: any) {
    console.error("getAdminSettingsAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to load settings." };
  }
}

export async function updateAdminSettingAction(key: string, value: string) {
  try {
    const setting = await updateAdminSetting(key, value);
    safeRevalidatePath("/[locale]/admin/settings", "page");
    return { success: true, setting };
  } catch (error: any) {
    console.error("updateAdminSettingAction error:", error);
    return { success: false, errorMessage: error.message || "Failed to update setting." };
  }
}
