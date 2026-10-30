"use client";

import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Eye, Check, Search, SlidersHorizontal, X } from "lucide-react";
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
  specifications?: Record<string, unknown> | null;
}

interface ShowcaseProps {
  products: SerializedProduct[];
  categories: { slug: string; name: string }[];
}

export function InteractiveProductShowcase({
  products,
  categories,
}: ShowcaseProps) {
  const tCat = useTranslations("catalogSection");
  const tCommon = useTranslations("common");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [inspectingProduct, setInspectingProduct] = useState<SerializedProduct | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const handleAddToCart = (product: SerializedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleOpenQuickView = (product: SerializedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInspectingProduct(product);
  };

  return (
    <div className="space-y-4">
      {/* Sleek Motorsport Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded border border-[#E2E2E2] bg-[#F5F5F5]">
        
        {/* Desktop Category Filter Tabs */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 text-[11px] font-heading font-medium uppercase tracking-wider rounded transition-all duration-150 cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#0B0B0B] text-white shadow-xs"
                : "bg-white text-neutral-700 hover:text-black border border-[#E2E2E2] hover:border-neutral-400"
            }`}
          >
            {tCommon("allModels")} ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.categorySlug === cat.slug).length;
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1.5 text-[11px] font-heading font-medium uppercase tracking-wider rounded transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#E10600] text-white shadow-xs"
                    : "bg-white text-neutral-700 hover:text-black border border-[#E2E2E2] hover:border-neutral-400"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Mobile Filter Button (Under 640px) */}
        <div className="sm:hidden flex items-center justify-between gap-2">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 h-9 px-3 bg-[#0B0B0B] text-white text-xs font-heading font-medium uppercase tracking-wider rounded border border-[#262626] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Filter Categories ({activeCategory === "all" ? "All" : categories.find(c => c.slug === activeCategory)?.name})</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Live Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tCat("liveFilterPlaceholder")}
              className="w-full text-xs ps-8 pe-2.5 py-1.5 h-9 bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] placeholder-neutral-400 focus:outline-hidden focus:border-[#E10600] transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc")}
              className="h-9 text-xs bg-white border border-[#E2E2E2] rounded px-2.5 font-medium text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] cursor-pointer"
            >
              <option value="featured">{tCat("sortFeatured")}</option>
              <option value="price-asc">{tCat("sortPriceAsc")}</option>
              <option value="price-desc">{tCat("sortPriceDesc")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Results Counter */}
      <div className="flex items-center justify-between text-xs text-[#737373] px-1">
        <span className="font-mono font-medium">{tCat("resultsFound", { count: filteredAndSorted.length })}</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[11px] text-[#E10600] hover:underline cursor-pointer uppercase font-medium tracking-wider"
          >
            {tCat("clearSearch")}
          </button>
        )}
      </div>

      {/* Responsive Product Grid: 4 cols on lg/xl, 3 on md, 2 on sm (min 520px), 1 on xs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <AnimatePresence>
          {filteredAndSorted.map((p) => {
            const isAdded = addedId === p.id;
            const inStock = p.stock > 0;
            const hasDiscount = p.salePrice !== null && p.salePrice < p.price;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                key={p.id}
                className="group rounded border border-[#E2E2E2] bg-white hover:border-[#0B0B0B] hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
              >
                {/* Photo & Badges Container */}
                <div className="relative aspect-16/10 bg-[#0B0B0B] overflow-hidden">
                  <Link href={`/products/${p.slug}`} className="block w-full h-full relative">
                    {p.primaryImage ? (
                      <Image
                        src={p.primaryImage}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-heading">
                        PRESTY MOTORS
                      </div>
                    )}
                  </Link>

                  {/* Corner red racing hairline on hover */}
                  <div className="absolute top-0 left-0 w-0 group-hover:w-full h-0.5 bg-[#E10600] transition-all duration-300 z-10" />

                  {/* Sale Badge */}
                  {hasDiscount && (
                    <div className="absolute top-2.5 start-2.5 z-10 bg-[#E10600] text-white text-[10px] font-heading font-medium uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                      Promo
                    </div>
                  )}

                  {/* Quick View Button on Image */}
                  <button
                    onClick={(e) => handleOpenQuickView(p, e)}
                    className="absolute bottom-2.5 end-2.5 z-10 h-7 px-2 bg-[#0B0B0B]/85 hover:bg-[#0B0B0B] text-white text-[10px] font-heading font-medium uppercase tracking-wider rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                    title={tCommon("specs")}
                  >
                    <Eye className="w-3 h-3 text-[#E10600]" />
                    <span>{tCommon("specs")}</span>
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Metadata line */}
                    <div className="flex items-center justify-between text-[10px] text-[#737373] font-mono uppercase tracking-wider mb-1">
                      <span className="truncate max-w-[65%]">{p.categoryName}</span>
                      <span className="font-medium text-[#0B0B0B]">{p.engineCapacity || p.ageGroup || p.sku}</span>
                    </div>

                    {/* Product Title */}
                    <Link href={`/products/${p.slug}`} className="block">
                      <h3 className="font-heading text-sm sm:text-base font-semibold text-[#0B0B0B] uppercase leading-snug line-clamp-1 group-hover:text-[#E10600] transition-colors">
                        {p.title}
                      </h3>
                    </Link>

                    {/* Short Description */}
                    <p className="text-[11px] text-[#737373] mt-1 line-clamp-2 leading-relaxed font-normal">
                      {p.shortDescription}
                    </p>

                    {/* Stock Status Indicator with #16803C */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          inStock ? "bg-[#16803C]" : "bg-neutral-300"
                        }`}
                      />
                      <span className={inStock ? "text-[#16803C] font-medium" : "text-[#737373]"}>
                        {inStock
                          ? tCat("inStockUnits", { count: p.stock })
                          : tCommon("outOfStock")}
                      </span>
                    </div>
                  </div>

                  {/* Price and Action Controls */}
                  <div className="pt-2.5 border-t border-[#E2E2E2] flex items-center justify-between gap-2">
                    <div>
                      {hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="font-heading text-base sm:text-lg font-semibold text-[#E10600] leading-none">
                            {p.salePrice!.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: p.currency,
                            })}
                          </span>
                          <span className="text-[10px] text-[#737373] line-through mt-0.5">
                            {p.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: p.currency,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="font-heading text-base sm:text-lg font-semibold text-[#0B0B0B]">
                          {p.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: p.currency,
                          })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(p, e)}
                        disabled={!inStock}
                        className={`h-8 px-3 rounded font-heading font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] ${
                          isAdded
                            ? "bg-[#0B0B0B] text-white"
                            : inStock
                            ? "bg-[#E10600] hover:bg-[#B80500] text-white shadow-red-700/20"
                            : "bg-[#E2E2E2] text-neutral-400 cursor-not-allowed"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
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
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mobile Filters Drawer Modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex sm:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative mt-auto w-full bg-white rounded-t-xl p-5 border-t border-[#E2E2E2] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#E2E2E2] pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#E10600]" />
                  <h3 className="font-heading font-semibold text-sm uppercase text-[#0B0B0B]">
                    Filter by Category
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close category filter drawer"
                  className="p-1.5 text-neutral-400 hover:text-black rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  aria-pressed={activeCategory === "all"}
                  onClick={() => {
                    setActiveCategory("all");
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full py-2.5 px-4 text-xs font-heading font-medium uppercase tracking-wider rounded text-start flex items-center justify-between border cursor-pointer ${
                    activeCategory === "all"
                      ? "bg-[#0B0B0B] text-white border-[#0B0B0B]"
                      : "bg-[#F5F5F5] text-[#0B0B0B] border-[#E2E2E2]"
                  }`}
                >
                  <span>{tCommon("allModels")}</span>
                  <span className="font-mono text-xs">({products.length})</span>
                </button>

                {categories.map((cat) => {
                  const count = products.filter((p) => p.categorySlug === cat.slug).length;
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setActiveCategory(cat.slug);
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full py-2.5 px-4 text-xs font-heading font-medium uppercase tracking-wider rounded text-start flex items-center justify-between border cursor-pointer ${
                        isActive
                          ? "bg-[#E10600] text-white border-[#E10600]"
                          : "bg-[#F5F5F5] text-[#0B0B0B] border-[#E2E2E2]"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="font-mono text-xs">({count})</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Quick-View Vehicle Specs Modal */}
      <VehicleQuickViewModal
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
      />
    </div>
  );
}
