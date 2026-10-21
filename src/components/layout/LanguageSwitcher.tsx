"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useTransition } from "react";
import { motion } from "framer-motion";

const languages = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
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
      <Globe className="w-3.5 h-3.5 text-neutral-400" />
      <div className="flex items-center gap-0.5 bg-neutral-100 p-0.5 rounded border border-neutral-200">
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isPending}
              className={`relative px-2 py-0.5 text-[11px] font-bold rounded transition-colors duration-150 ${
                isActive
                  ? "text-white"
                  : "text-neutral-600 hover:text-black hover:bg-neutral-200/50"
              }`}
              title={lang.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeLang"
                  className="absolute inset-0 bg-[#DC2626] rounded shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
