"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useTranslations, useLocale } from "next-intl";
import { SerializedProduct } from "@/components/products/InteractiveProductShowcase";
import { VehicleQuickViewModal } from "@/components/products/VehicleQuickViewModal";
import {
  Search,
  SlidersHorizontal,
  X,
  ShoppingCart,
  Eye,
  Check,
  RotateCcw,
  Filter,
} from "lucide-react";

interface CategoryOption {
  slug: string;
  name: string;
}

interface ShopCatalogViewProps {
  initialProducts: SerializedProduct[];
  categories: CategoryOption[];
  initialCategory?: string;
}

export function ShopCatalogView({
  initialProducts,
  categories,
  initialCategory = "all",
}: ShopCatalogViewProps) {
  const t = useTranslations("catalog");
  const locale = useLocale();
  const { addItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [inspectingProduct, setInspectingProduct] = useState<SerializedProduct | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Available vehicle types
  const vehicleTypes = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.vehicleType) set.add(p.vehicleType);
    });
    return Array.from(set);
  }, [initialProducts]);

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        if (selectedCategory !== "all" && p.categorySlug !== selectedCategory) return false;
        if (selectedVehicleType !== "all" && p.vehicleType !== selectedVehicleType) return false;
        if (inStockOnly && p.stock <= 0) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            p.title.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q) ||
            (p.engineCapacity && p.engineCapacity.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        return 0;
      });
  }, [initialProducts, selectedCategory, selectedVehicleType, inStockOnly, searchQuery, sortBy]);

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

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedVehicleType("all");
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("featured");
  };

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedVehicleType !== "all" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner / Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-[#737373] uppercase tracking-wider mb-2 font-mono">
          <Link href="/" className="hover:text-[#E10600]">{t("home")}</Link>
          <span>/</span>
          <span className="text-[#0B0B0B] font-medium">{t("catalog")}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase tracking-tight text-[#0B0B0B]">
              {t("pageTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-xl font-normal">
              {t("pageSubtitle")}
            </p>
          </div>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded bg-[#0B0B0B] text-white font-heading font-medium text-xs uppercase tracking-wider self-start sm:self-auto cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E10600]" />
            <span>{t("filtersBtn", { count: activeFiltersCount })}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar (Desktop) + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] sticky top-24">
          <div className="flex items-center justify-between border-b border-[#E2E2E2] pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E10600]" />
              <h2 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#0B0B0B]">
                {t("filterMachines")}
              </h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-medium text-[#E10600] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t("resetFilters")}</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-heading font-medium uppercase text-[#0B0B0B] block">
              {t("searchLabel")}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 rtl:left-auto rtl:right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full text-xs pl-8 pr-2.5 rtl:pl-2.5 rtl:pr-8 py-1.5 h-9 bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] placeholder-neutral-400 focus:outline-hidden focus:border-[#E10600]"
              />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-heading font-medium uppercase text-[#0B0B0B] block">
              {t("categoryLabel")}
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                aria-pressed={selectedCategory === "all"}
                className={`w-full py-2 px-3 text-xs font-heading font-medium uppercase rounded text-start flex items-center justify-between transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#0B0B0B] text-white"
                    : "bg-white text-neutral-700 hover:text-black border border-[#E2E2E2]"
                }`}
              >
                <span>{t("allCategories")}</span>
                <span className="font-mono text-[10px]">({initialProducts.length})</span>
              </button>

              {categories.map((cat) => {
                const count = initialProducts.filter((p) => p.categorySlug === cat.slug).length;
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    aria-pressed={isSelected}
                    className={`w-full py-2 px-3 text-xs font-heading font-medium uppercase rounded text-start flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#E10600] text-white"
                        : "bg-white text-neutral-700 hover:text-black border border-[#E2E2E2]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="font-mono text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Type Filter */}
          {vehicleTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-heading font-medium uppercase text-[#0B0B0B] block">
                {t("vehicleType")}
              </label>
              <select
                value={selectedVehicleType}
                onChange={(e) => setSelectedVehicleType(e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
              >
                <option value="all">{t("allVehicleTypes")}</option>
                {vehicleTypes.map((vt) => (
                  <option key={vt} value={vt}>
                    {vt.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* In-Stock Only Toggle */}
          <div className="pt-2 border-t border-[#E2E2E2]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-heading font-medium uppercase text-[#0B0B0B]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-[#E10600] focus:ring-[#E10600] cursor-pointer"
              />
              <span>{t("inStockOnly")}</span>
            </label>
          </div>
        </aside>

        {/* Product Grid & Controls */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Top Sort Bar & Results Info */}
          <div className="flex items-center justify-between p-3 rounded border border-[#E2E2E2] bg-[#F5F5F5]">
            <div className="text-xs text-[#737373] font-mono">
              <strong className="text-[#0B0B0B] font-medium">{t("machinesFound", { count: filteredProducts.length })}</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-heading font-medium uppercase text-[#737373] hidden sm:inline">
                {t("sortBy")}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "featured" | "price-asc" | "price-desc")}
                className="h-8 px-2 text-xs bg-white border border-[#E2E2E2] rounded font-medium text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] cursor-pointer"
              >
                <option value="featured">{t("featuredFirst")}</option>
                <option value="price-asc">{t("priceLowHigh")}</option>
                <option value="price-desc">{t("priceHighLow")}</option>
              </select>
            </div>
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 rounded border border-[#E2E2E2] bg-white space-y-3">
              <p className="font-heading text-lg font-semibold uppercase text-[#0B0B0B]">
                {t("noProducts")}
              </p>
              <p className="text-xs text-[#737373] max-w-sm mx-auto font-normal">
                {t("noProductsDesc")}
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-5 py-2.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-medium uppercase tracking-wider transition-colors"
              >
                {t("resetAllFilters")}
              </button>
            </div>
          ) : (
            /* Responsive Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredProducts.map((p) => {
                const isAdded = addedId === p.id;
                const inStock = p.stock > 0;
                const hasDiscount = p.salePrice !== null && p.salePrice < p.price;

                return (
                  <div
                    key={p.id}
                    className="group rounded border border-[#E2E2E2] bg-white hover:border-[#0B0B0B] hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Media */}
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

                      <div className="absolute top-0 left-0 w-0 group-hover:w-full h-0.5 bg-[#E10600] transition-all duration-300 z-10" />

                      {hasDiscount && (
                        <div className="absolute top-2.5 start-2.5 z-10 bg-[#E10600] text-white text-[10px] font-heading font-medium uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                          {t("promo")}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setInspectingProduct(p);
                        }}
                        aria-label={`${t("specs")} - ${p.title}`}
                        className="absolute bottom-2.5 end-2.5 z-10 h-7 px-2 bg-[#0B0B0B]/85 hover:bg-[#0B0B0B] text-white text-[10px] font-heading font-medium uppercase tracking-wider rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-[#E10600]" />
                        <span>{t("specs")}</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-[#737373] font-mono uppercase tracking-wider mb-1">
                          <span className="truncate max-w-[65%]">{p.categoryName}</span>
                          <span className="font-medium text-[#0B0B0B]">{p.engineCapacity || p.sku}</span>
                        </div>

                        <Link href={`/products/${p.slug}`}>
                          <h3 className="font-heading text-sm sm:text-base font-semibold text-[#0B0B0B] uppercase leading-snug line-clamp-1 group-hover:text-[#E10600] transition-colors">
                            {p.title}
                          </h3>
                        </Link>

                        <p className="text-[11px] text-[#737373] mt-1 line-clamp-2 leading-relaxed font-normal">
                          {p.shortDescription}
                        </p>

                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              inStock ? "bg-[#16803C]" : "bg-neutral-300"
                            }`}
                          />
                          <span className={inStock ? "text-[#16803C] font-medium" : "text-[#737373]"}>
                            {inStock ? t("inStock", { count: p.stock }) : t("outOfStock")}
                          </span>
                        </div>
                      </div>

                      {/* Pricing and Action */}
                      <div className="pt-2.5 border-t border-[#E2E2E2] flex items-center justify-between gap-2">
                        <div>
                          {hasDiscount ? (
                            <div className="flex flex-col">
                              <span className="font-heading text-base font-semibold text-[#E10600] leading-none">
                                {p.salePrice!.toLocaleString(locale, {
                                  style: "currency",
                                  currency: p.currency,
                                })}
                              </span>
                              <span className="text-[10px] text-[#737373] line-through mt-0.5">
                                {p.price.toLocaleString(locale, {
                                  style: "currency",
                                  currency: p.currency,
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="font-heading text-base font-semibold text-[#0B0B0B]">
                              {p.price.toLocaleString(locale, {
                                style: "currency",
                                currency: p.currency,
                              })}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(p, e)}
                          disabled={!inStock}
                          aria-label={`${t("add")} - ${p.title}`}
                          className={`h-8 px-3 rounded font-heading font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] ${
                            isAdded
                              ? "bg-[#0B0B0B] text-white"
                              : inStock
                              ? "bg-[#E10600] hover:bg-[#B80500] text-white"
                              : "bg-[#E2E2E2] text-neutral-400 cursor-not-allowed"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{t("added")}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>{t("add")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative ml-auto rtl:ml-0 rtl:mr-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E2E2E2] p-4 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E10600]" />
                <h3 className="font-heading font-semibold text-sm uppercase text-[#0B0B0B]">
                  {t("filterMachines")}
                </h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 p-4 sm:p-5 overflow-y-auto popup-scroll-light flex-1">

              {/* Mobile Search */}
              <div>
                <label className="text-[11px] font-heading font-medium uppercase text-[#0B0B0B] block mb-1">
                  {t("searchLabel")}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full text-xs px-3 py-2 bg-[#F5F5F5] border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="text-[11px] font-heading font-medium uppercase text-[#0B0B0B] block mb-2">
                  {t("categoryLabel")}
                </label>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full py-2 px-3 text-xs font-heading font-medium uppercase rounded text-start flex justify-between ${
                      selectedCategory === "all"
                        ? "bg-[#0B0B0B] text-white"
                        : "bg-[#F5F5F5] text-[#0B0B0B] border border-[#E2E2E2]"
                    }`}
                  >
                    <span>{t("allCategories")}</span>
                    <span>({initialProducts.length})</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.slug}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`w-full py-2 px-3 text-xs font-heading font-medium uppercase rounded text-start flex justify-between ${
                        selectedCategory === c.slug
                          ? "bg-[#E10600] text-white"
                          : "bg-[#F5F5F5] text-[#0B0B0B] border border-[#E2E2E2]"
                      }`}
                    >
                      <span>{c.name}</span>
                      <span>({initialProducts.filter((p) => p.categorySlug === c.slug).length})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Type Filter for Mobile */}
              {vehicleTypes.length > 0 && (
                <div>
                  <label className="text-[11px] font-heading font-medium uppercase text-[#0B0B0B] block mb-1">
                    {t("vehicleType")}
                  </label>
                  <select
                    value={selectedVehicleType}
                    onChange={(e) => setSelectedVehicleType(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs bg-[#F5F5F5] border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
                  >
                    <option value="all">{t("allVehicleTypes")}</option>
                    {vehicleTypes.map((vt) => (
                      <option key={vt} value={vt}>
                        {vt.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* In-Stock Toggle */}
              <div className="pt-2 border-t border-[#E2E2E2]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-heading font-medium uppercase text-[#0B0B0B]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E10600]"
                  />
                  <span>{t("inStockOnly")}</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-[#E2E2E2] space-y-2 shrink-0 bg-white shadow-xs">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3 rounded bg-[#E10600] text-white font-heading font-medium text-xs uppercase tracking-wider cursor-pointer"
              >
                {t("filtersBtn", { count: filteredProducts.length })}
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full py-2.5 rounded bg-[#F5F5F5] text-[#0B0B0B] font-heading font-medium text-xs uppercase tracking-wider border border-[#E2E2E2] cursor-pointer"
              >
                {t("resetFilters")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <VehicleQuickViewModal
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
      />
    </div>
  );
}
