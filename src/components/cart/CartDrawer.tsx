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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white border-l border-neutral-200 text-[#0A0A0A] flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-black text-white">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-[#DC2626]" />
                  <h3 className="font-heading text-xl font-black uppercase tracking-tight">
                    {nav("cart")} ({totalCount})
                  </h3>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                  aria-label="Fermer le panier"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium">Votre panier est actuellement vide</p>
                    <button
                      onClick={closeCart}
                      className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#DC2626] hover:underline"
                    >
                      {t("shopNow")} →
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className="flex gap-4 p-4 rounded-md border border-neutral-200 bg-neutral-50"
                    >
                      {item.image && (
                        <div className="relative w-20 h-20 rounded bg-white overflow-hidden shrink-0 border border-neutral-200">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-heading text-base font-bold text-[#0A0A0A] uppercase truncate">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-neutral-400 hover:text-[#DC2626] transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-neutral-500">SKU: {item.sku}</p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-neutral-300 rounded bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-neutral-600 hover:text-black transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-[#0A0A0A]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-neutral-600 hover:text-black transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-heading text-lg font-black text-[#DC2626]">
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

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-6 border-t border-neutral-200 bg-white space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                      Sous-total
                    </span>
                    <span className="font-heading text-2xl font-black text-[#0A0A0A]">
                      {subtotal.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-4 rounded-md bg-[#DC2626] hover:bg-[#B91C1C] text-white font-heading font-black text-center text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    <span>Commander</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <p className="text-[11px] text-neutral-400 text-center">
                    TVA incluse. Frais de port calculés à l'étape suivante.
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
