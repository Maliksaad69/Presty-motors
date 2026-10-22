"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart, Check } from "lucide-react";

export interface HeroVehicle {
  id: string;
  slug: string;
  sku: string;
  title: string;
  subtitle: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  image: string;
  engine: string;
  powerOrTransmission: string;
  weight: string;
  seatHeight: string;
  description: string;
}

interface DynamicHeroShowcaseProps {
  vehicles: HeroVehicle[];
}

export function DynamicHeroShowcase({ vehicles }: DynamicHeroShowcaseProps) {
  const t = useTranslations("hero");
  const telem = useTranslations("telemetry");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const current = vehicles[selectedIndex] || vehicles[0];

  const handleAddToCart = () => {
    if (!current) return;
    addItem({
      id: current.id,
      title: current.title,
      price: current.salePrice ?? current.price,
      sku: current.sku,
      image: current.image,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="relative overflow-hidden bg-[#0B0B0B] text-white py-12 sm:py-16 lg:py-20 border-b border-[#171717]">
      {/* Background motorsport grid texture */}
      <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(#E10600_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Headline, Telemetry HUD & CTAs */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-heading font-black uppercase tracking-widest text-[#E10600]">
                {t("badge")}
              </span>
            </div>

            {/* Bold Motorsport Title */}
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-[1.08]">
              {t("title")}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Interactive Telemetry HUD (Live Specs of Selected Machine) */}
            <div className="p-3.5 sm:p-4 rounded border border-[#262626] bg-[#171717]/90 backdrop-blur-xs space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <span className="text-[10px] font-heading font-black uppercase tracking-wider text-neutral-400">
                  {telem("title")}
                </span>
                <span className="text-[10px] font-mono font-bold text-[#E10600]">
                  {telem("ref")}: {current?.sku}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-start">
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold block">
                    {telem("displacement")}
                  </span>
                  <span className="font-heading text-sm sm:text-base font-bold text-white tracking-wide">
                    {current?.engine}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold block">
                    {telem("transmission")}
                  </span>
                  <span className="font-heading text-sm sm:text-base font-bold text-white tracking-wide truncate block">
                    {current?.powerOrTransmission}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold block">
                    {telem("weight")}
                  </span>
                  <span className="font-heading text-sm sm:text-base font-bold text-white tracking-wide">
                    {current?.weight}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 font-semibold block">
                    {telem("seatHeight")}
                  </span>
                  <span className="font-heading text-sm sm:text-base font-bold text-white tracking-wide">
                    {current?.seatHeight}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs & Quick Add */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`px-6 py-3 rounded font-heading font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98] ${
                  added
                    ? "bg-white text-[#0B0B0B]"
                    : "bg-[#E10600] hover:bg-[#B80500] text-white shadow-red-700/25"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-[#E10600]" />
                    <span>{telem("added")}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{telem("orderModel")}</span>
                  </>
                )}
              </button>

              <Link
                href="/shop"
                className="px-5 py-3 rounded bg-transparent hover:bg-[#171717] text-white font-heading font-bold text-xs sm:text-sm uppercase tracking-wider border border-neutral-700 hover:border-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{t("ctaShop")}</span>
                <ArrowRight className="w-4 h-4 text-[#E10600]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Machine Showcase & Selector */}
          <div className="lg:col-span-6 flex flex-col gap-3.5">
            {/* Visual Display Container */}
            <div className="relative rounded overflow-hidden border border-[#262626] bg-[#0B0B0B] aspect-16/10 shadow-2xl group">
              <AnimatePresence mode="wait">
                {current && (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={current.image}
                      alt={current.title}
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#0B0B0B] via-[#0B0B0B]/30 to-transparent" />

                    {/* Overlaid specs banner */}
                    <div className="absolute bottom-0 inset-x-0 p-3.5 border-t border-[#262626] bg-[#0B0B0B]/90 backdrop-blur-md flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <p className="text-[10px] font-heading font-black text-[#E10600] uppercase tracking-wider">
                          {current.subtitle}
                        </p>
                        <h3 className="font-heading text-sm sm:text-base font-black text-white uppercase truncate">
                          {current.title}
                        </h3>
                      </div>
                      <div className="text-end shrink-0">
                        {current.salePrice ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-heading text-base sm:text-lg font-black text-[#E10600]">
                              {current.salePrice.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: current.currency,
                              })}
                            </span>
                            <span className="text-[10px] text-neutral-400 line-through">
                              {current.price.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: current.currency,
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="font-heading text-base sm:text-lg font-black text-white">
                            {current.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: current.currency,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive Model Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {vehicles.map((v, idx) => {
                const isActive = selectedIndex === idx;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-2.5 rounded text-left transition-all duration-150 border cursor-pointer ${
                      isActive
                        ? "bg-[#171717] border-[#E10600] text-white shadow-xs"
                        : "bg-[#0B0B0B] border-[#262626] text-neutral-400 hover:text-white hover:border-neutral-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase font-heading font-black text-[#E10600]">
                        {v.engine}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                      )}
                    </div>
                    <p className="font-heading text-xs font-bold uppercase truncate text-white">
                      {v.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
