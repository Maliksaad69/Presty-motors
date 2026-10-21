"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: "fr", label: "Français (FR)" },
  { code: "en", label: "English (US)" },
  { code: "es", label: "Español (ES)" },
  { code: "ar", label: "العربية (AR)" },
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

  const activeLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-black gap-1.5 focus-visible:ring-0"
        >
          <Globe className="w-3.5 h-3.5 text-neutral-500" />
          <span>{activeLang.code.toUpperCase()}</span>
          <ChevronDown className="w-3 h-3 text-neutral-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white">
        <DropdownMenuLabel className="text-[10px]">Langue / Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((lang) => {
          const isActive = currentLocale === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isPending}
              className="flex items-center justify-between text-xs py-1.5 cursor-pointer"
            >
              <span className={isActive ? "font-bold text-[#DC2626]" : "text-neutral-700"}>
                {lang.label}
              </span>
              {isActive && <Check className="w-3.5 h-3.5 text-[#DC2626]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
