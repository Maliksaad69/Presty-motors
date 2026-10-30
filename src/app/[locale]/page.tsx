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
import { PromotionalBanner } from "@/components/home/PromotionalBanner";
import { InteractiveShowroomSection } from "@/components/home/InteractiveShowroomSection";
import {
  MotionSection,
  MotionStagger,
  MotionCard,
  MotionItem,
} from "@/components/ui/motion-container";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const tCat = await getTranslations("categories");
  const tCatSection = await getTranslations("catalogSection");
  const tTrust = await getTranslations("trust");
  const common = await getTranslations("common");

  // Fetch products from PostgreSQL
  const dbProducts = await db.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      translations: true,
      images: {
        orderBy: { sortOrder: "asc" },
      },
      category: {
        include: {
          translations: true,
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
      translations: true,
      _count: {
        select: { products: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  // Serialize all products for the interactive catalog
  const serializedProducts: SerializedProduct[] = dbProducts.map((p) => {
    const trans = p.translations.find((t) => t.locale === locale) || p.translations[0];
    const catTrans =
      p.category.translations.find((t) => t.locale === locale)?.name ||
      p.category.translations[0]?.name ||
      p.category.slug;
    const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
    const rawSpecs = trans?.specifications as Record<string, unknown> | null;

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
    const trans = p.translations.find((t) => t.locale === locale) || p.translations[0];
    const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
    const specs = (trans?.specifications || {}) as Record<string, string>;

    return {
      id: p.id,
      slug: p.slug,
      sku: p.sku,
      title: trans?.title || p.slug,
      subtitle: p.engineCapacity ? `${p.engineCapacity} Motorsport Series` : "High Performance",
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
    name:
      c.translations.find((t) => t.locale === locale)?.name ||
      c.translations[0]?.name ||
      c.slug,
  }));

  return (
    <div className="flex flex-col bg-white">
      {/* 1. Hero Machine Controller & HUD (with Framer Motion Vehicle Switching) */}
      <DynamicHeroShowcase vehicles={heroVehicles} />

      {/* 2. Product Categories: with Framer Motion Staggered Cards */}
      <MotionSection className="py-12 sm:py-16 bg-[#F5F5F5] border-b border-[#E2E2E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                <span className="text-[10px] font-heading font-medium uppercase tracking-widest text-[#E10600]">
                  {tCat("badge")}
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold uppercase text-[#0B0B0B] tracking-tight">
                {tCat("title")}
              </h2>
              <p className="text-[#737373] mt-0.5 text-xs max-w-xl font-normal">
                {tCat("subtitle")}
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-heading font-medium text-[#E10600] hover:text-[#0B0B0B] uppercase tracking-wider transition-colors shrink-0"
            >
              <span>{common("shopNow")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dbCategories.map((cat) => {
              const trans = cat.translations.find((t) => t.locale === locale) || cat.translations[0];
              const name = trans?.name || cat.slug;
              const desc = trans?.description || "";

              return (
                <MotionCard key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="group rounded border border-[#E2E2E2] bg-white p-5 hover:border-[#0B0B0B] hover:shadow-lg transition-all duration-200 flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="w-8 h-1 bg-[#E10600] mb-3 group-hover:w-full transition-all duration-300" />
                      <h3 className="font-heading text-base font-semibold uppercase text-[#0B0B0B] group-hover:text-[#E10600] transition-colors">
                        {name}
                      </h3>
                      <p className="text-xs text-[#737373] mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {desc}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-heading font-medium text-[#0B0B0B] group-hover:text-[#E10600]">
                      <span>{tCatSection("modelsCount", { count: cat._count.products })}</span>
                      <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#E10600]" />
                    </div>
                  </Link>
                </MotionCard>
              );
            })}
          </MotionStagger>
        </div>
      </MotionSection>

      {/* 3. Featured Products Grid with Live Search, Filter Tabs & Quick View */}
      <MotionSection className="py-14 sm:py-20 bg-white border-b border-[#E2E2E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                <span className="text-[10px] font-heading font-medium uppercase tracking-widest text-[#E10600]">
                  {tCatSection("badge")}
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold uppercase text-[#0B0B0B] tracking-tight leading-tight">
                {tCatSection("title")}
              </h2>
              <p className="text-[#737373] mt-0.5 text-xs max-w-xl font-normal">
                {tCatSection("subtitle")}
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-heading font-medium text-[#E10600] hover:text-[#0B0B0B] uppercase tracking-wider transition-colors shrink-0"
            >
              <span>{common("shopNow")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Interactive Client Component with Layout Animation */}
          <InteractiveProductShowcase
            products={serializedProducts}
            categories={serializedCategories}
          />
        </div>
      </MotionSection>

      {/* 4. Bold Motorsport Promotional Banner with Pulsing Ambient Light */}
      <PromotionalBanner />

      {/* 5. Showroom & Paris Test Ride Booking */}
      <InteractiveShowroomSection />

      {/* 6. Trust & Service Pillars with Staggered Motion */}
      <MotionSection className="py-14 sm:py-18 bg-white border-t border-[#E2E2E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <MotionCard className="flex items-start gap-3.5 p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] hover:border-[#0B0B0B] transition-colors">
              <div className="w-9 h-9 rounded bg-[#0B0B0B] text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 text-[#E10600]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                  {tTrust("showroomTitle")}
                </h4>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed font-normal">
                  {tTrust("showroomDesc")}
                </p>
              </div>
            </MotionCard>

            <MotionCard className="flex items-start gap-3.5 p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] hover:border-[#0B0B0B] transition-colors">
              <div className="w-9 h-9 rounded bg-[#0B0B0B] text-white flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 text-[#E10600]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                  {tTrust("deliveryTitle")}
                </h4>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed font-normal">
                  {tTrust("deliveryDesc")}
                </p>
              </div>
            </MotionCard>

            <MotionCard className="flex items-start gap-3.5 p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] hover:border-[#0B0B0B] transition-colors">
              <div className="w-9 h-9 rounded bg-[#0B0B0B] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#E10600]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                  {tTrust("quoteTitle")}
                </h4>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed font-normal">
                  {tTrust("quoteDesc")}
                </p>
              </div>
            </MotionCard>

            <MotionCard className="flex items-start gap-3.5 p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] hover:border-[#0B0B0B] transition-colors">
              <div className="w-9 h-9 rounded bg-[#0B0B0B] text-white flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-[#E10600]" />
              </div>
              <div>
                <h4 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                  {tTrust("supportTitle")}
                </h4>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed font-normal">
                  {tTrust("supportDesc")}
                </p>
              </div>
            </MotionCard>
          </MotionStagger>
        </div>
      </MotionSection>
    </div>
  );
}
