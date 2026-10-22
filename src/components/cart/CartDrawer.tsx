"use client";

import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalCount } =
    useCart();
  const t = useTranslations("common");
  const nav = useTranslations("nav");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white border-l border-[#E2E2E2] text-[#0B0B0B] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#171717] flex items-center justify-between bg-[#0B0B0B] text-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#E10600] flex items-center justify-center text-white">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-heading text-sm font-black uppercase tracking-wider">
                    {nav("cart")} ({totalCount})
                  </h3>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-[#171717] rounded transition-colors cursor-pointer"
                  aria-label="Fermer le panier"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F5F5F5]">
                {items.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-white border border-[#E2E2E2] flex items-center justify-center text-neutral-400">
                      <ShoppingBag className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="text-xs font-semibold text-[#0B0B0B]">{t("cartEmpty")}</p>
                    <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                      Explore our competition motorcycles, quads, and rider gear in the showroom catalog.
                    </p>
                    <Link
                      href="/shop"
                      onClick={closeCart}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-black uppercase tracking-wider transition-colors mt-2"
                    >
                      <span>{t("shopNow")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className="flex gap-3 p-3 rounded border border-[#E2E2E2] bg-white shadow-2xs"
                    >
                      {item.image ? (
                        <div className="relative w-16 h-16 rounded bg-[#0B0B0B] overflow-hidden shrink-0 border border-[#E2E2E2]">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400 font-heading">
                          PM
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-heading text-xs font-bold text-[#0B0B0B] uppercase truncate leading-tight">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-neutral-400 hover:text-[#E10600] transition-colors p-1 cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] font-mono text-neutral-400">REF: {item.sku}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-100">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-[#E2E2E2] rounded bg-[#F5F5F5]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs text-neutral-600 hover:text-[#0B0B0B] transition-colors cursor-pointer"
                              aria-label="Diminuer la quantité"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="px-2 text-[11px] font-bold text-[#0B0B0B]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-neutral-600 hover:text-[#0B0B0B] transition-colors cursor-pointer"
                              aria-label="Augmenter la quantité"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <span className="font-heading text-sm font-black text-[#E10600]">
                            {(item.price * item.quantity).toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout CTA */}
              {items.length > 0 && (
                <div className="p-4 border-t border-[#E2E2E2] bg-white space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#737373] uppercase tracking-wider text-[11px] font-bold font-heading">
                      {t("subtotal")}
                    </span>
                    <span className="font-heading text-xl font-black text-[#0B0B0B]">
                      {subtotal.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-center text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-red-600/20 cursor-pointer active:scale-[0.98]"
                  >
                    <span>{t("checkout")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full py-2.5 rounded border border-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-white text-[#0B0B0B] font-heading font-black text-center text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View & Manage Full Cart</span>
                  </Link>

                  <p className="text-[10px] text-[#737373] text-center">
                    {t("taxIncludedNotice")}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
