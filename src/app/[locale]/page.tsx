import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import {
  ShieldCheck,
  Truck,
  Wrench,
  Award,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import {
  DynamicHeroShowcase,
  HeroVehicle,
} from "@/components/home/DynamicHeroShowcase";
import {
  InteractiveProductShowcase,
  SerializedProduct,
} from "@/components/products/InteractiveProductShowcase";
import { InteractiveShowroomSection } from "@/components/home/InteractiveShowroomSection";

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

  // Serialize all products for the interactive catalog
  const serializedProducts: SerializedProduct[] = dbProducts.map((p) => {
    const trans = p.translations[0];
    const catTrans = p.category.translations[0]?.name || p.category.slug;
    const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
    const rawSpecs = trans?.specifications as Record<string, any> | null;

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
      specifications: rawSpecs,
    };
  });

  // Hero machines configuration
  const heroVehicles: HeroVehicle[] = dbProducts.slice(0, 3).map((p) => {
    const trans = p.translations[0];
    const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
    const specs = (trans?.specifications || {}) as Record<string, string>;

    return {
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      title: trans?.title || p.slug,
      subtitle: p.engineCapacity ? `${p.engineCapacity} Motorsport` : "High Performance",
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      currency: p.currency,
      image:
        primaryImg?.url ||
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
      engine: p.engineCapacity || specs["Moteur"]?.slice(0, 15) || "4-temps",
      powerOrTransmission: specs["Boîte de vitesses"] || specs["Transmission"] || "Manuel 6V",
      weight: specs["Poids à sec"] || specs["Poids tous pleins faits"] || "95 kg",
      seatHeight: specs["Hauteur de selle"] || specs["Garde au sol"] || "Standard",
      description: trans?.shortDescription || "",
    };
  });

  const serializedCategories = dbCategories.map((c) => ({
    slug: c.slug,
    name: c.translations[0]?.name || c.slug,
  }));

  return (
    <div className="flex flex-col bg-white">
      {/* 1. Dynamic Hero Machine Controller & HUD (Compact Typography, No Badges) */}
      <DynamicHeroShowcase
        vehicles={heroVehicles}
        ctaShopText={t("ctaShop")}
        ctaShowroomText={t("ctaShowroom")}
      />

      {/* 2. Featured Vehicles Catalog with Live Search, Filter Tabs & Quick View Modal */}
      <section className="py-14 sm:py-18 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626]">
                  Showroom En Direct
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-[#0A0A0A] leading-tight">
                {tFeat("title")}
              </h2>
              <p className="text-neutral-500 mt-1 text-xs sm:text-sm max-w-xl">
                Explorez nos modèles, filtrez par catégorie ou puissance, inspectez les fiches techniques complètes et ajoutez directement à votre panier.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DC2626] hover:text-black uppercase tracking-wider transition-colors shrink-0"
            >
              <span>{common("shopNow")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
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

      {/* 3. Categories Navigation Grid (Refined, Compact Scale) */}
      <section className="py-14 sm:py-18 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#DC2626]">
              Univers Presty Motors
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-[#0A0A0A] mt-1">
              {tCat("title")}
            </h2>
            <p className="text-neutral-500 mt-1 text-xs sm:text-sm">
              {tCat("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dbCategories.map((cat) => {
              const trans = cat.translations[0];
              const name = trans?.name || cat.slug;
              const desc = trans?.description || "";

              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group rounded border border-neutral-200 bg-white p-5 hover:border-[#DC2626] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-0.5 bg-[#DC2626] mb-4 group-hover:w-full transition-all duration-300" />
                    <h3 className="font-heading text-lg font-bold uppercase text-[#0A0A0A] group-hover:text-[#DC2626] transition-colors">
                      {name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1.5 line-clamp-3 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-black group-hover:text-[#DC2626]">
                    <span>{cat._count.products} modèles</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Interactive Showroom & Paris Test Ride Booking */}
      <InteractiveShowroomSection />

      {/* 5. Trust & Service Pillars (Clean, Downscaled Typography) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold uppercase text-[#0A0A0A]">
                  {tTrust("showroomTitle")}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {tTrust("showroomDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold uppercase text-[#0A0A0A]">
                  {tTrust("deliveryTitle")}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {tTrust("deliveryDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold uppercase text-[#0A0A0A]">
                  {tTrust("quoteTitle")}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                  {tTrust("quoteDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-[#DC2626]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold uppercase text-[#0A0A0A]">
                  {tTrust("supportTitle")}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
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
