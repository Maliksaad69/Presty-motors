import { getAdminOrders } from "@/server/services/admin.service";
import { OrdersManagementView } from "@/components/admin/OrdersManagementView";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return <OrdersManagementView initialOrders={orders} />;
}
