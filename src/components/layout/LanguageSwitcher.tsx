"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useTransition } from "react";

const languages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="relative inline-flex items-center gap-1.5 text-xs font-medium">
      <Globe className="w-3.5 h-3.5 text-neutral-500" />
      <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-0.5 border border-neutral-200">
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isPending}
              className={`px-2 py-0.5 rounded-full transition-all duration-150 ${
                isActive
                  ? "bg-[#16803C] text-white font-bold shadow-xs"
                  : "text-neutral-700 hover:text-black hover:bg-neutral-200"
              }`}
              title={lang.label}
            >
              {lang.code.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
