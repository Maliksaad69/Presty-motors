"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingCart,
  Check,
  ShieldCheck,
  Truck,
  Wrench,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { SerializedProduct } from "./InteractiveProductShowcase";
import { TestRideModal } from "@/components/home/TestRideModal";

interface ProductDetailViewProps {
  product: SerializedProduct & {
    images: { id: string; url: string; altText: string | null }[];
    relatedProducts: SerializedProduct[];
  };
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.url || product.primaryImage || ""
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [testRideOpen, setTestRideOpen] = useState(false);

  const inStock = product.stock > 0;
  const activePrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: activePrice,
      sku: product.sku,
      image: selectedImage || undefined,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const specsList = product.specifications
    ? Object.entries(product.specifications)
    : [];

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#E2E2E2] bg-[#F5F5F5] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-mono text-[#737373] uppercase tracking-wider overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#E10600]">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#E10600]">Catalog</Link>
            <span>/</span>
            <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-[#E10600]">
              {product.categoryName}
            </Link>
            <span>/</span>
            <span className="text-[#0B0B0B] font-bold truncate max-w-xs">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* Left: Gallery (Image Switcher + Thumbnails) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-16/10 sm:aspect-4/3 rounded border border-[#E2E2E2] bg-[#0B0B0B] overflow-hidden shadow-xl group">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-heading">
                  PRESTY MOTORS
                </div>
              )}

              {/* Red racing corner accent */}
              <div className="absolute top-0 left-0 w-16 h-1 bg-[#E10600]" />

              {/* Sale badge */}
              {hasDiscount && (
                <div className="absolute top-4 start-4 bg-[#E10600] text-white text-xs font-heading font-black uppercase tracking-wider px-3 py-1 rounded shadow-md">
                  Special Offer
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => {
                  const isSelected = selectedImage === img.url;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.url)}
                      className={`relative w-20 sm:w-24 aspect-16/10 rounded overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#E10600] shadow-md"
                          : "border-[#E2E2E2] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || product.title}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Technical Specifications Section */}
            <div className="pt-6 border-t border-[#E2E2E2] space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                <h3 className="font-heading text-lg font-black uppercase tracking-tight text-[#0B0B0B]">
                  Technical Specifications & Engineering
                </h3>
              </div>

              {specsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {specsList.map(([key, val]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded bg-[#F5F5F5] border border-[#E2E2E2]"
                    >
                      <span className="text-[#737373] font-medium">{key}</span>
                      <span className="font-heading font-black text-[#0B0B0B] uppercase text-end">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#737373] italic">
                  Full dyno sheet and mechanical specifications available on showroom inspection.
                </p>
              )}
            </div>
          </div>

          {/* Right: Machine Info, Pricing, Purchasing & Guarantees */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#737373] mb-2">
                <span className="text-[#E10600] font-bold">{product.categoryName}</span>
                <span>•</span>
                <span>SKU: {product.sku}</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#0B0B0B] leading-tight">
                {product.title}
              </h1>

              {/* Price & Stock Display */}
              <div className="mt-4 p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#737373] block mb-0.5">
                    Showroom Price (TTC)
                  </span>
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading text-2xl sm:text-3xl font-black text-[#E10600]">
                        {product.salePrice!.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: product.currency,
                        })}
                      </span>
                      <span className="text-sm text-[#737373] line-through">
                        {product.price.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: product.currency,
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="font-heading text-2xl sm:text-3xl font-black text-[#0B0B0B]">
                      {product.price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: product.currency,
                      })}
                    </span>
                  )}
                </div>

                <div className="text-end">
                  <span className="text-[10px] uppercase font-bold text-[#737373] block mb-0.5">
                    Availability
                  </span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        inStock ? "bg-[#16803C]" : "bg-neutral-300"
                      }`}
                    />
                    <span className={`text-xs font-bold ${inStock ? "text-[#16803C]" : "text-[#737373]"}`}>
                      {inStock ? `${product.stock} units ready` : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-[#0B0B0B]">
                Overview & Architecture
              </h3>
              <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                {product.shortDescription ||
                  "Engineered for demanding competitive conditions and amateur recreational riding alike. Built with a reinforced chassis, racing-grade shock absorbers, and instant throttle response."}
              </p>
            </div>

            {/* Quantity Selector & Primary CTA Button */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <label className="block text-[10px] font-heading font-bold uppercase text-[#737373] mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock || 1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full h-11 px-3 text-center text-sm font-bold border border-[#E2E2E2] rounded bg-white text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-heading font-bold uppercase text-transparent mb-1">
                    Order
                  </label>
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className={`w-full h-11 px-6 rounded font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98] ${
                      added
                        ? "bg-[#0B0B0B] text-white"
                        : inStock
                        ? "bg-[#E10600] hover:bg-[#B80500] text-white shadow-red-700/25"
                        : "bg-[#E2E2E2] text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart ({((activePrice) * qty).toLocaleString("fr-FR", { style: "currency", currency: product.currency })})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Secondary CTA: Book Test Ride */}
              <button
                onClick={() => setTestRideOpen(true)}
                className="w-full py-3 rounded bg-transparent hover:bg-[#F5F5F5] text-[#0B0B0B] font-heading font-black text-xs uppercase tracking-wider border border-[#0B0B0B] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#E10600]" />
                <span>Book Paris Showroom Test Ride</span>
              </button>
            </div>

            {/* Service & Guarantee Badges */}
            <div className="p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B0B0B] block font-heading uppercase text-xs">
                    Freight or Showroom Pickup
                  </strong>
                  <span className="text-[#737373] text-[11px]">
                    Collect ready-to-ride in Paris 16e or opt for secure domestic crated carrier delivery.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wrench className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B0B0B] block font-heading uppercase text-xs">
                    Complete PDI Preparation Included
                  </strong>
                  <span className="text-[#737373] text-[11px]">
                    Every machine is unpacked, greased, calibrated on dyno, and fluid-filled by our certified mechanics.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0B0B0B] block font-heading uppercase text-xs">
                    Official Manufacturer Warranty
                  </strong>
                  <span className="text-[#737373] text-[11px]">
                    Full coverage with authorized spare parts supply and dedicated technical support.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related Vehicles Section */}
        {product.relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E2E2E2]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#E10600]">
                  Recommended Lineup
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-black uppercase text-[#0B0B0B]">
                  Related Machines & Gear
                </h3>
              </div>
              <Link
                href="/shop"
                className="text-xs font-heading font-bold text-[#E10600] hover:text-[#0B0B0B] uppercase tracking-wider flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {product.relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.slug}`}
                  className="group rounded border border-[#E2E2E2] bg-white hover:border-[#0B0B0B] hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 bg-[#0B0B0B] overflow-hidden">
                    {rel.primaryImage && (
                      <Image
                        src={rel.primaryImage}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-0 left-0 w-0 group-hover:w-full h-0.5 bg-[#E10600] transition-all duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-mono text-[#737373] uppercase">{rel.categoryName}</p>
                    <h4 className="font-heading text-xs font-black uppercase text-[#0B0B0B] group-hover:text-[#E10600] transition-colors truncate">
                      {rel.title}
                    </h4>
                    <p className="font-heading text-sm font-black text-[#0B0B0B] mt-2">
                      {rel.price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: rel.currency,
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Ride Booking Modal */}
      <TestRideModal
        isOpen={testRideOpen}
        onClose={() => setTestRideOpen(false)}
      />
    </div>
  );
}
