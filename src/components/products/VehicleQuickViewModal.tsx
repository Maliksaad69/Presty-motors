"use client";

import { useCart } from "@/lib/cart-context";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Check, ExternalLink, Gauge, ArrowRight } from "lucide-react";
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
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <div className="min-h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white text-[#0A0A0A] rounded border border-neutral-200 shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-black text-white">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                  Fiche Technique • SKU: {product.sku}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product Header & Media */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 relative aspect-4/3 bg-neutral-900 rounded overflow-hidden border border-neutral-200">
                  {product.primaryImage ? (
                    <Image
                      src={product.primaryImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-heading">
                      NO IMAGE
                    </div>
                  )}
                </div>

                <div className="sm:col-span-7 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#DC2626] tracking-wider">
                    {product.categoryName} • {product.engineCapacity || product.ageGroup}
                  </span>
                  <h3 className="font-heading text-xl font-black uppercase text-[#0A0A0A] leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {product.shortDescription}
                  </p>

                  <div className="pt-2 flex items-baseline gap-2">
                    {product.salePrice ? (
                      <>
                        <span className="font-heading text-2xl font-black text-[#DC2626]">
                          {product.salePrice.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: product.currency,
                          })}
                        </span>
                        <span className="text-xs text-neutral-400 line-through">
                          {product.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: product.currency,
                          })}
                        </span>
                      </>
                    ) : (
                      <span className="font-heading text-2xl font-black text-[#0A0A0A]">
                        {product.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: product.currency,
                        })}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-medium text-neutral-500">
                    Disponibilité :{" "}
                    <span className={inStock ? "text-black font-bold" : "text-neutral-400"}>
                      {inStock ? `${product.stock} exemplaires en stock` : "Rupture temporaire"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Technical Specifications Table */}
              {specsList.length > 0 && (
                <div className="border border-neutral-200 rounded overflow-hidden">
                  <div className="bg-neutral-100 px-3 py-2 border-b border-neutral-200">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                      Spécifications Mécaniques & Châssis
                    </h4>
                  </div>
                  <dl className="divide-y divide-neutral-100 text-xs">
                    {specsList.map(([key, value]) => (
                      <div
                        key={key}
                        className="px-3 py-2 grid grid-cols-3 gap-2 hover:bg-neutral-50"
                      >
                        <dt className="text-neutral-500 font-medium">{key}</dt>
                        <dd className="col-span-2 text-neutral-900 font-semibold">
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-[#DC2626] flex items-center gap-1 transition-colors"
              >
                <span>Voir fiche complète</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center border border-neutral-300 rounded bg-white">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-2.5 py-1 text-xs text-neutral-600 hover:text-black"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-2.5 py-1 text-xs text-neutral-600 hover:text-black"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!inStock}
                  className={`flex-1 sm:flex-initial px-5 py-2.5 rounded font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 ${
                    added
                      ? "bg-black text-white"
                      : inStock
                      ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs"
                      : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Ajouté !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Ajouter au panier</span>
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
