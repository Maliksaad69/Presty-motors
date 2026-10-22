"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { applyPromoCodeAction, validateStockAction } from "@/server/actions/cart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalCount } = useCart();

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    description?: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Fulfillment selector for estimate
  const [shippingMethod, setShippingMethod] = useState<"PICKUP" | "DOMESTIC" | "INTERNATIONAL">(
    "PICKUP"
  );

  // Stock check state
  const [stockStatus, setStockStatus] = useState<{
    checked: boolean;
    valid: boolean;
    message?: string;
  }>({ checked: false, valid: true });
  const [stockLoading, setStockLoading] = useState(false);

  // Live stock verification on mount and items change
  useEffect(() => {
    if (items.length === 0) {
      setStockStatus({ checked: false, valid: true });
      return;
    }

    let isMounted = true;
    setStockLoading(true);

    validateStockAction(items.map((i) => ({ id: i.id, sku: i.sku, quantity: i.quantity }))).then(
      (res) => {
        if (!isMounted) return;
        setStockLoading(false);
        setStockStatus({
          checked: true,
          valid: res.valid,
          message: res.errorMessage,
        });
      }
    );

    return () => {
      isMounted = false;
    };
  }, [items]);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setPromoLoading(true);
    setPromoError(null);

    const result = await applyPromoCodeAction(promoInput, subtotal);
    setPromoLoading(false);

    if (result.valid) {
      setAppliedPromo({
        code: result.code || promoInput.toUpperCase(),
        discountAmount: result.discountAmount,
        description: result.description,
      });
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError(result.errorMessage || "Invalid discount code.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
  };

  const shippingCost =
    shippingMethod === "DOMESTIC" ? 150 : shippingMethod === "PICKUP" ? 0 : 0;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] py-16 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F5F5F5] border border-[#E2E2E2] flex items-center justify-center text-[#737373]">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-black uppercase text-[#0B0B0B]">
              Your Cart is Empty
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              You haven't selected any motorsport machines or racing accessories yet. Browse our
              Paris showroom collection to gear up.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20"
            >
              <span>Explore Showroom Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Title */}
        <div className="border-b border-[#E2E2E2] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-heading font-bold text-[#737373] uppercase tracking-wider">
              <Link href="/" className="hover:text-[#E10600]">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#0B0B0B]">Shopping Cart</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-[#0B0B0B] flex items-center gap-3">
              <span>Shopping Cart</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded bg-[#F5F5F5] border border-[#E2E2E2] text-[#737373]">
                {totalCount} {totalCount === 1 ? "Machine / Item" : "Machines / Items"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase text-[#737373] hover:text-[#0B0B0B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase text-neutral-400 hover:text-[#E10600] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          </div>
        </div>

        {/* Stock status indicator */}
        {stockStatus.checked && !stockStatus.valid && (
          <div className="p-4 rounded border border-red-300 bg-red-50 text-red-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-heading font-black uppercase tracking-wider">
                Inventory Stock Warning
              </strong>
              <p>{stockStatus.message || "Some items in your cart exceed current showroom quantities."}</p>
            </div>
          </div>
        )}

        {/* Main Grid: Cart Items & Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-[#E2E2E2] text-[11px] font-heading font-bold uppercase tracking-wider text-[#737373]">
              <span className="col-span-6">Machine / Equipment</span>
              <span className="col-span-2 text-center">Unit Price</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="divide-y divide-[#E2E2E2] border-b border-[#E2E2E2]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                >
                  {/* Product Details */}
                  <div className="sm:col-span-6 flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded bg-[#0B0B0B] border border-[#E2E2E2] overflow-hidden shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-400">
                          PM
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#E10600] uppercase tracking-wider">
                        {item.sku || "MOT-SPEC"}
                      </span>
                      <h3 className="font-heading text-sm font-black text-[#0B0B0B] uppercase">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-neutral-400 hover:text-[#E10600] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="sm:col-span-2 text-left sm:text-center">
                    <span className="sm:hidden text-xs text-[#737373] mr-2">Unit:</span>
                    <span className="text-xs font-heading font-bold text-[#0B0B0B]">
                      {item.price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="sm:col-span-2 flex items-center sm:justify-center gap-2">
                    <div className="inline-flex items-center rounded border border-[#E2E2E2] bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 hover:bg-[#F5F5F5] text-[#0B0B0B] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-bold text-[#0B0B0B]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 hover:bg-[#F5F5F5] text-[#0B0B0B] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="sm:col-span-2 text-left sm:text-right">
                    <span className="sm:hidden text-xs text-[#737373] mr-2">Subtotal:</span>
                    <span className="font-heading text-sm font-black text-[#E10600]">
                      {(item.price * item.quantity).toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Motorsport Guarantees */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded border border-[#E2E2E2] bg-[#F5F5F5] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#E10600] shrink-0" />
                <div>
                  <h4 className="text-xs font-heading font-black uppercase text-[#0B0B0B]">
                    Certified Inspection
                  </h4>
                  <p className="text-[10px] text-[#737373]">
                    100% bench-tested prior to handover
                  </p>
                </div>
              </div>

              <div className="p-3 rounded border border-[#E2E2E2] bg-[#F5F5F5] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#E10600] shrink-0" />
                <div>
                  <h4 className="text-xs font-heading font-black uppercase text-[#0B0B0B]">
                    Specialized Freight
                  </h4>
                  <p className="text-[10px] text-[#737373]">
                    Hydraulic liftgate delivery options
                  </p>
                </div>
              </div>

              <div className="p-3 rounded border border-[#E2E2E2] bg-[#F5F5F5] flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-[#E10600] shrink-0" />
                <div>
                  <h4 className="text-xs font-heading font-black uppercase text-[#0B0B0B]">
                    Showroom Handover
                  </h4>
                  <p className="text-[10px] text-[#737373]">
                    Free collection & briefing in Paris 16e
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-5">
              <h2 className="font-heading text-base font-black uppercase tracking-wider text-[#0B0B0B] border-b border-[#E2E2E2] pb-3">
                Order Summary
              </h2>

              {/* Subtotal */}
              <div className="flex justify-between text-xs">
                <span className="text-[#737373]">Subtotal ({totalCount} items)</span>
                <span className="font-mono font-bold text-[#0B0B0B]">
                  {subtotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>

              {/* Fulfillment Estimator */}
              <div className="space-y-2 pt-2 border-t border-[#E2E2E2]">
                <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#737373] flex items-center justify-between">
                  <span>Fulfillment Estimate</span>
                  <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                </label>
                <div className="space-y-1.5">
                  <label
                    onClick={() => setShippingMethod("PICKUP")}
                    className={`flex items-center justify-between p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                      shippingMethod === "PICKUP"
                        ? "border-[#E10600] bg-white text-[#0B0B0B] font-bold"
                        : "border-[#E2E2E2] bg-white/60 text-[#737373]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={shippingMethod === "PICKUP"}
                        onChange={() => setShippingMethod("PICKUP")}
                        className="text-[#E10600] focus:ring-[#E10600]"
                      />
                      <span>Paris Showroom Reservation (Pay on Visit)</span>
                    </div>
                    <span className="text-[#16803C] font-mono">Free</span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("DOMESTIC")}
                    className={`flex items-center justify-between p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                      shippingMethod === "DOMESTIC"
                        ? "border-[#E10600] bg-white text-[#0B0B0B] font-bold"
                        : "border-[#E2E2E2] bg-white/60 text-[#737373]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={shippingMethod === "DOMESTIC"}
                        onChange={() => setShippingMethod("DOMESTIC")}
                        className="text-[#E10600] focus:ring-[#E10600]"
                      />
                      <span>Domestic Freight Delivery (Pay Online)</span>
                    </div>
                    <span className="font-mono">€150.00</span>
                  </label>

                  <label
                    onClick={() => setShippingMethod("INTERNATIONAL")}
                    className={`flex items-center justify-between p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                      shippingMethod === "INTERNATIONAL"
                        ? "border-[#E10600] bg-white text-[#0B0B0B] font-bold"
                        : "border-[#E2E2E2] bg-white/60 text-[#737373]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={shippingMethod === "INTERNATIONAL"}
                        onChange={() => setShippingMethod("INTERNATIONAL")}
                        className="text-[#E10600] focus:ring-[#E10600]"
                      />
                      <span>International Freight Quote</span>
                    </div>
                    <span className="text-neutral-500 font-mono text-[11px]">To be quoted</span>
                  </label>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="space-y-2 pt-2 border-t border-[#E2E2E2]">
                <label className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-[#E10600]" />
                  <span>Promotional Coupon Code</span>
                </label>
                {appliedPromo ? (
                  <div className="p-2.5 rounded bg-white border border-[#16803C]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#16803C]" />
                      <div>
                        <span className="font-mono font-bold text-xs text-[#16803C]">
                          {appliedPromo.code}
                        </span>
                        <p className="text-[10px] text-[#737373]">
                          -
                          {appliedPromo.discountAmount.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}{" "}
                          applied
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-xs text-neutral-400 hover:text-red-600 font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded bg-white border border-[#E2E2E2] text-xs font-mono uppercase focus:outline-none focus:border-[#E10600]"
                    />
                    <button
                      type="submit"
                      disabled={promoLoading}
                      className="px-4 py-2 rounded bg-[#0B0B0B] hover:bg-[#171717] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </form>
                )}
                {promoError && <p className="text-[11px] text-red-600">{promoError}</p>}
                <p className="text-[10px] text-neutral-400">
                  Tip: Try promotional code <strong className="font-mono text-[#0B0B0B]">WELCOME10</strong>
                </p>
              </div>

              {/* Discount Line if applied */}
              {appliedPromo && (
                <div className="flex justify-between text-xs text-[#16803C] font-bold">
                  <span>Promotional Discount ({appliedPromo.code})</span>
                  <span>
                    -
                    {discountAmount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="border-t border-[#E2E2E2] pt-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-heading font-black uppercase tracking-wider text-[#0B0B0B]">
                    Estimated Total
                  </span>
                  <p className="text-[10px] text-[#737373]">TVA / VAT Included</p>
                </div>
                <div className="text-right">
                  <span className="font-heading text-2xl font-black text-[#E10600]">
                    {grandTotal.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href={`/checkout?fulfillment=${shippingMethod}${appliedPromo ? `&promo=${appliedPromo.code}` : ""}`}
                className="w-full py-3.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Assistance banner */}
            <div className="p-4 rounded border border-[#E2E2E2] bg-white text-xs space-y-1 text-center">
              <span className="font-heading font-black uppercase text-[#0B0B0B]">
                Need Technical Machine Advice?
              </span>
              <p className="text-[11px] text-[#737373]">
                Our Paris motorsport mechanics are available via telephone at{" "}
                <strong className="text-[#0B0B0B]">+33 1 42 68 55 00</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
