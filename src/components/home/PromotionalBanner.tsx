"use client";

import { Link } from "@/i18n/routing";
import { ArrowRight, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { motorsportEase } from "@/components/ui/motion-container";

export function PromotionalBanner() {
  return (
    <section className="relative overflow-hidden bg-[#0B0B0B] text-white border-y border-[#171717] py-12 sm:py-16">
      {/* Background motorsport angled lines and gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(110deg,#E10600_1px,transparent_1px)] [background-size:32px_32px]" />
      
      {/* Dynamic diagonal racing slash accent */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#E10600]/10 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: motorsportEase }}
          className="bg-[#171717] rounded border border-[#262626] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-2xl"
        >
          {/* Top red racing line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-[#E10600]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#E10600]/15 border border-[#E10600]/30 text-[#E10600]">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[10px] font-heading font-black uppercase tracking-widest">
                  Season Opening Campaign 2025
                </span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                COMPETITION READINESS: FREE WORKSHOP PDI & 15% OFF SAFETY GEAR
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Every vehicle purchased online or in our Paris showroom receives complete mechanical dynamometer tuning, personalized suspension sag setup, and exclusive savings on certified Alpinestars & Fox Racing equipment.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-heading font-bold uppercase text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                  <span>Certified Technicians</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                  <span>Fast Domestic Freight</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E10600]" />
                  <span>Showroom Pickup in Paris 16e</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto lg:w-full">
                <Link
                  href="/shop"
                  className="w-full py-3.5 px-6 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-red-700/25"
                >
                  <span>Discover All Deals</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto lg:w-full">
                <Link
                  href="/showroom"
                  className="w-full py-3 px-6 rounded bg-transparent hover:bg-[#0B0B0B] text-white font-heading font-bold text-xs uppercase tracking-wider border border-neutral-700 hover:border-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Visit Paris Showroom</span>
                </Link>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
