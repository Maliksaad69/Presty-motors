import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Wrench,
  Award,
  Gauge,
  Calendar,
  CheckCircle2,
  Database,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("hero");
  const tCat = await getTranslations("categories");
  const tFeat = await getTranslations("featured");
  const tTrust = await getTranslations("trust");
  const common = await getTranslations("common");

  // Fetch featured products from PostgreSQL
  const featuredProducts = await db.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      translations: {
        where: { locale },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      category: {
        include: {
          translations: {
            where: { locale },
          },
        },
      },
      inventory: true,
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  // Fetch categories with translations
  const categories = await db.category.findMany({
    where: { isActive: true },
    include: {
      translations: {
        where: { locale },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#171A18] text-white py-20 lg:py-28">
        <div className="absolute inset-0 z-0 opacity-25 bg-[radial-gradient(#27C85A_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#16803C]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16803C]/20 border border-[#27C85A]/40 text-[#27C85A] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#27C85A] animate-pulse" />
                {t("badge")}
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
                {t("title")}
              </h1>

              <p className="text-lg text-neutral-300 max-w-2xl leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#27C85A] hover:bg-[#22B550] text-[#171A18] font-heading font-black text-lg tracking-wide uppercase shadow-lg shadow-[#27C85A]/20 transition-all transform hover:-translate-y-0.5"
                >
                  {t("ctaShop")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

                <Link
                  href="/showroom"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-transparent hover:bg-white/10 text-white font-heading font-bold text-lg tracking-wide uppercase border border-neutral-700 transition-colors"
                >
                  {t("ctaShowroom")}
                </Link>
              </div>

              {/* Quick stats banner */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-800 text-left">
                <div>
                  <p className="font-heading text-3xl font-black text-[#27C85A]">100%</p>
                  <p className="text-xs text-neutral-400">Véhicules Homologués</p>
                </div>
                <div>
                  <p className="font-heading text-3xl font-black text-[#27C85A]">4</p>
                  <p className="text-xs text-neutral-400">Langues Supportées</p>
                </div>
                <div>
                  <p className="font-heading text-3xl font-black text-[#27C85A]">Postgres</p>
                  <p className="text-xs text-neutral-400">Base Docker Connectée</p>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 aspect-4/3">
                <Image
                  src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80"
                  alt="Yamaha Racing Motocross"
                  fill
                  priority
                  className="object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#27C85A] font-bold uppercase tracking-wider">
                        En vedette au showroom
                      </span>
                      <h4 className="font-heading text-xl font-bold text-white uppercase">
                        Yamaha YZ125 Racing
                      </h4>
                    </div>
                    <span className="font-heading text-2xl font-black text-white">
                      8 299 €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-[#F7F8F5] border-b border-[#D7DDD7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#16803C]">
              Presty Motors Catalog
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase text-[#171A18] mt-2">
              {tCat("title")}
            </h2>
            <p className="text-neutral-600 mt-3 text-base">
              {tCat("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const trans = cat.translations[0];
              const name = trans?.name || cat.slug;
              const desc = trans?.description || "";

              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-white border border-[#D7DDD7] p-6 shadow-xs hover:shadow-xl hover:border-[#16803C] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-[#E9ECE8] group-hover:bg-[#16803C] text-[#16803C] group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-300">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-2xl font-black uppercase text-[#171A18] group-hover:text-[#16803C] transition-colors">
                      {name}
                    </h3>
                    <p className="text-sm text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#16803C]">
                    <span>{cat._count.products} modèles disponibles</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products from PostgreSQL */}
      <section className="py-20 bg-white border-b border-[#D7DDD7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#16803C]">
                Sélection du Moment
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase text-[#171A18] mt-2">
                {tFeat("title")}
              </h2>
              <p className="text-neutral-600 mt-2 text-base">
                {tFeat("subtitle")}
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#16803C] hover:text-[#0E5C2A]"
            >
              <span>{common("shopNow")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((p) => {
              const trans = p.translations[0];
              const title = trans?.title || p.slug;
              const shortDesc = trans?.shortDescription || "";
              const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
              const inStock = (p.inventory?.quantity ?? 0) > 0;
              const catTrans = p.category.translations[0]?.name || p.category.slug;

              return (
                <div
                  key={p.id}
                  className="rounded-xl overflow-hidden bg-[#F7F8F5] border border-[#D7DDD7] hover:border-[#16803C] hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-16/10 bg-neutral-900 overflow-hidden">
                    {primaryImg ? (
                      <Image
                        src={primaryImg.url}
                        alt={primaryImg.altText || title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 font-heading">
                        No Photo
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 rounded-sm bg-[#171A18]/80 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider">
                        {catTrans}
                      </span>
                      {p.engineCapacity && (
                        <span className="px-2 py-0.5 rounded-sm bg-[#16803C] text-white text-[10px] font-bold uppercase">
                          {p.engineCapacity}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          inStock
                            ? "bg-emerald-500/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}
                      >
                        {inStock ? common("inStock") : common("outOfStock")}
                      </span>
                    </div>
                  </div>

                  {/* Product Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">
                        SKU: {p.sku} {p.ageGroup ? `• ${p.ageGroup}` : ""}
                      </div>
                      <h3 className="font-heading text-2xl font-black text-[#171A18] uppercase leading-tight group-hover:text-[#16803C] transition-colors">
                        {title}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                        {shortDesc}
                      </p>
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-6 mt-6 border-t border-[#D7DDD7] flex items-center justify-between">
                      <div>
                        {p.salePrice ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading text-2xl font-black text-[#16803C]">
                              {Number(p.salePrice).toLocaleString("fr-FR", {
                                style: "currency",
                                currency: p.currency,
                              })}
                            </span>
                            <span className="text-xs text-neutral-500 line-through">
                              {Number(p.price).toLocaleString("fr-FR", {
                                style: "currency",
                                currency: p.currency,
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="font-heading text-2xl font-black text-[#171A18]">
                            {Number(p.price).toLocaleString("fr-FR", {
                              style: "currency",
                              currency: p.currency,
                            })}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/products/${p.slug}`}
                        className="px-4 py-2 rounded-md bg-[#16803C] hover:bg-[#0E5C2A] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        {common("viewDetails")}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="py-16 bg-[#F7F8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#171A18]">
                  {tTrust("showroomTitle")}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {tTrust("showroomDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#171A18]">
                  {tTrust("deliveryTitle")}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {tTrust("deliveryDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#171A18]">
                  {tTrust("quoteTitle")}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {tTrust("quoteDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 text-[#16803C] flex items-center justify-center shrink-0">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#171A18]">
                  {tTrust("supportTitle")}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {tTrust("supportDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure & Database Status Callout (Milestone 1 Verification) */}
      <section className="py-10 bg-[#171A18] border-t border-neutral-800 text-neutral-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#16803C]/20 border border-[#27C85A]/40 text-[#27C85A] flex items-center justify-center shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Milestone 1 Active: PostgreSQL 17 + Prisma 7 ORM
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Instance: <code className="text-emerald-400">cyberguard-postgres:5432</code> | Database: <code className="text-emerald-400">presty_motors</code> | Seeded Vehicles: {featuredProducts.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/api/health"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors border border-neutral-700"
              >
                <span>Vérifier Health API</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
