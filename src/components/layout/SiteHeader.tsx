"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  ShoppingBag,
  User,
  Search,
  X,
  Menu,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tMega = useTranslations("megaMenu");
  const common = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount, openCart } = useCart();
  const mounted = useMounted();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200 border-b",
        scrolled
          ? "bg-[#0B0B0B]/95 backdrop-blur-md shadow-lg border-[#171717]"
          : "bg-[#0B0B0B] border-[#171717]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 select-none">
            <div className="w-8 h-8 rounded bg-[#E10600] flex items-center justify-center text-white font-heading font-black text-sm tracking-tighter shadow-md group-hover:bg-[#B80500] transition-colors">
              PM
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-black tracking-tight text-white uppercase leading-none">
                PRESTY <span className="text-[#E10600]">MOTORS</span>
              </span>
              <span className="text-[9px] tracking-widest uppercase font-semibold text-neutral-400 mt-0.5">
                Motorsport & Showroom
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                
                {/* Home */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === "/" && "text-[#E10600] bg-[#171717]"
                      )}
                    >
                      {t("home")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Motos Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(pathname.includes("motorcycles") && "text-[#E10600]")}>
                    {t("motorcycles")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[480px] grid-cols-2 p-3 gap-2 bg-[#0B0B0B] border border-[#262626] rounded">
                      <Link
                        href="/shop?category=kids-motorcycles"
                        className="group flex flex-col justify-between p-3 rounded hover:bg-[#171717] border border-transparent hover:border-[#262626] transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between text-white group-hover:text-[#E10600] font-heading text-sm font-bold uppercase mb-1">
                            <span>{tMega("kidsBikesTitle")}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#E10600]" />
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            {tMega("kidsBikesDesc")}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/shop?category=adult-motorcycles"
                        className="group flex flex-col justify-between p-3 rounded hover:bg-[#171717] border border-transparent hover:border-[#262626] transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between text-white group-hover:text-[#E10600] font-heading text-sm font-bold uppercase mb-1">
                            <span>{tMega("adultBikesTitle")}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#E10600]" />
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            {tMega("adultBikesDesc")}
                          </p>
                        </div>
                      </Link>

                      <div className="col-span-2 pt-2 border-t border-[#171717] flex items-center justify-between px-2">
                        <Link
                          href="/shop?category=motorcycles"
                          className="text-[11px] font-heading font-black text-[#E10600] hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          <span>{tMega("viewAllBikes")}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Quads Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(pathname.includes("quad") && "text-[#E10600]")}>
                    {t("quads")}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[320px] p-3 space-y-1 bg-[#0B0B0B] border border-[#262626] rounded">
                      <Link
                        href="/shop?category=quad-bikes"
                        className="group block p-2.5 rounded hover:bg-[#171717] transition-colors"
                      >
                        <div className="text-xs font-heading font-black uppercase text-white group-hover:text-[#E10600]">
                          {tMega("sportQuadsTitle")}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                          {tMega("sportQuadsDesc")}
                        </p>
                      </Link>
                      <Link
                        href="/shop?category=quad-bikes&type=youth"
                        className="group block p-2.5 rounded hover:bg-[#171717] transition-colors"
                      >
                        <div className="text-xs font-heading font-black uppercase text-white group-hover:text-[#E10600]">
                          {tMega("youthQuadsTitle")}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                          {tMega("youthQuadsDesc")}
                        </p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Equipements */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/shop?category=riding-equipment"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname.includes("riding-equipment") && "text-[#E10600] bg-[#171717]"
                      )}
                    >
                      {t("equipment")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Showroom */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/showroom"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === "/showroom" && "text-[#E10600] bg-[#171717]"
                      )}
                    >
                      {t("showroom")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Contact */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/contact"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === "/contact" && "text-[#E10600] bg-[#171717]"
                      )}
                    >
                      {t("contact")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Search Control */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden mr-1"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={common("searchPlaceholder")}
                      className="w-full text-xs bg-[#171717] text-white placeholder-neutral-500 px-3 py-1.5 rounded border border-[#262626] focus:outline-hidden focus:border-[#E10600]"
                      autoFocus
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="h-8 w-8 text-neutral-300 hover:text-[#E10600] hover:bg-[#171717]"
                aria-label="Recherche"
              >
                {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Customer Account */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:inline-flex h-8 w-8 text-neutral-300 hover:text-[#E10600] hover:bg-[#171717]"
            >
              <Link href="/account" title={t("account")}>
                <User className="w-4 h-4" />
              </Link>
            </Button>

            {/* Shopping Cart Button with Red Indicator */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              className="relative h-8 w-8 text-neutral-300 hover:text-[#E10600] hover:bg-[#171717]"
              aria-label="Panier d'achats"
            >
              <ShoppingBag className="w-4 h-4" />
              {mounted && totalCount > 0 && (
                <span className="absolute top-1 right-1 min-w-3.5 h-3.5 px-0.5 bg-[#E10600] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-8 w-8 text-neutral-300 hover:text-[#E10600] hover:bg-[#171717]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t border-[#171717] bg-[#0B0B0B] text-white overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-5 space-y-4 text-xs font-heading font-black uppercase tracking-wider">
              {/* Mobile Search input */}
              <form onSubmit={handleSearchSubmit} className="pb-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={common("searchPlaceholder")}
                    className="w-full text-xs bg-[#171717] text-white placeholder-neutral-500 px-3.5 py-2.5 rounded border border-[#262626] focus:outline-hidden focus:border-[#E10600]"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#E10600]"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <nav className="flex flex-col space-y-1 text-sm">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "py-2.5 px-3 rounded hover:bg-[#171717] hover:text-[#E10600] transition-colors flex items-center justify-between",
                    pathname === "/" && "text-[#E10600] bg-[#171717]"
                  )}
                >
                  <span>{t("home")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
                <Link
                  href="/shop?category=kids-motorcycles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded hover:bg-[#171717] hover:text-[#E10600] transition-colors flex items-center justify-between"
                >
                  <span>{t("kidsMotorcycles")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
                <Link
                  href="/shop?category=adult-motorcycles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded hover:bg-[#171717] hover:text-[#E10600] transition-colors flex items-center justify-between"
                >
                  <span>{t("adultMotorcycles")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
                <Link
                  href="/shop?category=quad-bikes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded hover:bg-[#171717] hover:text-[#E10600] transition-colors flex items-center justify-between"
                >
                  <span>{t("quadBikes")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
                <Link
                  href="/shop?category=riding-equipment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded hover:bg-[#171717] hover:text-[#E10600] transition-colors flex items-center justify-between"
                >
                  <span>{t("equipment")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
                <Link
                  href="/showroom"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded hover:bg-[#171717] hover:text-[#E10600] transition-colors flex items-center justify-between"
                >
                  <span>{t("showroom")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded hover:bg-[#171717] hover:text-[#E10600] transition-colors flex items-center justify-between"
                >
                  <span>{t("contact")}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                </Link>
              </nav>

              <div className="pt-3 pb-1 border-t border-[#171717] space-y-2">
                <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider block">
                  {t("language")}
                </span>
                <LanguageSwitcher variant="expanded" />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-[#171717]">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 rounded bg-[#171717] text-white hover:text-[#E10600] border border-[#262626]"
                >
                  <User className="w-4 h-4 text-[#E10600]" />
                  <span>{t("account")}</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="flex items-center gap-1.5 py-2 px-3.5 rounded bg-[#E10600] text-white hover:bg-[#B80500] font-black"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t("cart")} {mounted && totalCount > 0 ? `(${totalCount})` : ""}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
