"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ArrowRight, Eye, Check } from "lucide-react";

export interface SerializedProduct {
  id: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  currency: string;
  vehicleType: string;
  ageGroup: string | null;
  engineCapacity: string | null;
  categorySlug: string;
  categoryName: string;
  title: string;
  shortDescription: string;
  primaryImage: string | null;
  stock: number;
}

interface ShowcaseProps {
  products: SerializedProduct[];
  categories: { slug: string; name: string }[];
  translations: {
    allCategories: string;
    addToCart: string;
    added: string;
    viewDetails: string;
    inStock: string;
    outOfStock: string;
  };
}

export function InteractiveProductShowcase({
  products,
  categories,
  translations,
}: ShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useCart();

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.categorySlug === activeCategory);

  const handleAddToCart = (product: SerializedProduct) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.salePrice ?? product.price,
      sku: product.sku,
      image: product.primaryImage || undefined,
      quantity: 1,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Category Filter Tabs (Interactive) */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 ${
            activeCategory === "all"
              ? "bg-black text-white"
              : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200"
          }`}
        >
          {translations.allCategories}
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 ${
              activeCategory === cat.slug
                ? "bg-[#DC2626] text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Animated Product Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filtered.map((p) => {
            const isAdded = addedId === p.id;
            const inStock = p.stock > 0;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                key={p.id}
                className="group rounded border border-neutral-200 bg-white hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Image Section (NO BADGES) */}
                <div className="relative aspect-16/10 bg-neutral-950 overflow-hidden">
                  {p.primaryImage ? (
                    <Image
                      src={p.primaryImage}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 font-heading">
                      NO IMAGE
                    </div>
                  )}

                  {/* Red corner accent line on hover */}
                  <div className="absolute top-0 left-0 w-0 group-hover:w-full h-1 bg-[#DC2626] transition-all duration-300" />
                </div>

                {/* Content Section (NO BADGES - Clean Typography) */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-1.5">
                      <span>{p.categoryName}</span>
                      <span>{p.engineCapacity || p.ageGroup || p.sku}</span>
                    </div>

                    <h3 className="font-heading text-2xl font-black text-[#0A0A0A] uppercase leading-tight group-hover:text-[#DC2626] transition-colors">
                      {p.title}
                    </h3>

                    <p className="text-sm text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                      {p.shortDescription}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-500">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          inStock ? "bg-black" : "bg-neutral-300"
                        }`}
                      />
                      <span>
                        {inStock
                          ? `${p.stock} disponibles en stock`
                          : translations.outOfStock}
                      </span>
                    </div>
                  </div>

                  {/* Price & Interactive Actions */}
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div>
                      {p.salePrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading text-2xl font-black text-[#DC2626]">
                            {p.salePrice.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: p.currency,
                            })}
                          </span>
                          <span className="text-xs text-neutral-400 line-through">
                            {p.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: p.currency,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="font-heading text-2xl font-black text-[#0A0A0A]">
                          {p.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: p.currency,
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/products/${p.slug}`}
                        className="p-2.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        title={translations.viewDetails}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={!inStock}
                        className={`px-3.5 py-2.5 rounded font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
                          isAdded
                            ? "bg-black text-white"
                            : inStock
                            ? "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{translations.added}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{translations.addToCart}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
