"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ShoppingBag, User, Search, X, Menu } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/shop", label: t("catalog") },
    { href: "/shop?category=adult-motorcycles", label: t("motorcycles") },
    { href: "/shop?category=quad-bikes", label: t("quads") },
    { href: "/shop?category=riding-equipment", label: t("equipment") },
    { href: "/showroom", label: t("showroom") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-200"
          : "bg-white border-b border-neutral-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded bg-[#DC2626] flex items-center justify-center text-white font-extrabold text-xl tracking-tighter shadow-md"
            >
              PM
            </motion.div>
            <div className="flex flex-col">
              <span className="font-heading text-2xl font-black tracking-tight text-[#0A0A0A] uppercase leading-none">
                PRESTY <span className="text-[#DC2626]">MOTORS</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-neutral-500">
                Motorsport & Showroom
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with animated hover line */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-[#0A0A0A] uppercase tracking-wide">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative py-2 text-neutral-800 hover:text-[#DC2626] transition-colors duration-200"
                >
                  <span>{link.label}</span>
                  {isActive ? (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2626]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  ) : (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DC2626] scale-x-0 hover:scale-x-100 transition-transform origin-left duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Animated Expandable Search */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden mr-2"
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

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-neutral-700 hover:text-[#DC2626] hover:bg-neutral-100 rounded transition-colors"
                aria-label="Recherche"
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </motion.button>
            </div>

            <LanguageSwitcher />

            {/* Account */}
            <Link
              href="/account"
              className="hidden sm:inline-flex p-2 text-neutral-700 hover:text-[#DC2626] hover:bg-neutral-100 rounded transition-colors"
              title={t("account")}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Interactive Animated Cart Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={openCart}
              className="relative p-2 text-neutral-700 hover:text-[#DC2626] hover:bg-neutral-100 rounded transition-colors"
              aria-label="Panier d'achats"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-[#DC2626] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs"
                >
                  {totalCount}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-[#DC2626] rounded transition-colors"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t border-neutral-200 bg-white overflow-hidden shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              <nav className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-heading text-lg font-bold uppercase text-[#0A0A0A] hover:text-[#DC2626] transition-colors py-1 border-b border-neutral-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-4 flex items-center justify-between border-t border-neutral-200">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-[#DC2626]"
                >
                  <User className="w-4 h-4" />
                  <span>{t("account")}</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCart();
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-[#DC2626]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Panier ({totalCount})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
