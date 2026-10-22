import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routing, Locale } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "../globals.css";

export const metadata: Metadata = {
  title: "Presty Motors — Concessionnaire Motos, Quads & Équipements",
  description:
    "Showroom et vente en ligne de motos pour enfants et adultes, quads sportifs et utilitaires, pièces et équipements de protection.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col bg-white text-[#0B0B0B] font-sans antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <AnnouncementBar />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
