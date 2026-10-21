"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShoppingCart, Check, Gauge, Zap, Weight, ArrowUpRight } from "lucide-react";

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
  ctaShopText: string;
  ctaShowroomText: string;
}

export function DynamicHeroShowcase({
  vehicles,
  ctaShopText,
  ctaShowroomText,
}: DynamicHeroShowcaseProps) {
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
    <section className="relative overflow-hidden bg-[#0A0A0A] text-white py-14 lg:py-20 border-b border-neutral-900">
      {/* Background grid texture */}
      <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(#DC2626_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Compact Headline, Telemetry HUD & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626]">
                Collection Officielle Showroom
              </span>
            </div>

            {/* Downscaled, compact modern title */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-[1.05]">
              PUISSANCE. <span className="text-[#DC2626]">ADRÉNALINE.</span> PRÉCISION.
            </h1>

            <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
              Motos de compétition, d'initiation et quads tout-terrain sélectionnés pour leur rigueur mécanique et leurs performances éprouvées.
            </p>

            {/* Interactive Telemetry HUD (Live Specs of Selected Machine) */}
            <div className="p-4 rounded border border-neutral-800 bg-neutral-950/80 backdrop-blur-xs space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Télémétrie Machine
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#DC2626]">
                  REF: {current.sku}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-left">
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">
                    Cylindrée
                  </span>
                  <span className="font-heading text-base font-bold text-white tracking-wide">
                    {current.engine}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">
                    Boîte / Réf
                  </span>
                  <span className="font-heading text-base font-bold text-white tracking-wide truncate block">
                    {current.powerOrTransmission}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">
                    Poids
                  </span>
                  <span className="font-heading text-base font-bold text-white tracking-wide">
                    {current.weight}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-neutral-500 font-semibold block">
                    Selle / Garde
                  </span>
                  <span className="font-heading text-base font-bold text-white tracking-wide">
                    {current.seatHeight}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs & Quick Add */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`px-6 py-3 rounded font-heading font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-all duration-200 ${
                  added
                    ? "bg-white text-black"
                    : "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-md shadow-red-700/20"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-[#DC2626]" />
                    <span>Ajouté au panier</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Commander ce modèle</span>
                  </>
                )}
              </button>

              <Link
                href="/shop"
                className="px-6 py-3 rounded bg-transparent hover:bg-neutral-900 text-white font-heading font-bold text-sm uppercase tracking-wider border border-neutral-700 hover:border-neutral-500 transition-colors flex items-center gap-1.5"
              >
                <span>{ctaShopText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Machine Showcase & Selector */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Visual Display Container */}
            <div className="relative rounded overflow-hidden border border-neutral-800 bg-neutral-950 aspect-16/10 shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />

                  {/* Overlaid specs banner */}
                  <div className="absolute bottom-0 inset-x-0 p-4 border-t border-neutral-800/80 bg-black/80 backdrop-blur-md flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider">
                        {current.subtitle}
                      </p>
                      <h3 className="font-heading text-lg font-bold text-white uppercase truncate">
                        {current.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      {current.salePrice ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading text-xl font-black text-[#DC2626]">
                            {current.salePrice.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: current.currency,
                            })}
                          </span>
                          <span className="text-[11px] text-neutral-400 line-through">
                            {current.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: current.currency,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="font-heading text-xl font-black text-white">
                          {current.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: current.currency,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
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
                    className={`p-2.5 rounded text-left transition-all duration-200 border ${
                      isActive
                        ? "bg-neutral-900 border-[#DC2626] text-white"
                        : "bg-neutral-950/60 border-neutral-850 text-neutral-400 hover:text-white hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] uppercase font-bold text-[#DC2626]">
                        {v.engine}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
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
