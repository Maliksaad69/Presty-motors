"use client";

import { useTranslations } from "next-intl";
import { Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function AnnouncementBar() {
  const t = useTranslations("announcement");

  const announcements = [
    t("text"),
    t("hours"),
    t("shipping"),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  return (
    <div className="bg-[#0B0B0B] text-neutral-300 text-[11px] py-1.5 px-4 border-b border-[#171717] relative z-40 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Animated Announcement Carousel */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shrink-0 animate-pulse" />
          <div className="h-4 overflow-hidden relative w-full">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="font-medium text-neutral-300 truncate text-[11px] tracking-wide"
              >
                {announcements[currentIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Contact & Showroom */}
        <div className="hidden md:flex items-center gap-5 text-[11px] text-neutral-400 font-medium shrink-0">
          <a
            href="tel:+33145678900"
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-150"
          >
            <Phone className="w-3 h-3 text-[#E10600]" />
            <span className="font-mono">+33 1 45 67 89 00</span>
          </a>
          <span className="text-neutral-800">|</span>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <MapPin className="w-3 h-3 text-[#E10600]" />
            <span>Showroom Paris 16e</span>
          </div>
        </div>
      </div>
    </div>
  );
}
