import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presty-motors.com";

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale } },
      images: { where: { isPrimary: true } },
    },
  });

  if (!product) {
    return {
      title: "Vehicle Not Found | Presty Motors",
    };
  }

  const trans = product.translations[0];
  const title = trans?.title || product.slug;
  const description =
    trans?.shortDescription ||
    trans?.description?.slice(0, 160) ||
    "Official Presty Motors competition machine.";
  const imageUrl = product.images[0]?.url || `${baseUrl}/images/hero-bike.jpg`;

  const alternatesLanguages: Record<string, string> = {
    "x-default": `${baseUrl}/fr/products/${slug}`,
  };
  for (const loc of routing.locales) {
    alternatesLanguages[loc] = `${baseUrl}/${loc}/products/${slug}`;
  }

  return {
    title: `${title} | Presty Motors Paris`,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/products/${slug}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title: `${title} | Presty Motors Paris`,
      description,
      url: `${baseUrl}/${locale}/products/${slug}`,
      siteName: "Presty Motors",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 675,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Presty Motors`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presty-motors.com";

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
  const inStock = (dbProduct.inventory?.quantity ?? 0) > 0;
  const activePrice = Number(dbProduct.salePrice ?? dbProduct.price);

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

  // Structured JSON-LD Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: serializedProduct.title,
    image: primaryImg?.url ? `${baseUrl}${primaryImg.url}` : undefined,
    description: serializedProduct.shortDescription || serializedProduct.title,
    sku: serializedProduct.sku,
    brand: {
      "@type": "Brand",
      name: "Presty Motors",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/${locale}/products/${slug}`,
      priceCurrency: serializedProduct.currency,
      price: activePrice.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "AutoDealer",
        name: "Presty Motors Paris",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView product={serializedProduct} />
    </>
  );
}
