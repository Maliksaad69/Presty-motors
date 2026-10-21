"use client";

import { useTranslations } from "next-intl";
import { Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function AnnouncementBar() {
  const t = useTranslations("announcement");

  const announcements = [
    t("text"),
    "Showroom ouvert du Mardi au Samedi — 128 Avenue des Sports Motorisés, Paris",
    "Expédition internationale sécurisée & cotation sur mesure disponible",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-[#0A0A0A] text-neutral-300 text-xs py-2 px-4 border-b border-neutral-800 relative z-40 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Animated Announcement Carousel */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
          <div className="h-4 overflow-hidden relative w-full">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="font-medium text-neutral-300 truncate text-[11px] sm:text-xs tracking-wide"
              >
                {announcements[currentIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Contact & Showroom */}
        <div className="hidden md:flex items-center gap-6 text-[11px] text-neutral-400 font-medium shrink-0">
          <a
            href="tel:+33145678900"
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
          >
            <Phone className="w-3 h-3 text-[#DC2626]" />
            <span>+33 1 45 67 89 00</span>
          </a>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <MapPin className="w-3 h-3 text-[#DC2626]" />
            <span>Paris Showroom</span>
          </div>
        </div>
      </div>
    </div>
  );
}
