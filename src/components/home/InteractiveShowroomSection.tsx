"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin, Clock, Phone, ArrowRight, Calendar } from "lucide-react";
import { TestRideModal } from "./TestRideModal";

export function InteractiveShowroomSection() {
  const t = useTranslations("showroomSection");
  const [testRideOpen, setTestRideOpen] = useState(false);

  return (
    <>
      <section className="py-14 sm:py-20 bg-[#0B0B0B] text-white border-t border-[#171717] relative overflow-hidden">
        {/* Subtle red ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Details & Modal Trigger */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                <span className="text-[10px] font-heading font-medium uppercase tracking-widest text-[#E10600]">
                  {t("badge")}
                </span>
              </div>

              {/* Clean Headline */}
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold uppercase text-white tracking-tight leading-tight">
                {t("title")}
              </h2>

              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
                {t("subtitle")}
              </p>

              <div className="space-y-3 pt-2 text-xs text-neutral-300 border-y border-[#171717] py-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#E10600] shrink-0" />
                  <span>{t("address")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#E10600] shrink-0" />
                  <span>{t("hours")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#E10600] shrink-0" />
                  <span className="font-mono">{t("phone")}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTestRideOpen(true)}
                  aria-label="Réserver un essai de moto ou quad au showroom de Paris"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs uppercase tracking-wider transition-all shadow-md shadow-red-700/25 cursor-pointer active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t("bookBtn")}</span>
                </button>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded bg-transparent hover:bg-[#171717] text-white font-heading font-medium text-xs uppercase tracking-wider border border-neutral-700 hover:border-white transition-colors"
                >
                  <span>{t("gpsBtn")}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E10600]" />
                </a>
              </div>
            </div>

            {/* Right Column: Showroom Visual */}
            <div className="lg:col-span-6">
              <div className="relative rounded overflow-hidden border border-[#262626] aspect-16/10 shadow-2xl group">
                <Image
                  src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
                  alt="Showroom Presty Motors Paris"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0B0B0B] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 text-[11px] text-neutral-300 font-medium">
                  {t("caption")}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Test Ride Modal */}
      <TestRideModal
        isOpen={testRideOpen}
        onClose={() => setTestRideOpen(false)}
      />
    </>
  );
}
