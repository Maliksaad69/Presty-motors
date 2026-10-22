import { getAdminSettings } from "@/server/services/admin.service";
import { StoreSettingsView } from "@/components/admin/StoreSettingsView";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return <StoreSettingsView initialSettings={settings} />;
}
