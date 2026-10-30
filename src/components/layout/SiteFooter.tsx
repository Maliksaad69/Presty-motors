import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin, Mail, Phone, ShieldCheck, Zap } from "lucide-react";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const common = useTranslations("common");

  return (
    <footer className="bg-[#0B0B0B] text-neutral-300 border-t border-[#171717] pt-14 pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          
          {/* Brand & Showroom Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#E10600] flex items-center justify-center text-white font-heading font-medium text-sm shadow-md">
                PM
              </div>
              <span className="font-heading text-lg font-medium tracking-tight text-white uppercase">
                PRESTY <span className="text-[#E10600]">MOTORS</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm font-normal">
              {t("description")}
            </p>
            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-[#E10600] shrink-0 mt-0.5" />
                <span>128 Avenue des Sports Motorisés, 75016 Paris</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                <span className="font-mono">+33 1 45 67 89 00</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
                <span>contact@presty-motors.com</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-[#171717] pb-2">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link href="/" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("home")}</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("catalog")}</span>
                </Link>
              </li>
              <li>
                <Link href="/showroom" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("showroom")}</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("contact")}</span>
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("account")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-[#171717] pb-2">
              {t("categories")}
            </h4>
            <ul className="space-y-2.5 text-xs font-normal">
              <li>
                <Link href="/shop?category=kids-motorcycles" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("motorcycles")} — Kids</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=adult-motorcycles" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("motorcycles")} — Adult</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=quad-bikes" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("quads")}</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=riding-equipment" className="hover:text-[#E10600] transition-colors flex items-center gap-1.5">
                  <span className="text-[#E10600] text-[10px]">›</span>
                  <span>{nav("equipment")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Motorsport Assurance & Support */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-white mb-4 border-b border-[#171717] pb-2">
              Motorsport Assurance
            </h4>
            <div className="space-y-3 text-xs text-neutral-400 font-normal">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-heading uppercase text-xs font-medium">Official Warranty</strong>
                  <span className="text-[11px]">Manufacturer backing on all new vehicles and parts.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-heading uppercase text-xs font-medium">PDI Preparation</strong>
                  <span className="text-[11px]">Every machine undergoes rigorous dynamometer and workshop setup.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#171717] text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {common("brandName")}. {t("rights")}</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="text-[#E10600] font-heading font-medium tracking-wider uppercase">F1 & Motocross Inspired</span>
            <span>•</span>
            <span>Paris Showroom</span>
            <span>•</span>
            <span>Worldwide Crating</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
