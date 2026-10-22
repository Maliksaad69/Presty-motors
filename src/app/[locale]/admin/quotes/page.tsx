import { getAdminQuotes } from "@/server/services/admin.service";
import { QuotesManagementView } from "@/components/admin/QuotesManagementView";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const quotes = await getAdminQuotes();

  return <QuotesManagementView initialQuotes={quotes} />;
}
