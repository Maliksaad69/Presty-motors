import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/products/ProductDetailView";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;

  // Query product from PostgreSQL
  const dbProduct = await db.product.findUnique({
    where: { slug },
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
  });

  if (!dbProduct) {
    notFound();
  }

  // Related products in the same category
  const relatedDb = await db.product.findMany({
    where: {
      categoryId: dbProduct.categoryId,
      id: { not: dbProduct.id },
      status: "PUBLISHED",
    },
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
    take: 4,
  });

  const trans = dbProduct.translations[0];
  const catTrans = dbProduct.category.translations[0]?.name || dbProduct.category.slug;
  const primaryImg = dbProduct.images.find((img) => img.isPrimary) || dbProduct.images[0];
  const rawSpecs = trans?.specifications as Record<string, unknown> | null;

  const serializedProduct = {
    id: dbProduct.id,
    slug: dbProduct.slug,
    sku: dbProduct.sku,
    price: Number(dbProduct.price),
    salePrice: dbProduct.salePrice ? Number(dbProduct.salePrice) : null,
    currency: dbProduct.currency,
    vehicleType: dbProduct.vehicleType,
    ageGroup: dbProduct.ageGroup,
    engineCapacity: dbProduct.engineCapacity,
    categorySlug: dbProduct.category.slug,
    categoryName: catTrans,
    title: trans?.title || dbProduct.slug,
    shortDescription: trans?.shortDescription || "",
    primaryImage: primaryImg?.url || null,
    stock: dbProduct.inventory?.quantity ?? 0,
    specifications: rawSpecs,
    images: dbProduct.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
    })),
    relatedProducts: relatedDb.map((p) => {
      const pTrans = p.translations[0];
      const pCatTrans = p.category.translations[0]?.name || p.category.slug;
      const pImg = p.images.find((img) => img.isPrimary) || p.images[0];
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
        categoryName: pCatTrans,
        title: pTrans?.title || p.slug,
        shortDescription: pTrans?.shortDescription || "",
        primaryImage: pImg?.url || null,
        stock: p.inventory?.quantity ?? 0,
      };
    }),
  };

  return <ProductDetailView product={serializedProduct} />;
}
