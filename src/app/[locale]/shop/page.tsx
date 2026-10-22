import { db } from "@/lib/db";
import { ShopCatalogView } from "@/components/catalog/ShopCatalogView";
import { SerializedProduct } from "@/components/products/InteractiveProductShowcase";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale } = await params;
  const { category: queryCategory } = await searchParams;

  // Query all published products from PostgreSQL
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
    orderBy: { createdAt: "desc" },
  });

  // Query categories
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

  // Serialize products
  const serializedProducts: SerializedProduct[] = dbProducts.map((p) => {
    const trans = p.translations[0];
    const catTrans = p.category.translations[0]?.name || p.category.slug;
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

  const categories = dbCategories.map((c) => ({
    slug: c.slug,
    name: c.translations[0]?.name || c.slug,
  }));

  return (
    <div className="bg-white min-h-screen">
      <ShopCatalogView
        initialProducts={serializedProducts}
        categories={categories}
        initialCategory={queryCategory || "all"}
      />
    </div>
  );
}
