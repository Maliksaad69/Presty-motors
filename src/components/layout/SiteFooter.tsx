import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const common = useTranslations("common");

  return (
    <footer className="bg-[#0A0A0A] text-neutral-300 border-t border-neutral-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded bg-[#DC2626] flex items-center justify-center text-white font-extrabold text-lg">
                PM
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white uppercase">
                PRESTY <span className="text-[#DC2626]">MOTORS</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
              {t("description")}
            </p>
            <div className="space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>128 Avenue des Sports Motorisés, Paris</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>+33 1 45 67 89 00</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#DC2626] shrink-0" />
                <span>contact@presty-motors.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-base font-bold uppercase tracking-wider text-white mb-4">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#DC2626] transition-colors">
                  {nav("home")}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#DC2626] transition-colors">
                  {nav("catalog")}
                </Link>
              </li>
              <li>
                <Link href="/showroom" className="hover:text-[#DC2626] transition-colors">
                  {nav("showroom")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#DC2626] transition-colors">
                  {nav("contact")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#DC2626] transition-colors">
                  {nav("about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-base font-bold uppercase tracking-wider text-white mb-4">
              {t("categories")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/shop?category=kids-motorcycles" className="hover:text-[#DC2626] transition-colors">
                  {nav("motorcycles")} — Kids
                </Link>
              </li>
              <li>
                <Link href="/shop?category=adult-motorcycles" className="hover:text-[#DC2626] transition-colors">
                  {nav("motorcycles")} — Adult
                </Link>
              </li>
              <li>
                <Link href="/shop?category=quad-bikes" className="hover:text-[#DC2626] transition-colors">
                  {nav("quads")}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=riding-equipment" className="hover:text-[#DC2626] transition-colors">
                  {nav("equipment")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policies */}
          <div>
            <h4 className="font-heading text-base font-bold uppercase tracking-wider text-white mb-4">
              {t("legal")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/terms" className="hover:text-[#DC2626] transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#DC2626] transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#DC2626] transition-colors">
                  {t("shipping")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#DC2626] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {common("brandName")}. {t("rights")}</p>
          <div className="flex items-center gap-6 text-neutral-400">
            <span>Racing Performance</span>
            <span>•</span>
            <span>Showroom Certifié</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
