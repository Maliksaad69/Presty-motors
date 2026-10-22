import { Link } from "@/i18n/routing";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Globe,
  Tag,
  Settings,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Catalog & Machines", href: "/admin/products", icon: Package },
    { label: "Inventory & Audits", href: "/admin/inventory", icon: Boxes },
    { label: "Orders Management", href: "/admin/orders", icon: ShoppingBag },
    { label: "Shipping Quotations", href: "/admin/quotes", icon: Globe },
    { label: "Promotions & Codes", href: "/admin/promotions", icon: Tag },
    { label: "Store Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex flex-col">
      {/* Top Admin Bar */}
      <header className="h-14 border-b border-[#222222] bg-[#0B0B0B] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-heading font-black text-base uppercase tracking-wider text-white">
              Presty<span className="text-[#E10600]">Motors</span>
            </span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 font-bold uppercase tracking-wider">
            Admin Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#171717] border border-[#262626] text-[11px] font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16803C] animate-pulse" />
            <span>Role: Superadmin (Staff)</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 hover:text-white text-xs font-heading font-black uppercase tracking-wider transition-colors border border-[#2E2E2E]"
          >
            <span>Live Showroom</span>
            <ExternalLink className="w-3 h-3 text-[#E10600]" />
          </Link>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#222222] bg-[#0B0B0B] shrink-0 p-4 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#737373] px-3">
              Operations Navigation
            </span>

            <nav className="space-y-1 pt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded text-xs font-heading font-bold uppercase tracking-wider text-neutral-300 hover:text-white hover:bg-[#181818] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-neutral-500 group-hover:text-[#E10600] transition-colors" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-neutral-600 group-hover:text-neutral-300 transition-colors" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 rounded border border-[#222222] bg-[#141414] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-[#E10600]" />
              <span className="font-heading font-bold text-[11px] uppercase tracking-wider text-white">
                Paris Workshop Node
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              PostgreSQL connected. All inventory actions generate immutable audit log movements.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#0E0E0E]">
          {children}
        </main>
      </div>
    </div>
  );
}
