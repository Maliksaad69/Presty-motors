import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presty-motors.com";
  const locales = routing.locales; // ['fr', 'en', 'es', 'ar']
  const defaultLocale = routing.defaultLocale; // 'fr'

  // Fetch published products and categories from PostgreSQL
  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Static Storefront Routes
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/shop", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/showroom", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/cart", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/checkout", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/account", priority: 0.5, changeFrequency: "monthly" as const },
  ];

  for (const route of staticRoutes) {
    const alternatesLanguages: Record<string, string> = {
      "x-default": `${baseUrl}/${defaultLocale}${route.path}`,
    };
    for (const loc of locales) {
      alternatesLanguages[loc] = `${baseUrl}/${loc}${route.path}`;
    }

    for (const loc of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${loc}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: alternatesLanguages,
        },
      });
    }
  }

  // Dynamic Product Pages
  for (const prod of products) {
    const prodPath = `/products/${prod.slug}`;
    const alternatesLanguages: Record<string, string> = {
      "x-default": `${baseUrl}/${defaultLocale}${prodPath}`,
    };
    for (const loc of locales) {
      alternatesLanguages[loc] = `${baseUrl}/${loc}${prodPath}`;
    }

    for (const loc of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${loc}${prodPath}`,
        lastModified: prod.updatedAt,
        changeFrequency: "daily",
        priority: 0.85,
        alternates: {
          languages: alternatesLanguages,
        },
      });
    }
  }

  // Dynamic Category Filters on Shop
  for (const cat of categories) {
    const catPath = `/shop?category=${cat.slug}`;
    const alternatesLanguages: Record<string, string> = {
      "x-default": `${baseUrl}/${defaultLocale}${catPath}`,
    };
    for (const loc of locales) {
      alternatesLanguages[loc] = `${baseUrl}/${loc}${catPath}`;
    }

    for (const loc of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${loc}${catPath}`,
        lastModified: cat.updatedAt,
        changeFrequency: "weekly",
        priority: 0.75,
        alternates: {
          languages: alternatesLanguages,
        },
      });
    }
  }

  return sitemapEntries;
}
