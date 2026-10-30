import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { routing, Locale } from "@/i18n/routing";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StorefrontFrame } from "@/components/layout/StorefrontFrame";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presty-motors.com";

  const titles: Record<string, string> = {
    fr: "Presty Motors Paris — Concessionnaire Officiel Motos & Quads de Compétition",
    en: "Presty Motors Paris — Premier Competition Motorcycles & Quads Showroom",
    es: "Presty Motors París — Concesionario Oficial de Motos y Quads de Competición",
    ar: "بريستي موتورز باريس — معرض الدراجات النارية والرباعية الرسمية للمنافسات",
  };

  const descriptions: Record<string, string> = {
    fr: "Showroom flagship à Paris 16e et boutique en ligne spécialisée : motos de compétition pour enfants et adultes, quads tout-terrain, pièces détachées et équipements pilote.",
    en: "Paris 16th flagship showroom and specialized online store: competition motocross, kids' trainers, all-terrain quads, racing gear, and bespoke worldwide freight.",
    es: "Showroom insignia en París 16e y tienda online especializada: motocross de competición, quads todoterreno y equipamiento oficial con envíos internacionales.",
    ar: "صالة العرض الرئيسية في باريس الدائرة 16 والمتجر الإلكتروني المتخصص: دراجات نارية للمنافسات للأطفال والبالغين ودراجات رباعية وشحن دولي مخصص.",
  };

  const title = titles[locale] || titles.fr;
  const description = descriptions[locale] || descriptions.fr;

  const alternatesLanguages: Record<string, string> = {
    "x-default": `${baseUrl}/fr`,
  };
  for (const loc of routing.locales) {
    alternatesLanguages[loc] = `${baseUrl}/${loc}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Presty Motors Paris",
    },
    description,
    keywords: [
      "moto cross",
      "motocross paris",
      "quad paris",
      "concessionnaire moto",
      "ktm 50 sx",
      "yamaha yz125",
      "can-am renegade",
      "polaris outlaw",
      "equipement motard",
      "presty motors",
    ],
    authors: [{ name: "Presty Motors Flagship Team" }],
    creator: "Presty Motors",
    publisher: "Presty Motors Paris",
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: "Presty Motors Paris",
      locale: locale === "ar" ? "ar_AR" : locale === "es" ? "es_ES" : locale === "en" ? "en_US" : "fr_FR",
      type: "website",
      images: [
        {
          url: `${baseUrl}/images/hero-bike.jpg`,
          width: 1200,
          height: 675,
          alt: "Presty Motors Paris Flagship Showroom",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/images/hero-bike.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const isRtl = locale === "ar";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presty-motors.com";

  // Global Dealer / Store Structured Data
  const dealerJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "Presty Motors Paris",
    url: `${baseUrl}/${locale}`,
    logo: `${baseUrl}/images/hero-bike.jpg`,
    image: `${baseUrl}/images/showroom-flagship.jpg`,
    description: "Official motorsport showroom specializing in competition motorcycles, training bikes, and ATVs.",
    telephone: "+33 1 42 68 55 00",
    email: "contact@presty-motors.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "128 Avenue des Sports Motorisés",
      addressLocality: "Paris",
      postalCode: "75016",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "48.8566",
      longitude: "2.2600",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    priceRange: "€€€",
  };

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-white text-[#0B0B0B] font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <StorefrontFrame>
              <AnnouncementBar />
              <SiteHeader />
            </StorefrontFrame>
            <main className="flex-1">{children}</main>
            <StorefrontFrame>
              <SiteFooter />
              <CartDrawer />
            </StorefrontFrame>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
