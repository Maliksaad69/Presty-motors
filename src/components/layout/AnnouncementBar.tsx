import { useTranslations } from "next-intl";
import { Sparkles, Phone, MapPin } from "lucide-react";

export function AnnouncementBar() {
  const t = useTranslations("announcement");

  return (
    <div className="bg-[#171A18] text-neutral-200 text-xs py-2 px-4 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="inline-flex items-center justify-center bg-[#16803C] text-white text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm">
            VIP
          </span>
          <p className="font-medium text-neutral-300">{t("text")}</p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-neutral-400">
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-[#27C85A]" />
            <span>+33 1 45 67 89 00</span>
          </div>
          <span className="text-neutral-700">•</span>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin className="w-3.5 h-3.5 text-[#27C85A]" />
            <span>Paris Showroom</span>
          </div>
        </div>
      </div>
    </div>
  );
}
