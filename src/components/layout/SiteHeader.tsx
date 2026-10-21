"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ShoppingBag, User, Search, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  const t = useTranslations("nav");
  const common = useTranslations("common");

  return (
    <header className="sticky top-0 z-50 bg-[#F7F8F5]/90 backdrop-blur-md border-b border-[#D7DDD7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm bg-[#16803C] flex items-center justify-center text-white font-extrabold text-xl tracking-tighter shadow-md group-hover:bg-[#0E5C2A] transition-colors">
              PM
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-black tracking-tight text-[#171A18] uppercase leading-none">
                PRESTY <span className="text-[#16803C]">MOTORS</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500">
                Motorsport & Showroom
              </span>
            </div>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#171A18]">
            <Link
              href="/"
              className="hover:text-[#16803C] transition-colors py-2 border-b-2 border-transparent hover:border-[#16803C]"
            >
              {t("home")}
            </Link>
            <Link
              href="/shop"
              className="hover:text-[#16803C] transition-colors py-2 border-b-2 border-transparent hover:border-[#16803C]"
            >
              {t("catalog")}
            </Link>
            <Link
              href="/shop?category=motorcycles"
              className="hover:text-[#16803C] transition-colors py-2 border-b-2 border-transparent hover:border-[#16803C]"
            >
              {t("motorcycles")}
            </Link>
            <Link
              href="/shop?category=quads"
              className="hover:text-[#16803C] transition-colors py-2 border-b-2 border-transparent hover:border-[#16803C]"
            >
              {t("quads")}
            </Link>
            <Link
              href="/shop?category=equipment"
              className="hover:text-[#16803C] transition-colors py-2 border-b-2 border-transparent hover:border-[#16803C]"
            >
              {t("equipment")}
            </Link>
            <Link
              href="/showroom"
              className="hover:text-[#16803C] transition-colors py-2 border-b-2 border-transparent hover:border-[#16803C]"
            >
              {t("showroom")}
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#16803C] transition-colors py-2 border-b-2 border-transparent hover:border-[#16803C]"
            >
              {t("contact")}
            </Link>
          </nav>

          {/* Right Actions: Search / Language / Account / Cart */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/account"
                className="p-2 text-neutral-700 hover:text-[#16803C] hover:bg-neutral-200/60 rounded-full transition-colors"
                title={t("account")}
              >
                <User className="w-5 h-5" />
              </Link>

              <Link
                href="/cart"
                className="relative p-2 text-neutral-700 hover:text-[#16803C] hover:bg-neutral-200/60 rounded-full transition-colors"
                title={t("cart")}
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#16803C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
