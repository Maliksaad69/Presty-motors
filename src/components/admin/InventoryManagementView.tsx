"use client";

import { useState, useTransition } from "react";
import {
  Boxes,
  AlertTriangle,
  History,
  Check,
  Search,
  ArrowUpDown,
  RefreshCw,
  Plus,
  Minus,
  Edit2,
  X,
  ShieldCheck,
} from "lucide-react";
import { adjustInventoryStockAction } from "@/server/actions/admin";

interface InventoryItem {
  id: string;
  title: string;
  sku: string;
  currentStock: number;
  reserved: number;
  threshold: number;
  inventoryId?: string;
  updatedAt: string;
}

interface MovementItem {
  id: string;
  productTitle: string;
  productSku: string;
  type: string;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceId: string | null;
  createdAt: string;
}

export function InventoryManagementView({
  initialItems,
  initialMovements,
}: {
  initialItems: InventoryItem[];
  initialMovements: MovementItem[];
}) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [movements, setMovements] = useState<MovementItem[]>(initialMovements);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Stock Adjustment Modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [targetQuantity, setTargetQuantity] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const openAdjustmentModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setTargetQuantity(item.currentStock);
    setAdjustmentReason("Showroom inventory adjustment");
    setModalError(null);
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (targetQuantity < 0) {
      setModalError("Quantity cannot be negative.");
      return;
    }

    if (!adjustmentReason.trim()) {
      setModalError("Please state a mandatory reason for this audit log.");
      return;
    }

    setModalError(null);
    startTransition(async () => {
      const res = await adjustInventoryStockAction(
        selectedItem.id,
        targetQuantity,
        adjustmentReason
      );

      if (res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === selectedItem.id ? { ...i, currentStock: targetQuantity } : i
          )
        );
        setSelectedItem(null);
        window.location.reload();
      } else {
        setModalError(res.errorMessage || "Failed to adjust stock.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase text-white tracking-wide">
            Inventory & Stock Auditing
          </h1>
          <p className="text-xs text-neutral-400">
            Real-time physical count reconciliation and immutable PostgreSQL audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-xs font-mono text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16803C]" />
            <span>Audit Logging Active</span>
          </div>
        </div>
      </div>

      {/* Stock Level Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Filter by machine or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E10600]"
            />
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            {filteredItems.length} machine model(s)
          </span>
        </div>

        <div className="border border-[#222222] rounded bg-[#141414] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C1C1C] border-b border-[#262626] text-[11px] font-heading font-black uppercase text-neutral-400 tracking-wider">
              <tr>
                <th className="p-3.5">Machine / Model</th>
                <th className="p-3.5">SKU Code</th>
                <th className="p-3.5 text-center">Available Stock</th>
                <th className="p-3.5 text-center">Reserved</th>
                <th className="p-3.5 text-center">Low-Stock Alert</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.threshold;
                return (
                  <tr key={item.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="p-3.5 font-heading font-black text-xs text-white uppercase">
                      {item.title}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] font-bold text-[#E10600]">
                      {item.sku}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isLow
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-[#16803C]/20 text-[#16803C]"
                        }`}
                      >
                        {item.currentStock} units
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono text-neutral-400">
                      {item.reserved} units
                    </td>
                    <td className="p-3.5 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>LOW (&le;{item.threshold})</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-500">
                          Normal (&gt;{item.threshold})
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openAdjustmentModal(item)}
                        className="px-3 py-1 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[11px] font-heading font-black uppercase tracking-wider transition-colors border border-[#2E2E2E] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3 text-[#E10600]" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Audit Log Section */}
      <div className="space-y-4 pt-4 border-t border-[#222222]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#16803C]" />
            <h2 className="font-heading text-base font-black uppercase text-white">
              Immutable Inventory Movement Ledger
            </h2>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">
            Last {movements.length} audit entries
          </span>
        </div>

        <div className="border border-[#222222] rounded bg-[#141414] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C1C1C] border-b border-[#262626] text-[11px] font-heading font-black uppercase text-neutral-400 tracking-wider">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Machine</th>
                <th className="p-3 text-center">Type</th>
                <th className="p-3 text-center">Change</th>
                <th className="p-3 text-center">Stock Transition</th>
                <th className="p-3">Reference / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="p-3 font-mono text-[10px] text-neutral-400">
                    {new Date(m.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3">
                    <span className="font-heading font-black text-white uppercase block">
                      {m.productTitle}
                    </span>
                    <span className="font-mono text-[10px] text-[#E10600]">{m.productSku}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        m.type === "RESTOCK"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : m.type === "PURCHASE"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {m.type}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-black">
                    <span className={m.quantityChange > 0 ? "text-[#16803C]" : "text-[#E10600]"}>
                      {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono text-[11px] text-neutral-300">
                    {m.previousQuantity} &rarr;{" "}
                    <strong className="text-white">{m.newQuantity}</strong>
                  </td>
                  <td className="p-3 text-neutral-400 text-[11px]">
                    <span className="text-white font-medium">{m.reason}</span>
                    {m.referenceId && (
                      <span className="block font-mono text-[9px] text-[#737373]">
                        Ref: {m.referenceId}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-[#2E2E2E] rounded-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div>
                <h3 className="font-heading text-base font-black uppercase text-white">
                  Adjust Stock Level
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {selectedItem.title} ({selectedItem.sku})
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-2.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div className="p-3 rounded bg-[#1C1C1C] border border-[#262626] flex items-center justify-between">
                <span className="text-neutral-400">Current In-Stock Count:</span>
                <span className="font-mono text-sm font-bold text-white">
                  {selectedItem.currentStock} units
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  New Reconciled Stock Quantity *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetQuantity((q) => Math.max(0, q - 1))}
                    className="w-9 h-9 rounded bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-white flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    required
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(parseInt(e.target.value, 10) || 0)}
                    className="flex-1 h-9 px-3 text-center bg-[#1C1C1C] border border-[#2E2E2E] rounded text-white font-mono text-sm font-bold focus:outline-none focus:border-[#E10600]"
                  />
                  <button
                    type="button"
                    onClick={() => setTargetQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded bg-[#1C1C1C] hover:bg-[#252525] border border-[#2E2E2E] text-white flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  Mandatory Audit Log Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical inventory count discrepancy or container restock"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                />
              </div>

              <div className="pt-2 border-t border-[#262626] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded border border-[#2E2E2E] hover:bg-[#1C1C1C] text-neutral-300 text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Recording Audit..." : "Apply & Log Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
