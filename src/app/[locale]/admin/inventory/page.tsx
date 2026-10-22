import { getAdminInventory } from "@/server/services/admin.service";
import { InventoryManagementView } from "@/components/admin/InventoryManagementView";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const inventory = await getAdminInventory();

  return (
    <InventoryManagementView
      initialItems={inventory.items}
      initialMovements={inventory.movements}
    />
  );
}
