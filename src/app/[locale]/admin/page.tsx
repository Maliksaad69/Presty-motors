import { Link } from "@/i18n/routing";
import { getAdminOverview } from "@/server/services/admin.service";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Globe,
  AlertTriangle,
  ArrowRight,
  Plus,
  Boxes,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#E10600]">
            Operational Command
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase tracking-wide text-white">
            Showroom Operations Overview
          </h1>
          <p className="text-xs text-neutral-400">
            Real-time telemetry, incoming orders, low inventory alerts, and quotation dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-3.5 py-2 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-black uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-3.5 py-2 rounded bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 hover:text-white text-xs font-heading font-black uppercase tracking-wider transition-colors border border-[#2E2E2E] flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock Audit</span>
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {overview.lowStockCount > 0 && (
        <div className="p-4 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <strong className="font-heading font-black uppercase tracking-wider text-amber-200 block mb-1">
              {overview.lowStockCount} Vehicle(s) At or Below Low-Stock Threshold
            </strong>
            <p className="text-neutral-300">
              The following models have reached critical showroom quantities:{" "}
              {overview.lowStockProducts.map((p) => `${p.title} (${p.currentStock} left)`).join(", ")}.
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black font-heading font-black text-[11px] uppercase tracking-wider transition-colors shrink-0"
          >
            Adjust Stock
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded border border-[#222222] bg-[#141414] space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">
              Total Recorded Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-[#16803C]" />
          </div>
          <div className="font-heading text-2xl font-black text-white">
            {overview.totalRevenue.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono">TTC • Confirmed orders</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded border border-[#222222] bg-[#141414] space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">
              Active Machines in Catalog
            </span>
            <Package className="w-4 h-4 text-[#E10600]" />
          </div>
          <div className="font-heading text-2xl font-black text-white">
            {overview.totalProductsCount}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono">
            {overview.lowStockCount} low stock alerts
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded border border-[#222222] bg-[#141414] space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">
              Pending Work Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-heading text-2xl font-black text-white">
            {overview.pendingOrdersCount}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono">Workshop prep & dispatch</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded border border-[#222222] bg-[#141414] space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">
              International Quotes
            </span>
            <Globe className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading text-2xl font-black text-white">
            {overview.pendingQuotesCount}
          </div>
          <p className="text-[10px] text-neutral-500 font-mono">Awaiting freight rates</p>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h2 className="font-heading text-sm font-black uppercase text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#E10600]" />
              <span>Recent Showroom Orders</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-[11px] font-heading font-bold text-[#E10600] hover:underline flex items-center gap-1 uppercase"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#222222] border border-[#222222] rounded bg-[#141414] overflow-hidden">
            {overview.recentOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                No orders recorded in the workshop yet.
              </div>
            ) : (
              overview.recentOrders.map((order) => (
                <div key={order.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-white">
                        {order.orderNumber}
                      </span>
                      {order.quoteNumber && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {order.quoteNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {order.customerName} • {order.itemsCount} item(s) •{" "}
                      {order.fulfillmentType.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-heading text-xs font-black text-white block">
                      {order.total.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.2 rounded text-[9px] font-heading font-black uppercase tracking-wider ${
                        order.status === "DELIVERED"
                          ? "bg-[#16803C]/20 text-[#16803C] border border-[#16803C]/40"
                          : order.status === "PENDING_QUOTE"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40"
                      }`}
                    >
                      ● {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Inventory Movements (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h2 className="font-heading text-sm font-black uppercase text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#16803C]" />
              <span>Live Inventory Movements</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-[11px] font-heading font-bold text-[#16803C] hover:underline flex items-center gap-1 uppercase"
            >
              <span>Full Audit</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#222222] border border-[#222222] rounded bg-[#141414] overflow-hidden">
            {overview.recentMovements.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                No inventory movements logged yet.
              </div>
            ) : (
              overview.recentMovements.map((movement) => (
                <div key={movement.id} className="p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="font-heading uppercase text-white text-[11px] truncate max-w-[200px]">
                      {movement.productTitle}
                    </strong>
                    <span
                      className={`font-mono text-xs font-black ${
                        movement.quantityChange > 0 ? "text-[#16803C]" : "text-[#E10600]"
                      }`}
                    >
                      {movement.quantityChange > 0
                        ? `+${movement.quantityChange}`
                        : movement.quantityChange}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span>{movement.reason}</span>
                    <span className="font-mono">
                      {movement.previousQuantity} → {movement.newQuantity} units
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
