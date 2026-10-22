"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter, Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "fr", label: "FR", fullLabel: "Français" },
  { code: "en", label: "EN", fullLabel: "English" },
  { code: "es", label: "ES", fullLabel: "Español" },
  { code: "ar", label: "AR", fullLabel: "العربية" },
] as const;

interface LanguageSwitcherProps {
  className?: string;
  variant?: "segmented" | "compact" | "expanded" | "dark" | "header";
}

export function LanguageSwitcher({
  className,
  variant = "header",
}: LanguageSwitcherProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (targetLocale: string) => {
    router.replace(pathname, { locale: targetLocale as Locale });
  };

  // Expanded variant for mobile drawer
  if (variant === "expanded") {
    return (
      <div className={cn("grid grid-cols-4 gap-1.5 w-full", className)}>
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSwitch(lang.code)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded border text-center transition-all cursor-pointer select-none",
                isActive
                  ? "bg-[#E10600] text-white border-[#E10600] font-black shadow-xs"
                  : "bg-[#171717] text-neutral-300 border-[#262626] hover:border-neutral-500 hover:text-white font-medium"
              )}
            >
              <span className="text-[11px] font-heading font-black tracking-wider uppercase">
                {lang.label}
              </span>
              <span className="text-[9px] text-neutral-400 opacity-90 truncate max-w-full">
                {lang.fullLabel}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Header / Dark Segmented Pill Bar
  return (
    <div
      className={cn(
        "inline-flex items-center rounded border border-[#262626] bg-[#171717] p-0.5 shadow-2xs select-none",
        className
      )}
      role="group"
      aria-label="Language selection"
    >
      <div className="hidden sm:flex items-center pl-1.5 pr-1 text-neutral-400">
        <Globe className="w-3 h-3 text-[#E10600]" />
      </div>
      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSwitch(lang.code)}
              className={cn(
                "px-2 py-0.5 text-[11px] font-heading font-black uppercase tracking-wider rounded transition-all duration-150 cursor-pointer text-center min-w-6",
                isActive
                  ? "bg-[#E10600] text-white shadow-xs"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              )}
              title={lang.fullLabel}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
