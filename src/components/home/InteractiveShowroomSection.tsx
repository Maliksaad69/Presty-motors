"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Clock, Phone, ArrowRight, Calendar } from "lucide-react";
import { TestRideModal } from "./TestRideModal";

export function InteractiveShowroomSection() {
  const [testRideOpen, setTestRideOpen] = useState(false);

  return (
    <>
      <section className="py-16 bg-black text-white border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Details & Modal Trigger */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626]">
                  Showroom Physique Paris
                </span>
              </div>

              {/* Scaled-down compact heading */}
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white leading-tight">
                VENEZ ESSAYER VOS MACHINES AU SHOWROOM
              </h2>

              <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed max-w-lg">
                Rencontrez notre équipe technique, prenez place au guidon de nos modèles récents et bénéficiez de réglages personnalisés avant livraison.
              </p>

              <div className="space-y-3 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>128 Avenue des Sports Motorisés, 75016 Paris</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>Mardi au Samedi : 9h00 - 19h00</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#DC2626] shrink-0" />
                  <span>Atelier & Essais : +33 1 45 67 89 00</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setTestRideOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-700/20"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Réserver un créneau d'essai</span>
                </button>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded bg-transparent hover:bg-neutral-900 text-neutral-300 hover:text-white font-heading font-bold text-xs uppercase tracking-wider border border-neutral-800 transition-colors"
                >
                  <span>Itinéraire GPS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Showroom Visual */}
            <div className="lg:col-span-6">
              <div className="relative rounded overflow-hidden border border-neutral-800 aspect-16/10 shadow-xl group">
                <Image
                  src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
                  alt="Showroom Presty Motors Paris"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-[11px] text-neutral-300 font-medium">
                  Atelier de préparation & exposition véhicules neufs
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
