"use client";

import { useState, useTransition } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { updateAdminSettingAction } from "@/server/actions/admin";

interface SiteSettingItem {
  id: string;
  key: string;
  value: string;
  group: string;
  description: string | null;
}

export function StoreSettingsView({
  initialSettings,
}: {
  initialSettings: SiteSettingItem[];
}) {
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const s of initialSettings) {
      map[s.key] = s.value;
    }
    return map;
  });

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSaveSetting = (key: string) => {
    const value = settingsMap[key] ?? "";
    setSavingKey(key);
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await updateAdminSettingAction(key, value);
      setSavingKey(null);

      if (res.success) {
        setSuccessMessage(`Setting "${key}" updated successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.errorMessage || "Failed to update setting.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase text-white tracking-wide">
            Store Settings & Announcements
          </h1>
          <p className="text-xs text-neutral-400">
            Control global showroom operations, announcement bar messaging, and customer contact parameters.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Multilingual Announcement Banners */}
      <div className="p-6 rounded border border-[#222222] bg-[#141414] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
          <Megaphone className="w-4 h-4 text-[#E10600]" />
          <h2 className="font-heading text-sm font-black uppercase text-white">
            Top Announcement Bar (FR / EN / ES / AR)
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* FR */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                French Announcement (Default)
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("announcement_fr")}
                disabled={isPending && savingKey === "announcement_fr"}
                className="px-2.5 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-heading font-bold uppercase tracking-wider border border-[#2E2E2E] cursor-pointer inline-flex items-center gap-1"
              >
                <Save className="w-3 h-3 text-[#E10600]" />
                <span>Save</span>
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["announcement_fr"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, announcement_fr: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>

          {/* EN */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                English Announcement
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("announcement_en")}
                disabled={isPending && savingKey === "announcement_en"}
                className="px-2.5 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-heading font-bold uppercase tracking-wider border border-[#2E2E2E] cursor-pointer inline-flex items-center gap-1"
              >
                <Save className="w-3 h-3 text-[#E10600]" />
                <span>Save</span>
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["announcement_en"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, announcement_en: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>

          {/* ES */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                Spanish Announcement
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("announcement_es")}
                disabled={isPending && savingKey === "announcement_es"}
                className="px-2.5 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-heading font-bold uppercase tracking-wider border border-[#2E2E2E] cursor-pointer inline-flex items-center gap-1"
              >
                <Save className="w-3 h-3 text-[#E10600]" />
                <span>Save</span>
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["announcement_es"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, announcement_es: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>

          {/* AR */}
          <div className="space-y-1" dir="rtl">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                الإعلان باللغة العربية
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("announcement_ar")}
                disabled={isPending && savingKey === "announcement_ar"}
                className="px-2.5 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-heading font-bold uppercase tracking-wider border border-[#2E2E2E] cursor-pointer inline-flex items-center gap-1"
              >
                <Save className="w-3 h-3 text-[#E10600]" />
                <span>حفظ</span>
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["announcement_ar"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, announcement_ar: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Showroom & Contact Details */}
      <div className="p-6 rounded border border-[#222222] bg-[#141414] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
          <MapPin className="w-4 h-4 text-[#16803C]" />
          <h2 className="font-heading text-sm font-black uppercase text-white">
            Showroom Location & Contact Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                Showroom Address
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("showroom_address")}
                className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-mono border border-[#2E2E2E] cursor-pointer"
              >
                Save
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["showroom_address"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, showroom_address: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                Opening Hours
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("showroom_hours_fr")}
                className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-mono border border-[#2E2E2E] cursor-pointer"
              >
                Save
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["showroom_hours_fr"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, showroom_hours_fr: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                Public Support Telephone
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("contact_phone")}
                className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-mono border border-[#2E2E2E] cursor-pointer"
              >
                Save
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["contact_phone"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, contact_phone: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-heading font-black uppercase text-neutral-400">
                WhatsApp Dispatch Line
              </label>
              <button
                type="button"
                onClick={() => handleSaveSetting("contact_whatsapp")}
                className="px-2 py-0.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[10px] font-mono border border-[#2E2E2E] cursor-pointer"
              >
                Save
              </button>
            </div>
            <input
              type="text"
              value={settingsMap["contact_whatsapp"] || ""}
              onChange={(e) =>
                setSettingsMap((prev) => ({ ...prev, contact_whatsapp: e.target.value }))
              }
              className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
