import { db } from "@/lib/db";
import { getAdminProducts } from "@/server/services/admin.service";
import { ProductManagementView } from "@/components/admin/ProductManagementView";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, rawCategories] = await Promise.all([
    getAdminProducts(),
    db.category.findMany({
      include: { translations: true },
    }),
  ]);

  const categories = rawCategories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.translations.find((t) => t.locale === "fr")?.name || c.translations[0]?.name || c.slug,
  }));

  return <ProductManagementView initialProducts={products} categories={categories} />;
}
