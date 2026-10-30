"use client";

import { useState, useTransition } from "react";
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  CreditCard,
  Building,
  User,
  MapPin,
  Send,
} from "lucide-react";
import { updateAdminOrderStatusAction } from "@/server/actions/admin";
import { OrderStatus } from "@prisma/client";

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  fulfillmentType: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  items: {
    id: string;
    title: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  shipment: {
    id: string;
    carrier: string | null;
    trackingNumber: string | null;
    status: string;
  } | null;
  quoteNumber?: string;
}

export function OrdersManagementView({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Selected Order for Dispatch Details
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [carrierInput, setCarrierInput] = useState("Geodis Motorsport Logistics");
  const [trackingInput, setTrackingInput] = useState("");
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PROCESSING);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openOrderModal = (order: OrderRow) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setCarrierInput(order.shipment?.carrier || "Geodis Motorsport Logistics");
    setTrackingInput(order.shipment?.trackingNumber || `TRK-${Date.now().toString().slice(-6)}`);
    setDispatchError(null);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setDispatchError(null);
    startTransition(async () => {
      const res = await updateAdminOrderStatusAction(
        selectedOrder.id,
        newStatus,
        carrierInput,
        trackingInput
      );

      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? {
                  ...o,
                  status: newStatus,
                  shipment: {
                    id: o.shipment?.id || "new",
                    carrier: carrierInput,
                    trackingNumber: trackingInput,
                    status: newStatus === "DELIVERED" ? "DELIVERED" : "IN_TRANSIT",
                  },
                }
              : o
          )
        );
        setSelectedOrder(null);
      } else {
        setDispatchError(res.errorMessage || "Failed to update order status.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <span className="text-[11px] font-mono text-[#E10600]">
            Fulfillment & Logistics
          </span>
          <h1 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
            Workshop & Store Orders
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Fulfill orders, assign carrier tracking numbers, and manage showroom collections.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by order number, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E10600]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E10600]"
        >
          <option value="ALL">All Order States</option>
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="border border-[#222222] rounded bg-[#141414] overflow-x-auto popup-scroll">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-[#1C1C1C] border-b border-[#262626] text-[11px] font-heading font-semibold uppercase text-neutral-400 tracking-wider">
            <tr>
              <th className="p-3.5">Reference</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Fulfillment</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-center">Payment</th>
              <th className="p-3.5 text-right">Total (TTC)</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="p-3.5 font-mono text-xs font-semibold text-white">
                    <span>{order.orderNumber}</span>
                    {order.quoteNumber && (
                      <span className="block text-[9px] text-amber-400 font-mono">
                        Quote: {order.quoteNumber}
                      </span>
                    )}
                    <span className="block text-[10px] text-neutral-500 font-normal">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>

                  <td className="p-3.5 text-neutral-300">
                    <strong className="block text-white font-heading uppercase text-xs font-semibold">
                      {order.customerName}
                    </strong>
                    <span className="text-[11px] text-neutral-400">{order.customerEmail}</span>
                  </td>

                  <td className="p-3.5 text-neutral-300">
                    <span className="px-2 py-0.5 rounded bg-[#1C1C1C] text-[10px] font-mono border border-[#262626]">
                      {order.fulfillmentType.replace(/_/g, " ")}
                    </span>
                    {order.shipment?.trackingNumber && (
                      <span className="block text-[9px] font-mono text-neutral-400 mt-1">
                        Track: {order.shipment.trackingNumber}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-heading font-semibold uppercase tracking-wider ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : order.status === "SHIPPED"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : order.status === "READY_FOR_PICKUP"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : order.status === "CANCELLED"
                          ? "bg-neutral-800 text-neutral-500"
                          : "bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/30"
                      }`}
                    >
                      ● {order.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-mono text-[10px]">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        order.paymentStatus === "PAID" || order.paymentStatus === "AUTHORIZED"
                          ? "text-[#16803C] bg-[#16803C]/10"
                          : "text-neutral-400 bg-neutral-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-heading text-xs font-semibold text-white">
                    {order.total.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => openOrderModal(order)}
                      className="px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[11px] font-heading font-medium uppercase tracking-wider transition-colors border border-[#2E2E2E] cursor-pointer inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#E10600]" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Status & Dispatch Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-xl bg-[#141414] border border-[#2E2E2E] rounded-lg shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#262626] p-4 sm:p-5 shrink-0 bg-[#141414] shadow-xs">
              <div>
                <h3 className="font-heading text-base font-semibold uppercase text-white">
                  Order Management: {selectedOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Customer: {selectedOrder.customerName} ({selectedOrder.customerEmail})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order management modal"
                className="text-neutral-500 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto popup-scroll p-4 sm:p-5 space-y-4 text-xs">
                {dispatchError && (
                  <div className="p-2.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
                    {dispatchError}
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-neutral-400 block">
                    Purchased Machines & Equipment ({selectedOrder.items.length})
                  </span>
                  <div className="p-3 rounded bg-[#1C1C1C] border border-[#262626] space-y-2 text-xs">
                    {selectedOrder.items.map((i) => (
                      <div key={i.id} className="flex justify-between items-center text-[11px]">
                        <div>
                          <span className="text-white font-heading uppercase">{i.title}</span>
                          <span className="text-neutral-500 font-mono text-[9px] ml-1.5">
                            Qty: {i.quantity} • {i.sku}
                          </span>
                        </div>
                        <span className="font-mono text-white">
                          {i.totalPrice.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-semibold uppercase text-neutral-400 mb-1">
                    Update Order Fulfillment Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600] font-heading font-medium"
                  >
                    <option value={OrderStatus.PENDING}>PENDING (Order Placed)</option>
                    <option value={OrderStatus.PROCESSING}>
                      PROCESSING (Workshop Preparation)
                    </option>
                    <option value={OrderStatus.READY_FOR_PICKUP}>
                      READY_FOR_PICKUP (Paris Showroom)
                    </option>
                    <option value={OrderStatus.SHIPPED}>SHIPPED (Enclosed Freight In-Transit)</option>
                    <option value={OrderStatus.DELIVERED}>
                      DELIVERED (Completed & Handed Over)
                    </option>
                    <option value={OrderStatus.CANCELLED}>CANCELLED</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-heading font-semibold uppercase text-neutral-400 mb-1">
                      Carrier Name
                    </label>
                    <input
                      type="text"
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-semibold uppercase text-neutral-400 mb-1">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-[#262626] bg-[#141414] shrink-0 flex justify-end gap-2 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded border border-[#2E2E2E] hover:bg-[#1C1C1C] text-neutral-300 text-xs font-heading font-medium uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-medium uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Updating Order..." : "Update Status & Carrier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
