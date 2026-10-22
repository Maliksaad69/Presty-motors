"use client";

import { useState, useTransition } from "react";
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from "lucide-react";
import {
  createAdminPromotionAction,
  togglePromotionStatusAction,
} from "@/server/actions/admin";
import { DiscountType } from "@prisma/client";

interface PromoRow {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export function PromotionsManagementView({ initialPromos }: { initialPromos: PromoRow[] }) {
  const [promos, setPromos] = useState<PromoRow[]>(initialPromos);
  const [isPending, startTransition] = useTransition();

  // Create Promo State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrder, setMinOrder] = useState("100");
  const [modalError, setModalError] = useState<string | null>(null);

  const handleToggleActive = (promo: PromoRow) => {
    startTransition(async () => {
      const res = await togglePromotionStatusAction(promo.id, !promo.isActive);
      if (res.success) {
        setPromos((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    });
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue.trim()) {
      setModalError("Please provide a coupon code and discount value.");
      return;
    }

    setModalError(null);
    startTransition(async () => {
      const res = await createAdminPromotionAction({
        code,
        description: description || undefined,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrder ? parseFloat(minOrder) : undefined,
      });

      if (res.success && res.promo) {
        setPromos((prev) => [
          {
            id: res.promo!.id,
            code: res.promo!.code,
            description: res.promo!.description,
            discountType: res.promo!.discountType,
            discountValue: Number(res.promo!.discountValue),
            minOrderAmount: res.promo!.minOrderAmount ? Number(res.promo!.minOrderAmount) : null,
            timesUsed: res.promo!.timesUsed,
            isActive: res.promo!.isActive,
            createdAt: res.promo!.createdAt.toISOString(),
          },
          ...prev,
        ]);
        setIsModalOpen(false);
        setCode("");
        setDescription("");
      } else {
        setModalError(res.errorMessage || "Failed to create promotion.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase text-white tracking-wide">
            Marketing & Promotional Coupons
          </h1>
          <p className="text-xs text-neutral-400">
            Create seasonal discount campaigns, configure minimum order thresholds, and monitor coupon redemptions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-red-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Promos Table */}
      <div className="border border-[#222222] rounded bg-[#141414] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1C1C1C] border-b border-[#262626] text-[11px] font-heading font-black uppercase text-neutral-400 tracking-wider">
            <tr>
              <th className="p-3.5">Coupon Code</th>
              <th className="p-3.5">Campaign Description</th>
              <th className="p-3.5 text-center">Discount</th>
              <th className="p-3.5 text-center">Min Order</th>
              <th className="p-3.5 text-center">Times Used</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {promos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-neutral-500">
                  No promotional codes configured yet.
                </td>
              </tr>
            ) : (
              promos.map((promo) => (
                <tr key={promo.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="p-3.5 font-mono text-xs font-bold text-white">
                    <span className="bg-[#1C1C1C] px-2 py-0.5 rounded border border-[#2E2E2E] text-[#E10600]">
                      {promo.code}
                    </span>
                  </td>

                  <td className="p-3.5 text-neutral-300">
                    <span className="text-white text-xs">{promo.description || "General promotion"}</span>
                  </td>

                  <td className="p-3.5 text-center font-mono font-bold text-white">
                    {promo.discountType === "PERCENTAGE" ? (
                      <span className="text-[#16803C]">{promo.discountValue}% OFF</span>
                    ) : (
                      <span className="text-[#16803C]">€{promo.discountValue} OFF</span>
                    )}
                  </td>

                  <td className="p-3.5 text-center font-mono text-neutral-400">
                    {promo.minOrderAmount ? `€${promo.minOrderAmount}` : "None"}
                  </td>

                  <td className="p-3.5 text-center font-mono text-xs text-white">
                    {promo.timesUsed} orders
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider ${
                        promo.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {promo.isActive ? "ACTIVE" : "DISABLED"}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleToggleActive(promo)}
                      disabled={isPending}
                      className="px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-[#252525] text-neutral-300 text-[10px] font-heading font-bold uppercase tracking-wider transition-colors border border-[#2E2E2E] cursor-pointer"
                    >
                      {promo.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-[#2E2E2E] rounded-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E10600]" />
                <h3 className="font-heading text-base font-black uppercase text-white">
                  Create Promotional Code
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER2026 or MOTOVIP"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono uppercase focus:outline-none focus:border-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  Campaign Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% discount for club members on riding equipment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                    className="w-full h-9 px-2 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  >
                    <option value={DiscountType.PERCENTAGE}>Percentage (%)</option>
                    <option value={DiscountType.FIXED_AMOUNT}>Fixed Amount (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  Minimum Order Amount (€)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150 (Optional)"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
                />
              </div>

              <div className="pt-3 border-t border-[#262626] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-[#2E2E2E] hover:bg-[#1C1C1C] text-neutral-300 text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Save Promotion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
