"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, getPathname, Locale } from "@/i18n/routing";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "fr", label: "Français", fullLabel: "Français (FR)" },
  { code: "en", label: "English", fullLabel: "English (US)" },
  { code: "es", label: "Español", fullLabel: "Español (ES)" },
  { code: "ar", label: "العربية", fullLabel: "العربية (AR)" },
] as const;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchParamsStr, setSearchParamsStr] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Capture search params on client safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParamsStr(window.location.search);
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeLang =
    languages.find((l) => l.code === currentLocale) || languages[0];

  const getTargetUrl = (targetLocale: (typeof languages)[number]["code"]) => {
    try {
      const rawPath = pathname || "/";
      const targetPath = getPathname({
        href: rawPath as any,
        locale: targetLocale as Locale,
      });
      return `${targetPath}${searchParamsStr}`;
    } catch {
      return `/${targetLocale}${searchParamsStr}`;
    }
  };

  const handleSelectLanguage = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetLocale: string
  ) => {
    // Set persistence cookie
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-2.5 rounded border text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-xs cursor-pointer select-none",
          isOpen
            ? "border-black bg-neutral-100 text-black"
            : "border-neutral-300 bg-white hover:bg-neutral-50 hover:border-black text-neutral-800"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Changer de langue"
      >
        <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <span>{activeLang.code.toUpperCase()}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-neutral-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-black"
          )}
        />
      </button>

      {/* Dropdown Menu (Direct DOM Rendering with Real Links) */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded border border-neutral-200 bg-white p-1 text-neutral-900 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Langue / Language
          </div>
          <div className="my-1 h-px bg-neutral-100" />
          <div className="space-y-0.5">
            {languages.map((lang) => {
              const isActive = currentLocale === lang.code;
              const targetUrl = getTargetUrl(lang.code);

              return (
                <a
                  key={lang.code}
                  href={targetUrl}
                  onClick={(e) => handleSelectLanguage(e, lang.code)}
                  className={cn(
                    "flex items-center justify-between w-full px-2.5 py-2 text-xs rounded transition-colors cursor-pointer text-left",
                    isActive
                      ? "bg-neutral-100/80 font-bold text-[#DC2626]"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-black font-medium"
                  )}
                >
                  <span>{lang.fullLabel}</span>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
