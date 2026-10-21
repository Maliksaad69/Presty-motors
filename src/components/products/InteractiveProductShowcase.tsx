"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Eye, Check, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { VehicleQuickViewModal } from "./VehicleQuickViewModal";

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
  specifications?: Record<string, any> | null;
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [inspectingProduct, setInspectingProduct] = useState<SerializedProduct | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addItem } = useCart();

  const filteredAndSorted = useMemo(() => {
    let result = products;

    // Filter by Category
    if (activeCategory !== "all") {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.engineCapacity && p.engineCapacity.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      return [...result].sort(
        (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
      );
    }
    if (sortBy === "price-desc") {
      return [...result].sort(
        (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
      );
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy]);

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
    <div className="space-y-6">
      {/* Interactive Toolbar: Live Search, Category Tabs & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded border border-neutral-200 bg-neutral-50/70">
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all duration-150 ${
              activeCategory === "all"
                ? "bg-black text-white"
                : "bg-white text-neutral-600 hover:text-black border border-neutral-200"
            }`}
          >
            {translations.allCategories} ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.categorySlug === cat.slug).length;
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all duration-150 ${
                  isActive
                    ? "bg-[#DC2626] text-white shadow-xs"
                    : "bg-white text-neutral-600 hover:text-black border border-neutral-200"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Live Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer en direct..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-[#DC2626]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white border border-neutral-200 rounded px-2.5 py-1.5 font-medium text-neutral-700 focus:outline-hidden focus:border-[#DC2626] cursor-pointer"
            >
              <option value="featured">Tri : Vedettes</option>
              <option value="price-asc">Prix : Croissant</option>
              <option value="price-desc">Prix : Décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Results Counter */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <span>{filteredAndSorted.length} résultat(s) trouvé(s)</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[11px] text-[#DC2626] hover:underline"
          >
            Effacer la recherche
          </button>
        )}
      </div>

      {/* Animated Product Grid (Refined, Smaller Typography, NO BADGES) */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAndSorted.map((p) => {
            const isAdded = addedId === p.id;
            const inStock = p.stock > 0;
            const activePrice = p.salePrice ?? p.price;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                key={p.id}
                className="group rounded border border-neutral-200 bg-white hover:border-black hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Photo Header (NO BADGES) */}
                <div className="relative aspect-16/10 bg-neutral-950 overflow-hidden">
                  {p.primaryImage ? (
                    <Image
                      src={p.primaryImage}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600 font-heading">
                      NO PHOTO
                    </div>
                  )}

                  {/* Corner red accent hairline on hover */}
                  <div className="absolute top-0 left-0 w-0 group-hover:w-full h-0.5 bg-[#DC2626] transition-all duration-300" />
                </div>

                {/* Content Section (Refined, Smaller Typography) */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Compact Metadata line */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-semibold uppercase tracking-wider mb-1">
                      <span>{p.categoryName}</span>
                      <span>{p.engineCapacity || p.ageGroup || p.sku}</span>
                    </div>

                    {/* Compact Heading: text-base sm:text-lg font-bold */}
                    <h3 className="font-heading text-base sm:text-lg font-bold text-[#0A0A0A] uppercase leading-snug group-hover:text-[#DC2626] transition-colors">
                      {p.title}
                    </h3>

                    <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {p.shortDescription}
                    </p>

                    {/* Clean stock indicator (No Badge) */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          inStock ? "bg-[#0A0A0A]" : "bg-neutral-300"
                        }`}
                      />
                      <span>
                        {inStock
                          ? `${p.stock} en stock`
                          : translations.outOfStock}
                      </span>
                    </div>
                  </div>

                  {/* Compact Price and Action Controls */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <div>
                      {p.salePrice ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading text-lg sm:text-xl font-black text-[#DC2626]">
                            {p.salePrice.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: p.currency,
                            })}
                          </span>
                          <span className="text-[11px] text-neutral-400 line-through">
                            {p.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: p.currency,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="font-heading text-lg sm:text-xl font-black text-[#0A0A0A]">
                          {p.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: p.currency,
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Inspect Specs Modal trigger */}
                      <button
                        onClick={() => setInspectingProduct(p)}
                        className="px-2.5 py-2 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        title="Fiche technique détaillée"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Specs</span>
                      </button>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={!inStock}
                        className={`px-3 py-2 rounded font-heading font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 ${
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

      {/* Interactive Quick-View Vehicle Specs Modal */}
      <VehicleQuickViewModal
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
      />
    </div>
  );
}
