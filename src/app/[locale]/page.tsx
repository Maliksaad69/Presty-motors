import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Wrench,
  Award,
  ChevronRight,
  MapPin,
  Clock,
  Phone,
} from "lucide-react";
import Image from "next/image";
import {
  InteractiveProductShowcase,
  SerializedProduct,
} from "@/components/products/InteractiveProductShowcase";

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

  // Fetch products from PostgreSQL
  const dbProducts = await db.product.findMany({
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
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  // Fetch categories with translations
  const dbCategories = await db.category.findMany({
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

  // Serialize products for client component
  const serializedProducts: SerializedProduct[] = dbProducts.map((p) => {
    const trans = p.translations[0];
    const catTrans = p.category.translations[0]?.name || p.category.slug;
    const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];

    return {
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      currency: p.currency,
      vehicleType: p.vehicleType,
      ageGroup: p.ageGroup,
      engineCapacity: p.engineCapacity,
      categorySlug: p.category.slug,
      categoryName: catTrans,
      title: trans?.title || p.slug,
      shortDescription: trans?.shortDescription || "",
      primaryImage: primaryImg?.url || null,
      stock: p.inventory?.quantity ?? 0,
    };
  });

  const serializedCategories = dbCategories.map((c) => ({
    slug: c.slug,
    name: c.translations[0]?.name || c.slug,
  }));

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section (White / Black / Red, No Badges) */}
      <section className="relative overflow-hidden bg-[#0A0A0A] text-white py-20 lg:py-28 border-b border-neutral-900">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#DC2626_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs uppercase tracking-widest font-bold text-[#DC2626]">
                Presty Motors Showroom
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none">
                PUISSANCE. <span className="text-[#DC2626]">ADRÉNALINE.</span> PRÉCISION.
              </h1>

              <p className="text-lg text-neutral-300 max-w-2xl leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-8 py-4 rounded bg-[#DC2626] hover:bg-[#B91C1C] text-white font-heading font-black text-lg tracking-wide uppercase transition-all duration-200 shadow-lg shadow-red-700/25"
                >
                  <span>{t("ctaShop")}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

                <Link
                  href="/showroom"
                  className="inline-flex items-center justify-center px-8 py-4 rounded bg-transparent hover:bg-white hover:text-black text-white font-heading font-bold text-lg tracking-wide uppercase border border-neutral-700 hover:border-white transition-all duration-200"
                >
                  {t("ctaShowroom")}
                </Link>
              </div>

              {/* Minimal metrics row (clean typography, no badges) */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-neutral-800">
                <div>
                  <p className="font-heading text-3xl font-black text-white">100%</p>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                    Véhicules Neufs
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl font-black text-[#DC2626]">Paris</p>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                    Showroom Dédié
                  </p>
                </div>
                <div>
                  <p className="font-heading text-3xl font-black text-white">48h</p>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mt-1">
                    Expédition Express
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Vehicle Display (No Badges) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded overflow-hidden border border-neutral-800 bg-neutral-900 aspect-4/3 shadow-2xl group">
                <Image
                  src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80"
                  alt="Yamaha Racing Motocross"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 border border-neutral-800 bg-black/80 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#DC2626] tracking-wider">
                        Yamaha Racing
                      </p>
                      <h4 className="font-heading text-xl font-bold text-white uppercase">
                        YZ125 Monster Energy Edition
                      </h4>
                    </div>
                    <span className="font-heading text-2xl font-black text-[#DC2626]">
                      8 299 €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section with Interactive Filter & Add-to-Cart */}
      <section className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                Catalogue Véhicules & Équipements
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase text-[#0A0A0A] mt-1">
                {tFeat("title")}
              </h2>
              <p className="text-neutral-500 mt-2 text-sm max-w-xl">
                Sélectionnez une catégorie ci-dessous pour filtrer en direct les machines et ajouter directement vos articles au panier.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#DC2626] hover:text-black uppercase tracking-wider transition-colors"
            >
              <span>{common("shopNow")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Interactive Client Component */}
          <InteractiveProductShowcase
            products={serializedProducts}
            categories={serializedCategories}
            translations={{
              allCategories: "Tous les modèles",
              addToCart: "Ajouter",
              added: "Ajouté !",
              viewDetails: "Fiche",
              inStock: common("inStock"),
              outOfStock: common("outOfStock"),
            }}
          />
        </div>
      </section>

      {/* Categories Grid (Clean White / Black / Red, No Badges) */}
      <section className="py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#DC2626]">
              Univers Motorsport
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase text-[#0A0A0A] mt-1">
              {tCat("title")}
            </h2>
            <p className="text-neutral-600 mt-2 text-sm">
              {tCat("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbCategories.map((cat) => {
              const trans = cat.translations[0];
              const name = trans?.name || cat.slug;
              const desc = trans?.description || "";

              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group rounded border border-neutral-200 bg-white p-6 hover:border-[#DC2626] hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-1 bg-[#DC2626] mb-6 group-hover:w-full transition-all duration-300" />
                    <h3 className="font-heading text-2xl font-black uppercase text-[#0A0A0A] group-hover:text-[#DC2626] transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-[#DC2626]">
                    <span>{cat._count.products} modèles</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Showroom Introduction (Black / White / Red) */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#DC2626]">
                Expérience Showroom
              </span>
              <h2 className="font-heading text-4xl sm:text-5xl font-black uppercase text-white leading-tight">
                VISITEZ NOTRE SHOWROOM PARISIEN
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Venez découvrir, essayer et configurer votre future moto ou quad directement auprès de nos spécialistes mécaniques et pilotes d'essais.
              </p>

              <div className="space-y-4 pt-2 text-sm text-neutral-300">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <span>128 Avenue des Sports Motorisés, 75016 Paris</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <span>Mardi au Samedi: 9h00 - 19h00 (Essais sur rendez-vous)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#DC2626] shrink-0" />
                  <span>Ligne directe atelier & showroom: +33 1 45 67 89 00</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/showroom"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded bg-white hover:bg-neutral-200 text-black font-heading font-black text-sm uppercase tracking-wider transition-colors"
                >
                  <span>Prendre rendez-vous showroom</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded overflow-hidden border border-neutral-800 aspect-16/10">
                <Image
                  src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
                  alt="Showroom Presty Motors"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section (Clean White Background) */}
      <section className="py-16 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-black text-white flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#0A0A0A]">
                  {tTrust("showroomTitle")}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {tTrust("showroomDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-black text-white flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#0A0A0A]">
                  {tTrust("deliveryTitle")}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {tTrust("deliveryDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-black text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#0A0A0A]">
                  {tTrust("quoteTitle")}
                </h4>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {tTrust("quoteDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-black text-white flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold uppercase text-[#0A0A0A]">
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
    </div>
  );
}
