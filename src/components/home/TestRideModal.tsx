"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Check, Phone, User, ShieldCheck } from "lucide-react";

interface TestRideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestRideModal({ isOpen, onClose }: TestRideModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "motorcycle-adult",
    date: "",
    timeSlot: "14:00 - 15:00",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        <div className="min-h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded border border-neutral-200 shadow-2xl overflow-hidden text-[#0A0A0A]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black text-white border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <h3 className="font-heading text-base font-bold uppercase tracking-wider">
                  Réservation Essai Showroom Paris
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-black text-[#DC2626] flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-xl font-bold uppercase">
                  Demande Confirmée
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                  Merci {formData.name}. Notre équipe showroom vous recontactera sous 2 heures pour valider votre créneau d'essai.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                    Type de véhicule à essayer
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value })
                    }
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded font-medium focus:outline-hidden focus:border-[#DC2626]"
                    required
                  >
                    <option value="motorcycle-adult">Moto Adulte (Yamaha YZ125, etc.)</option>
                    <option value="quad-sport">Quad Sportif / Can-Am 1000R</option>
                    <option value="motorcycle-kids">Moto Enfant (KTM 50 SX Mini)</option>
                    <option value="quad-kids">Quad Enfant (Polaris Outlaw 70)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Date souhaitée
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded font-medium focus:outline-hidden focus:border-[#DC2626]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Créneau horaire
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) =>
                        setFormData({ ...formData, timeSlot: e.target.value })
                      }
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded font-medium focus:outline-hidden focus:border-[#DC2626]"
                    >
                      <option value="10:00 - 11:00">10:00 - 11:00</option>
                      <option value="11:30 - 12:30">11:30 - 12:30</option>
                      <option value="14:00 - 15:00">14:00 - 15:00</option>
                      <option value="16:00 - 17:00">16:00 - 17:00</option>
                      <option value="17:30 - 18:30">17:30 - 18:30</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded font-medium focus:outline-hidden focus:border-[#DC2626]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                      Téléphone mobile
                    </label>
                    <input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded font-medium focus:outline-hidden focus:border-[#DC2626]"
                      required
                    />
                  </div>
                </div>

                <p className="text-[10px] text-neutral-400">
                  * Équipement de sécurité fourni sur place (casque, gants homologués). Permis ou autorisation parentale requise selon la cylindrée.
                </p>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-600/20"
                  >
                    Confirmer la demande d'essai
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
