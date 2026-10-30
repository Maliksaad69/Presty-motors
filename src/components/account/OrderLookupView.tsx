"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Printer,
} from "lucide-react";
import { lookupOrderAction } from "@/server/actions/order";

interface OrderLookupViewProps {
  initialOrderNumber?: string;
  initialEmail?: string;
}

export function OrderLookupView({ initialOrderNumber, initialEmail }: OrderLookupViewProps) {
  const t = useTranslations("account");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();

  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(
    initialOrderNumber || searchParams.get("orderNumber") || ""
  );
  const [email, setEmail] = useState(initialEmail || searchParams.get("email") || "");
  const [isPending, startTransition] = useTransition();

  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto lookup if orderNumber and email are provided in query params
  useEffect(() => {
    const qOrder = searchParams.get("orderNumber");
    const qEmail = searchParams.get("email");
    if (qOrder && qEmail && !searchedOrder) {
      setOrderNumber(qOrder);
      setEmail(qEmail);
      startTransition(async () => {
        const res = await lookupOrderAction(qOrder, qEmail);
        if (res.success) {
          setSearchedOrder(res.order);
          setErrorMessage(null);
        } else {
          setErrorMessage(res.errorMessage || t("noOrderFound"));
        }
      });
    }
  }, [searchParams, searchedOrder, t]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      setErrorMessage(t("enterBothFields"));
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await lookupOrderAction(orderNumber, email);
      if (res.success) {
        setSearchedOrder(res.order);
        setErrorMessage(null);
      } else {
        setSearchedOrder(null);
        setErrorMessage(res.errorMessage || t("noOrderFound"));
      }
    });
  };

  const getTimelineSteps = (status: string, fulfillmentType: string, isQuote: boolean) => {
    if (isQuote) {
      const quoteStatus = searchedOrder?.quote?.status || "REQUESTED";
      return [
        {
          label: t("stepQuoteSubmitted"),
          desc: t("stepQuoteSubmittedDesc"),
          completed: true,
          active: quoteStatus === "REQUESTED",
        },
        {
          label: t("stepQuoteReview"),
          desc: t("stepQuoteReviewDesc"),
          completed: quoteStatus === "REVIEWING" || quoteStatus === "QUOTED" || quoteStatus === "ACCEPTED",
          active: quoteStatus === "REVIEWING",
        },
        {
          label: t("stepQuoteDispatched"),
          desc: t("stepQuoteDispatchedDesc"),
          completed: quoteStatus === "QUOTED" || quoteStatus === "ACCEPTED",
          active: quoteStatus === "QUOTED",
        },
        {
          label: t("stepQuoteAccepted"),
          desc: t("stepQuoteAcceptedDesc"),
          completed: quoteStatus === "ACCEPTED",
          active: quoteStatus === "ACCEPTED",
        },
      ];
    }

    const isPickup = fulfillmentType === "SHOWROOM_PICKUP";
    return [
      {
        label: t("stepOrderPlaced"),
        desc: t("stepOrderPlacedDesc"),
        completed: true,
        active: status === "PENDING",
      },
      {
        label: t("stepWorkshop"),
        desc: t("stepWorkshopDesc"),
        completed: ["PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"].includes(status),
        active: status === "PROCESSING",
      },
      {
        label: isPickup ? t("stepReadyPickup") : t("stepDispatched"),
        desc: isPickup ? t("stepReadyPickupDesc") : t("stepDispatchedDesc"),
        completed: ["READY_FOR_PICKUP", "SHIPPED", "DELIVERED"].includes(status),
        active: ["READY_FOR_PICKUP", "SHIPPED"].includes(status),
      },
      {
        label: isPickup ? t("stepCollected") : t("stepDelivered"),
        desc: isPickup ? t("stepCollectedDesc") : t("stepDeliveredDesc"),
        completed: status === "DELIVERED",
        active: status === "DELIVERED",
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Lookup Search Form */}
      <div className="p-5 sm:p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E2E2E2] pb-3">
          <Search className="w-4 h-4 text-[#E10600]" />
          <h2 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
            {t("trackerTitle")}
          </h2>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label htmlFor="lookup-ref" className="block text-[11px] font-heading font-semibold uppercase text-[#0B0B0B] mb-1">
              {t("orderRef")}
            </label>
            <input
              id="lookup-ref"
              type="text"
              required
              placeholder="e.g. PM-2026-780669"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] font-mono uppercase focus:outline-hidden focus:border-[#E10600]"
            />
          </div>

          <div className="sm:col-span-5">
            <label htmlFor="lookup-email" className="block text-[11px] font-heading font-semibold uppercase text-[#0B0B0B] mb-1">
              {t("email")}
            </label>
            <input
              id="lookup-email"
              type="email"
              required
              placeholder="e.g. client@motorsport.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-9 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <span>{t("lookingUp")}</span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>{t("lookupBtn")}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Searched Order Details */}
      {searchedOrder && (
        <div className="p-6 rounded border border-[#0B0B0B] bg-white shadow-md space-y-6 animate-in fade-in duration-300">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2E2] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-[#0B0B0B]">
                  {t("ref")} {searchedOrder.orderNumber}
                </span>
                {searchedOrder.quote && (
                  <span className="text-xs font-mono font-medium text-[#E10600] bg-[#E10600]/10 px-2 py-0.5 rounded border border-[#E10600]/20">
                    QUOTE: {searchedOrder.quote.quoteNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373]">
                {new Date(searchedOrder.createdAt).toLocaleDateString(locale, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })} • {t("customer")} <strong>{searchedOrder.guestName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-xs font-heading font-semibold uppercase tracking-wider ${
                  searchedOrder.status === "DELIVERED" || searchedOrder.status === "READY_FOR_PICKUP"
                    ? "bg-[#16803C]/10 text-[#16803C] border border-[#16803C]/30"
                    : searchedOrder.status === "PENDING_QUOTE"
                    ? "bg-amber-500/10 text-amber-700 border border-amber-300"
                    : "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/30"
                }`}
              >
                ● {searchedOrder.status.replace(/_/g, " ")}
              </span>

              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 rounded border border-[#E2E2E2] hover:bg-[#F5F5F5] text-[#0B0B0B] cursor-pointer"
                title={t("printOrder")}
                aria-label={t("printOrder")}
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Visual Fulfillment Timeline */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#737373]">
              {t("timelineTitle")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {getTimelineSteps(
                searchedOrder.status,
                searchedOrder.fulfillmentType,
                Boolean(searchedOrder.quote)
              ).map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded border text-xs space-y-1 transition-all ${
                    step.completed
                      ? "border-[#16803C]/40 bg-[#16803C]/5"
                      : "border-[#E2E2E2] bg-[#F5F5F5] text-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        step.completed ? "text-[#16803C]" : "text-neutral-300"
                      }`}
                    />
                    <strong
                      className={`font-heading uppercase text-xs ${
                        step.completed ? "text-[#0B0B0B]" : "text-neutral-500"
                      }`}
                    >
                      {step.label}
                    </strong>
                  </div>
                  <p className="text-[11px] text-[#737373]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items & Logistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Items Column */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#737373]">
                {t("vehicleItems")} ({searchedOrder.items.length})
              </h3>

              <div className="divide-y divide-[#E2E2E2] border border-[#E2E2E2] rounded overflow-hidden">
                {searchedOrder.items.map((item: any) => (
                  <div key={item.id} className="p-3 bg-white flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] text-[#E10600] font-medium block">
                        {item.sku}
                      </span>
                      <strong className="font-heading uppercase text-[#0B0B0B] text-xs">
                        {item.title}
                      </strong>
                      <p className="text-[11px] text-[#737373]">Qty: {item.quantity}</p>
                    </div>

                    <div className="text-right rtl:text-left">
                      <span className="font-heading font-semibold text-xs text-[#0B0B0B]">
                        {item.totalPrice.toLocaleString(locale, {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#737373]">
                  <span>{tCheckout("subtotal")}</span>
                  <span className="font-mono text-[#0B0B0B]">
                    {searchedOrder.subtotal.toLocaleString(locale, {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
                {searchedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#16803C] font-semibold">
                    <span>Discount:</span>
                    <span>
                      -
                      {searchedOrder.discountAmount.toLocaleString(locale, {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#737373]">
                  <span>{tCheckout("shippingFee")}</span>
                  <span className="font-mono text-[#0B0B0B]">
                    {searchedOrder.shippingFee === 0 ? "FREE" : `€${searchedOrder.shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E2E2E2] pt-2 font-semibold text-sm">
                  <span className="font-heading uppercase text-[#0B0B0B]">{t("orderTotal")}</span>
                  <span className="text-[#E10600] font-heading text-base font-semibold">
                    {searchedOrder.total.toLocaleString(locale, {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Logistics & Fulfillment Column */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#737373]">
                {t("orderDetails")}
              </h3>

              <div className="p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#737373] uppercase font-medium block">
                    {t("fulfillmentType")}
                  </span>
                  <strong className="text-[#0B0B0B] font-heading uppercase">
                    {searchedOrder.fulfillmentType.replace(/_/g, " ")}
                  </strong>
                </div>

                {searchedOrder.shipment && (
                  <div className="pt-2 border-t border-[#E2E2E2] space-y-1">
                    <span className="text-[10px] text-[#737373] uppercase font-medium block">
                      {t("carrierTracking")}
                    </span>
                    <strong className="text-[#0B0B0B] block">{searchedOrder.shipment.carrier}</strong>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-[#737373]">Ref:</span>
                      <span className="font-mono text-[11px] font-medium text-[#E10600]">
                        {searchedOrder.shipment.trackingNumber}
                      </span>
                    </div>
                  </div>
                )}

                {searchedOrder.shippingAddress && (
                  <div className="pt-2 border-t border-[#E2E2E2] space-y-1">
                    <span className="text-[10px] text-[#737373] uppercase font-medium block">
                      {t("shippingAddress")}
                    </span>
                    <p className="text-[#0B0B0B] leading-relaxed text-[11px]">
                      {searchedOrder.shippingAddress.streetLine1}
                      <br />
                      {searchedOrder.shippingAddress.postalCode} {searchedOrder.shippingAddress.city},{" "}
                      {searchedOrder.shippingAddress.country}
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-[#E2E2E2] flex items-center justify-between">
                  <span className="text-[10px] text-[#737373] uppercase font-medium">{t("paymentMethod")}</span>
                  <span
                    className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                      searchedOrder.paymentStatus === "PAID" || searchedOrder.paymentStatus === "AUTHORIZED"
                        ? "bg-[#16803C]/10 text-[#16803C]"
                        : "bg-neutral-200 text-[#0B0B0B]"
                    }`}
                  >
                    {searchedOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
