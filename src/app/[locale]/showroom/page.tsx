"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { TestRideModal } from "@/components/home/TestRideModal";

export default function ShowroomPage() {
  const [testRideOpen, setTestRideOpen] = useState(false);

  const galleryImages = [
    {
      url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80",
      caption: "Main Showroom Floor — Competition Motocross & Enduro Lineup",
    },
    {
      url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
      caption: "Certified Mechanical Workshop & Diagnostic Bay",
    },
    {
      url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
      caption: "Youth & Kids' Bike Training Fleet",
    },
    {
      url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      caption: "All-Terrain Quad & Can-Am Exhibition Section",
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
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#E10600]">
                Flagship Paris Location
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              PARIS MOTORSPORT SHOWROOM & WORKSHOP
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              Immerse yourself in our premier 1,200 m² showroom dedicated to championship motorcycles, sports quads, and rider equipment. Speak with factory-trained mechanics, try on protective gear in our dedicated fitting lounge, and schedule a personalized test ride.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setTestRideOpen(true)}
                className="px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-700/25 flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Showroom Test Ride</span>
              </button>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded bg-transparent hover:bg-[#171717] text-white font-heading font-bold text-xs uppercase tracking-wider border border-neutral-700 hover:border-white transition-colors flex items-center gap-1.5"
              >
                <span>Google Maps Directions</span>
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
              <h3 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                Showroom Address
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                128 Avenue des Sports Motorisés<br />
                75016 Paris, France<br />
                Metro: Porte d&apos;Auteuil (Line 10)
              </p>
            </div>

            <div className="p-6 rounded border border-[#E2E2E2] bg-white space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B0B0B] text-[#E10600] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                Opening Hours
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                <strong>Tuesday — Saturday:</strong> 9:00 AM — 7:00 PM<br />
                <strong>Sunday & Monday:</strong> Closed (Track testing)<br />
                Workshop open for appointments from 8:30 AM
              </p>
            </div>

            <div className="p-6 rounded border border-[#E2E2E2] bg-white space-y-3">
              <div className="w-10 h-10 rounded bg-[#0B0B0B] text-[#E10600] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                Direct Contacts
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                <strong>Telephone:</strong> +33 1 45 67 89 00<br />
                <strong>WhatsApp Service:</strong> +33 6 12 34 56 78<br />
                <strong>Inquiries:</strong> showroom@presty-motors.com
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Facilities & Services Offered */}
      <section className="py-14 sm:py-20 bg-white border-b border-[#E2E2E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#E10600]">
              Motorsport Services
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-[#0B0B0B] mt-1">
              Complete On-Site Showroom Facilities
            </h2>
            <p className="text-xs text-[#737373] mt-2">
              Beyond vehicle sales, our flagship facility provides comprehensive technical tuning and bespoke rider sizing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-black">
                01
              </div>
              <h4 className="font-heading text-sm font-black uppercase text-[#0B0B0B]">
                Dyno Preparation (PDI)
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                All vehicles undergo multi-point inspection, torque verification, fluids optimization, and carburetor/fuel-injection calibration.
              </p>
            </div>

            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-black">
                02
              </div>
              <h4 className="font-heading text-sm font-black uppercase text-[#0B0B0B]">
                Ergonomic & Sag Setup
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Personalized handlebar, control levers, and rear suspension sag calibration adjusted specifically to your height and rider weight.
              </p>
            </div>

            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-black">
                03
              </div>
              <h4 className="font-heading text-sm font-black uppercase text-[#0B0B0B]">
                Gear Fitting Lounge
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Try on certified Alpinestars, Fox, and Shoei helmets, knee braces, chest guards, and enduro boots with expert size guidance.
              </p>
            </div>

            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="w-8 h-8 rounded bg-[#E10600] text-white flex items-center justify-center font-black">
                04
              </div>
              <h4 className="font-heading text-sm font-black uppercase text-[#0B0B0B]">
                VIP Transport & Pickup
              </h4>
              <p className="text-xs text-[#737373] leading-relaxed">
                Collect directly at the Paris showroom with vehicle orientation or request white-glove enclosed transporter delivery across Europe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photography Gallery */}
      <section className="py-14 sm:py-20 bg-[#0B0B0B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#E10600]">
              Visual Tour
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white mt-1">
              Inside Our Paris Showroom
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {galleryImages.map((item, idx) => (
              <div
                key={idx}
                className="group relative rounded overflow-hidden border border-[#262626] aspect-16/10 bg-[#171717] shadow-xl"
              >
                <Image
                  src={item.url}
                  alt={item.caption}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0B0B0B] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-4 right-4 text-xs font-heading font-bold uppercase text-neutral-200">
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
