"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/routing";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Globe,
  Tag,
  Settings,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
  Database,
  Radio,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  locale: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  description?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "OPERATIONS",
    items: [
      {
        label: "Dashboard Overview",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
        description: "Telemetry & key metrics",
      },
      {
        label: "Catalog & Machines",
        href: "/admin/products",
        icon: Package,
        description: "Cars, bikes, pricing & images",
      },
      {
        label: "Inventory & Audits",
        href: "/admin/inventory",
        icon: Boxes,
        description: "Stock reconciliation & ledger",
      },
    ],
  },
  {
    title: "COMMERCE & FULFILLMENT",
    items: [
      {
        label: "Orders Management",
        href: "/admin/orders",
        icon: ShoppingBag,
        description: "Order status & dispatch",
      },
      {
        label: "Shipping Quotations",
        href: "/admin/quotes",
        icon: Globe,
        description: "Freight rates & logistics",
      },
      {
        label: "Promotions & Codes",
        href: "/admin/promotions",
        icon: Tag,
        description: "Discounts & coupon rules",
      },
    ],
  },
  {
    title: "SYSTEM & STORE",
    items: [
      {
        label: "Store Settings",
        href: "/admin/settings",
        icon: Settings,
        description: "Banners & workshop configs",
      },
    ],
  },
];

export function AdminShell({ children, locale }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine active item
  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem =
    allItems.find((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    ) || allItems[0];

  const ActiveIcon = activeItem.icon;

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex flex-col font-sans font-normal antialiased selection:bg-[#E10600] selection:text-white">
      {/* =========================================================================
          TOP ADMIN NAVBAR (Responsive & Consistent with SiteHeader)
      ========================================================================= */}
      <header className="h-16 border-b border-[#222222] bg-[#0B0B0B] px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-neutral-300 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#E10600] shrink-0"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#E10600]" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Consistent Brand Logo */}
          <Link href="/admin" className="flex items-center gap-2.5 group shrink-0 select-none">
            <div className="w-8 h-8 rounded bg-[#E10600] flex items-center justify-center text-white font-medium text-xs tracking-tight shadow-md group-hover:bg-[#B80500] transition-colors">
              PM
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-medium tracking-tight text-white uppercase leading-none">
                  PRESTY <span className="text-[#E10600]">MOTORS</span>
                </span>
                <span className="hidden sm:inline-flex text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 font-medium">
                  Console
                </span>
              </div>
              <span className="text-[9px] tracking-widest uppercase font-normal text-neutral-400 mt-0.5">
                Operations & Showroom
              </span>
            </div>
          </Link>

          {/* Breadcrumb on Desktop */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-neutral-400 border-l border-[#222222] pl-4 ml-1">
            <span className="text-neutral-500 font-normal">Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <div className="flex items-center gap-1.5 text-neutral-200 font-medium">
              <ActiveIcon className="w-3.5 h-3.5 text-[#E10600]" />
              <span>{activeItem.label}</span>
            </div>
          </div>
        </div>

        {/* Right: Operational Status, Roles & Live Showroom Link */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Node & Database telemetry */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#141414] border border-[#242424] text-[11px] font-mono text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-[#16803C] animate-pulse" />
            <span className="text-neutral-300">Paris Node</span>
            <span className="text-neutral-600">•</span>
            <span className="text-emerald-400">PostgreSQL</span>
          </div>

          {/* Superadmin Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171717] border border-[#262626] text-[11px] font-mono text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Superadmin</span>
          </div>

          {/* Live Showroom Link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 hover:text-white text-xs font-sans font-medium transition-colors border border-[#2E2E2E]"
            title="Open customer-facing showroom in new tab"
          >
            <span className="hidden xs:inline sm:inline">Live Showroom</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#E10600]" />
          </Link>
        </div>
      </header>

      {/* =========================================================================
          MOBILE ACTIVE SUB-NAV BAR (Under 1024px)
          Provides quick section orientation & tap-to-switch drawer toggle
      ========================================================================= */}
      <div className="lg:hidden bg-[#111111] border-b border-[#222222] px-3.5 sm:px-6 py-2 flex items-center justify-between text-xs sticky top-16 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider shrink-0">
            VIEW:
          </span>
          <div className="flex items-center gap-1.5 text-white font-medium truncate">
            <ActiveIcon className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
            <span className="truncate">{activeItem.label}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-1 text-[11px] font-medium text-[#E10600] hover:text-[#ff3b36] transition-colors shrink-0 pl-3"
        >
          <span>All Views</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* =========================================================================
          MOBILE DRAWER / SLIDE-OVER SHEET (Under 1024px)
      ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Window */}
          <aside className="fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] bg-[#0B0B0B] border-r border-[#222222] flex flex-col justify-between p-4 shadow-2xl z-50 overflow-y-auto popup-scroll transition-transform duration-200 ease-out transform translate-x-0">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#222222] pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase text-white tracking-wider block">
                    Admin Navigation
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161616] text-neutral-400 border border-[#262626]">
                    Paris Node
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-md bg-[#161616] hover:bg-[#202020] text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {/* Navigation Groups */}
              <div className="space-y-5">
                {navGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <span className="text-[10px] font-sans font-medium text-neutral-500 px-3 uppercase tracking-wider block">
                      {group.title}
                    </span>

                    <nav className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isItemActive(item);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-sans transition-all group",
                              active
                                ? "bg-[#E10600]/15 text-white font-medium border-l-2 border-[#E10600] pl-2.5 shadow-sm"
                                : "text-neutral-400 hover:text-white hover:bg-[#151515] font-normal border-l-2 border-transparent pl-2.5"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={cn(
                                  "w-4 h-4 shrink-0 transition-colors",
                                  active
                                    ? "text-[#E10600]"
                                    : "text-neutral-500 group-hover:text-neutral-300"
                                )}
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{item.label}</span>
                              </div>
                            </div>

                            {active ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-300 transition-colors shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Status Card */}
            <div className="pt-4 border-t border-[#222222] space-y-3">
              <div className="p-3 rounded-md border border-[#222222] bg-[#141414] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16803C] animate-pulse" />
                    <span className="font-medium text-neutral-200">
                      PostgreSQL Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Ready</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Local byte storage active. Real-time audit trails on stock and pricing.
                </p>
              </div>

              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 hover:text-white text-xs font-medium transition-colors border border-[#2E2E2E]"
              >
                <span>Visit Live Showroom</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#E10600]" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================================
          MAIN LAYOUT BODY (Desktop Sticky Sidebar + Main Content Area)
      ========================================================================= */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop Fixed/Sticky Sidebar (1024px+) */}
        <aside className="hidden lg:flex w-64 xl:w-72 border-r border-[#222222] bg-[#0B0B0B] shrink-0 sticky top-16 h-[calc(100vh-4rem)] flex-col justify-between p-4 overflow-y-auto popup-scroll">
          <div className="space-y-6">
            {/* Categorized Navigation Groups */}
            <div className="space-y-5">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <span className="text-[10px] font-sans font-medium text-neutral-500 px-3 uppercase tracking-wider block">
                    {group.title}
                  </span>

                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-md text-xs font-sans transition-all group",
                            active
                              ? "bg-[#E10600]/12 text-white font-medium border-l-2 border-[#E10600] pl-2.5 shadow-sm"
                              : "text-neutral-400 hover:text-white hover:bg-[#151515] font-normal border-l-2 border-transparent pl-2.5"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={cn(
                                "w-4 h-4 shrink-0 transition-colors",
                                active
                                  ? "text-[#E10600]"
                                  : "text-neutral-500 group-hover:text-neutral-300"
                              )}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {active ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-300 transition-colors shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Persistent Workshop Telemetry Card */}
          <div className="pt-4 border-t border-[#222222] space-y-3">
            <div className="p-3.5 rounded-md border border-[#222222] bg-[#141414] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#16803C] animate-pulse" />
                  <span className="font-sans font-medium text-xs text-white">
                    PostgreSQL Node
                  </span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Paris</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Direct byte storage active. Real-time audit logs on stock and pricing movements.
              </p>
              <div className="pt-1.5 border-t border-[#222222] flex items-center justify-between text-[10px] text-neutral-500">
                <span>Security: SSL Encrypted</span>
                <span className="text-emerald-400">Online</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 text-[10px] text-neutral-500 font-mono">
              <span>Presty Motors Staff Console</span>
              <span>v2.4.0</span>
            </div>
          </div>
        </aside>

        {/* Content Area - Responsive, Zero Overflow */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-[#0E0E0E]">
          {children}
        </main>
      </div>
    </div>
  );
}
