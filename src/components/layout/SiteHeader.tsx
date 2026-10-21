"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  ShoppingBag,
  User,
  Search,
  X,
  Menu,
  ChevronRight,
  Gauge,
  ShieldAlert,
  Compass,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const common = useTranslations("common");
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();

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

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200 border-b",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs border-neutral-200"
          : "bg-white border-neutral-200"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded bg-[#DC2626] flex items-center justify-center text-white font-extrabold text-sm tracking-tighter shadow-xs group-hover:bg-[#B91C1C] transition-colors">
              PM
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-black tracking-tight text-[#0A0A0A] uppercase leading-none">
                PRESTY <span className="text-[#DC2626]">MOTORS</span>
              </span>
              <span className="text-[9px] tracking-widest uppercase font-semibold text-neutral-400 mt-0.5">
                Motorsport & Showroom
              </span>
            </div>
          </Link>

          {/* shadcn NavigationMenu (Desktop) */}
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
                        pathname === "/" && "text-[#DC2626] bg-neutral-100/50"
                      )}
                    >
                      {t("home")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Motos Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t("motorcycles")}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[480px] grid-cols-2 p-3 gap-2 bg-white">
                      <Link
                        href="/shop?category=kids-motorcycles"
                        className="group flex flex-col justify-between p-3 rounded hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[#0A0A0A] group-hover:text-[#DC2626] font-heading text-sm font-bold uppercase mb-1">
                            <span>Motos Enfants</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            Modèles d'initiation et de compétition adaptés de 4 à 14 ans (50cc, 65cc, 85cc).
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/shop?category=adult-motorcycles"
                        className="group flex flex-col justify-between p-3 rounded hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[#0A0A0A] group-hover:text-[#DC2626] font-heading text-sm font-bold uppercase mb-1">
                            <span>Motos Adultes</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            Motos de cross et tout-terrain haute performance (125cc à 450cc).
                          </p>
                        </div>
                      </Link>

                      <div className="col-span-2 pt-2 border-t border-neutral-100 flex items-center justify-between px-2">
                        <Link
                          href="/shop?category=motorcycles"
                          className="text-[11px] font-bold text-[#DC2626] hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          <span>Voir toutes les motos</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Quads Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger>{t("quads")}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[320px] p-3 space-y-1 bg-white">
                      <Link
                        href="/shop?category=quad-bikes"
                        className="group block p-2.5 rounded hover:bg-neutral-50 transition-colors"
                      >
                        <div className="text-xs font-bold uppercase text-[#0A0A0A] group-hover:text-[#DC2626]">
                          Quads Sportifs & Utilitaires
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                          Modèles 4x4 et sportifs pour adolescents et adultes (Can-Am, Polaris).
                        </p>
                      </Link>
                      <Link
                        href="/shop?category=quad-bikes&type=youth"
                        className="group block p-2.5 rounded hover:bg-neutral-50 transition-colors"
                      >
                        <div className="text-xs font-bold uppercase text-[#0A0A0A] group-hover:text-[#DC2626]">
                          Quads Enfants & Sécurité
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                          Équipés de coupe-circuit et limiteur de vitesse parental.
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
                        pathname.includes("riding-equipment") && "text-[#DC2626]"
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
                        pathname === "/showroom" && "text-[#DC2626]"
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
                        pathname === "/contact" && "text-[#DC2626]"
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
            
            {/* Expandable Search Input */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden mr-1"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={common("searchPlaceholder")}
                      className="w-full text-xs bg-neutral-100 text-black placeholder-neutral-400 px-3 py-1.5 rounded border border-neutral-300 focus:outline-hidden focus:border-[#DC2626]"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="h-8 w-8 text-neutral-700 hover:text-[#DC2626]"
                aria-label="Recherche"
              >
                {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>

            {/* shadcn Dropdown Language Switcher */}
            <LanguageSwitcher />

            {/* Account */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hidden sm:inline-flex h-8 w-8 text-neutral-700 hover:text-[#DC2626]"
            >
              <Link href="/account" title={t("account")}>
                <User className="w-4 h-4" />
              </Link>
            </Button>

            {/* Shopping Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openCart}
              className="relative h-8 w-8 text-neutral-700 hover:text-[#DC2626]"
              aria-label="Panier d'achats"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#DC2626] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu Hamburger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-8 w-8 text-neutral-700 hover:text-[#DC2626]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden border-t border-neutral-200 bg-white overflow-hidden shadow-lg"
          >
            <div className="px-4 py-5 space-y-4 text-xs font-bold uppercase tracking-wider">
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 hover:text-[#DC2626]"
                >
                  {t("home")}
                </Link>
                <Link
                  href="/shop?category=kids-motorcycles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 hover:text-[#DC2626]"
                >
                  Motos Enfants
                </Link>
                <Link
                  href="/shop?category=adult-motorcycles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 hover:text-[#DC2626]"
                >
                  Motos Adultes
                </Link>
                <Link
                  href="/shop?category=quad-bikes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 hover:text-[#DC2626]"
                >
                  Quads Tout-Terrain
                </Link>
                <Link
                  href="/shop?category=riding-equipment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 hover:text-[#DC2626]"
                >
                  {t("equipment")}
                </Link>
                <Link
                  href="/showroom"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 hover:text-[#DC2626]"
                >
                  {t("showroom")}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-neutral-100 hover:text-[#DC2626]"
                >
                  {t("contact")}
                </Link>
              </nav>

              <div className="pt-3 pb-1 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider">
                  Langue
                </span>
                <LanguageSwitcher />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-neutral-700 hover:text-[#DC2626]"
                >
                  <User className="w-4 h-4" />
                  <span>{t("account")}</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="flex items-center gap-1.5 text-[#DC2626]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Panier ({totalCount})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
