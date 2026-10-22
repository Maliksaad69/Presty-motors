import { getAdminPromotions } from "@/server/services/admin.service";
import { PromotionsManagementView } from "@/components/admin/PromotionsManagementView";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promos = await getAdminPromotions();

  return <PromotionsManagementView initialPromos={promos} />;
}
