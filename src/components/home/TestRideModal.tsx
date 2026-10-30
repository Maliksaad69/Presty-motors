"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestRideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestRideModal({ isOpen, onClose }: TestRideModalProps) {
  const t = useTranslations("testRide");

  const [machineType, setMachineType] = useState("adult-bike");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("14:00 - 15:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white text-[#0B0B0B] rounded border border-[#E2E2E2] shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#171717] bg-[#0B0B0B] text-white shrink-0 sticky top-0 z-10 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">
                  {t("modalTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#171717] transition-colors cursor-pointer"
                aria-label="Fermer la fenêtre de réservation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 overflow-y-auto popup-scroll-light flex-1">
              {isSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#16803C]/10 text-[#16803C] flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-semibold uppercase text-[#0B0B0B]">
                      {t("successTitle")}
                    </h4>
                    <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto leading-relaxed font-normal">
                      {t("successDesc", { name: name || "Customer" })}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2.5 rounded bg-[#0B0B0B] text-white font-heading font-medium text-xs uppercase tracking-wider hover:bg-[#171717] transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Vehicle Type Choice */}
                  <div>
                    <label htmlFor="test-ride-machine" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1.5">
                      {t("vehicleType")}
                    </label>
                    <select
                      id="test-ride-machine"
                      value={machineType}
                      onChange={(e) => setMachineType(e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-[#E2E2E2] rounded bg-white text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] font-medium cursor-pointer"
                    >
                      <option value="adult-bike">{t("optionAdultBike")}</option>
                      <option value="sport-quad">{t("optionSportQuad")}</option>
                      <option value="kids-bike">{t("optionKidsBike")}</option>
                      <option value="kids-quad">{t("optionKidsQuad")}</option>
                    </select>
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="test-ride-date" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1.5">
                        {t("date")}
                      </label>
                      <input
                        id="test-ride-date"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-[#E2E2E2] rounded bg-white text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] font-mono cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="test-ride-timeslot" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1.5">
                        {t("timeSlot")}
                      </label>
                      <select
                        id="test-ride-timeslot"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-[#E2E2E2] rounded bg-white text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] font-medium cursor-pointer"
                      >
                        <option value="10:00 - 11:00">10:00 - 11:00</option>
                        <option value="11:30 - 12:30">11:30 - 12:30</option>
                        <option value="14:00 - 15:00">14:00 - 15:00</option>
                        <option value="15:30 - 16:30">15:30 - 16:30</option>
                        <option value="17:00 - 18:00">17:00 - 18:00</option>
                      </select>
                    </div>
                  </div>

                  {/* Rider Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="test-ride-name" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1.5">
                        {t("name")}
                      </label>
                      <input
                        id="test-ride-name"
                        type="text"
                        required
                        placeholder="Marc Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-[#E2E2E2] rounded bg-white text-[#0B0B0B] placeholder-neutral-400 focus:outline-hidden focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label htmlFor="test-ride-phone" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1.5">
                        {t("phone")}
                      </label>
                      <input
                        id="test-ride-phone"
                        type="tel"
                        required
                        placeholder="+33 6 12 34 56 78"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-9 px-3 text-xs border border-[#E2E2E2] rounded bg-white text-[#0B0B0B] placeholder-neutral-400 focus:outline-hidden focus:border-[#E10600] font-mono"
                      />
                    </div>
                  </div>

                  {/* Notice */}
                  <p className="text-[10px] text-[#737373] leading-relaxed pt-1 font-normal">
                    {t("notice")}
                  </p>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs uppercase tracking-wider transition-colors shadow-md shadow-red-700/25 cursor-pointer active:scale-[0.98]"
                    >
                      {t("submit")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
