"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Clock,
  Phone,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { TestRideModal } from "@/components/home/TestRideModal";

export default function ShowroomPage() {
  const t = useTranslations("showroom");
  const [testRideOpen, setTestRideOpen] = useState(false);

  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
      caption: t("gallery1"),
    },
    {
      url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
      caption: t("gallery2"),
    },
    {
      url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
      caption: t("gallery3"),
    },
    {
      url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      caption: t("gallery4"),
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Showroom Hero */}
      <section className="relative overflow-hidden bg-[#0B0B0B] text-white py-14 sm:py-20 border-b border-[#171717]">
        <div className="absolute inset-0 z-0 opacity-15 bg-[radial-gradient(#E10600_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-[#E10600]">
                {t("badge")}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold uppercase tracking-tight text-white leading-tight">
              {t("title")}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              {t("subtitle")}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setTestRideOpen(true)}
                className="px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-700/25 flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{t("bookBtn")}</span>
              </button>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded bg-transparent hover:bg-[#171717] text-white font-heading font-medium text-xs uppercase tracking-wider border border-neutral-700 hover:border-white transition-colors flex items-center gap-1.5"
              >
                <span>{t("directionsBtn")}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#E10600]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Showroom Information & Opening Hours Grid */}
      <section className="py-12 sm:py-16 bg-[#F5F5F5] border-b border-[#E2E2E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded border border-[#E2E2E2] bg-white space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B0B0B] text-[#E10600] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                {t("addressTitle")}
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed whitespace-pre-line">
                {t("addressLines")}
              </p>
            </div>

            <div className="p-6 rounded border border-[#E2E2E2] bg-white space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B0B0B] text-[#E10600] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                {t("hoursTitle")}
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed whitespace-pre-line">
                {t("hoursLines")}
              </p>
            </div>

            <div className="p-6 rounded border border-[#E2E2E2] bg-white space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B0B0B] text-[#E10600] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                {t("contactsTitle")}
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                <strong>Tel:</strong> +33 1 45 67 89 00<br />
                <strong>WhatsApp:</strong> +33 6 12 34 56 78<br />
                <strong>Email:</strong> showroom@presty-motors.com
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Facilities & Services Offered */}
      <section className="py-14 sm:py-20 bg-white border-b border-[#E2E2E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-[#E10600]">
              {t("facilitiesBadge")}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold uppercase text-[#0B0B0B] mt-1">
              {t("facilitiesTitle")}
            </h2>
            <p className="text-xs text-[#737373] mt-2">
              {t("facilitiesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-semibold text-xs">
                01
              </div>
              <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                {t("facility1Title")}
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                {t("facility1Desc")}
              </p>
            </div>

            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-semibold text-xs">
                02
              </div>
              <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                {t("facility2Title")}
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                {t("facility2Desc")}
              </p>
            </div>

            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-semibold text-xs">
                03
              </div>
              <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                {t("facility3Title")}
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                {t("facility3Desc")}
              </p>
            </div>

            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-semibold text-xs">
                04
              </div>
              <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                {t("facility4Title")}
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                {t("facility4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photography Gallery */}
      <section className="py-14 sm:py-20 bg-[#0B0B0B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-[#E10600]">
              {t("galleryBadge")}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold uppercase text-white mt-1">
              {t("galleryTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {galleryImages.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded border border-[#262626] aspect-16/10 bg-[#171717] shadow-xl overflow-hidden"
              >
                <Image
                  src={item.url}
                  alt={item.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0B0B0B] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 right-4 text-xs font-heading font-medium uppercase text-neutral-200">
                  {item.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Ride Modal */}
      <TestRideModal
        isOpen={testRideOpen}
        onClose={() => setTestRideOpen(false)}
      />
    </div>
  );
}
