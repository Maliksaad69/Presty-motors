"use client";

import { useCart } from "@/lib/cart-context";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SerializedProduct } from "./InteractiveProductShowcase";

interface VehicleQuickViewModalProps {
  product: SerializedProduct | null;
  onClose: () => void;
}

export function VehicleQuickViewModal({
  product,
  onClose,
}: VehicleQuickViewModalProps) {
  const { addItem } = useCart();
  const tCommon = useTranslations("common");
  const tCat = useTranslations("catalogSection");

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const inStock = product.stock > 0;
  const activePrice = product.salePrice ?? product.price;

  const handleAdd = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: activePrice,
      sku: product.sku,
      image: product.primaryImage || undefined,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const specsList = product.specifications
    ? Object.entries(product.specifications)
    : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white text-[#0B0B0B] rounded border border-[#E2E2E2] shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#171717] bg-[#0B0B0B] text-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                <span className="text-[11px] font-heading font-black uppercase tracking-wider text-neutral-300">
                  {tCommon("specs")} • SKU: {product.sku}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#171717] transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product Header & Media */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-center">
                <div className="sm:col-span-5 relative aspect-4/3 bg-[#0B0B0B] rounded overflow-hidden border border-[#E2E2E2]">
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-heading">
                      PRESTY MOTORS
                    </div>
                  )}
                </div>

                <div className="sm:col-span-7 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#737373] uppercase tracking-wider">
                    <span>{product.categoryName}</span>
                    <span>•</span>
                    <span className="text-[#0B0B0B] font-bold">{product.engineCapacity || product.vehicleType}</span>
                  </div>

                  <h3 className="font-heading text-lg sm:text-xl font-black text-[#0B0B0B] uppercase leading-tight">
                    {product.title}
                  </h3>

                  <p className="text-xs text-[#737373] leading-relaxed line-clamp-3">
                    {product.shortDescription}
                  </p>

                  <div className="pt-2 flex items-baseline gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="font-heading text-xl font-black text-[#E10600]">
                          {product.salePrice.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: product.currency,
                          })}
                        </span>
                        <span className="text-xs text-[#737373] line-through">
                          {product.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: product.currency,
                          })}
                        </span>
                      </>
                    ) : (
                      <span className="font-heading text-xl font-black text-[#0B0B0B]">
                        {product.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: product.currency,
                        })}
                      </span>
                    )}

                    <span className={`text-[11px] font-semibold ms-auto ${inStock ? "text-[#16803C]" : "text-[#737373]"}`}>
                      {inStock ? `● ${tCat("inStockUnits", { count: product.stock })}` : tCommon("outOfStock")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="space-y-2 pt-2 border-t border-[#E2E2E2]">
                <h4 className="font-heading text-xs font-black uppercase tracking-wider text-[#0B0B0B]">
                  Technical Spec Sheet
                </h4>

                {specsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {specsList.map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 rounded bg-[#F5F5F5] border border-[#E2E2E2]"
                      >
                        <span className="text-[#737373] font-medium">{key}</span>
                        <span className="font-heading font-bold text-[#0B0B0B] uppercase text-end">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">
                    Specifications available upon showroom inspection.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-[#E2E2E2] bg-[#F5F5F5] flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="text-xs font-heading font-black text-[#0B0B0B] hover:text-[#E10600] uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <span>{tCommon("viewFullSpecs")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E10600]" />
              </Link>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={product.stock || 1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 h-9 px-2 text-center text-xs font-bold border border-[#E2E2E2] rounded bg-white text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
                />

                <button
                  onClick={handleAdd}
                  disabled={!inStock}
                  className={`h-9 px-5 rounded font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-md ${
                    added
                      ? "bg-[#0B0B0B] text-white"
                      : inStock
                      ? "bg-[#E10600] hover:bg-[#B80500] text-white shadow-red-700/20"
                      : "bg-[#E2E2E2] text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{tCommon("added")}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{tCommon("addToCart")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
