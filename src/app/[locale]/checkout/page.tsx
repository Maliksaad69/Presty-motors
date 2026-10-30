"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  CreditCard,
  Building,
  Check,
  Lock,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  Globe,
  Truck,
  Printer,
  Tag,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { createOrderAction } from "@/server/actions/order";
import { applyPromoCodeAction } from "@/server/actions/cart";

type FulfillmentMode = "SHOWROOM_PICKUP" | "DOMESTIC_DELIVERY" | "INTERNATIONAL_QUOTE";
type PaymentMethodChoice = "CARD" | "TRANSFER" | "ON_PICKUP";

export default function CheckoutPage() {
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const { items, subtotal, totalCount, clearCart } = useCart();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Fulfillment & Payment states
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>("SHOWROOM_PICKUP");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodChoice>("ON_PICKUP");

  // Customer contact state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Address states
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("France");
  const [orderNotes, setOrderNotes] = useState("");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Result state after submission
  const [orderResult, setOrderResult] = useState<{
    success: boolean;
    orderId?: string;
    orderNumber?: string;
    quoteNumber?: string;
    fulfillment?: string;
    total?: number;
    email?: string;
    paymentMethod?: string;
    discountAmount?: number;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize query parameters
  useEffect(() => {
    const promoFromUrl = searchParams.get("promo");
    if (promoFromUrl && !appliedPromo) {
      setPromoCode(promoFromUrl);
      applyPromoCodeAction(promoFromUrl, subtotal).then((res) => {
        if (res.valid) {
          setAppliedPromo({
            code: res.code || promoFromUrl.toUpperCase(),
            discountAmount: res.discountAmount,
          });
        }
      });
    }

    const fulfillmentFromUrl = searchParams.get("fulfillment") || searchParams.get("mode");
    if (fulfillmentFromUrl) {
      if (fulfillmentFromUrl === "PICKUP" || fulfillmentFromUrl === "SHOWROOM_PICKUP") {
        setFulfillment("SHOWROOM_PICKUP");
        setPaymentMethod("ON_PICKUP");
      } else if (fulfillmentFromUrl === "DOMESTIC" || fulfillmentFromUrl === "DOMESTIC_DELIVERY") {
        setFulfillment("DOMESTIC_DELIVERY");
        setPaymentMethod("CARD");
      } else if (fulfillmentFromUrl === "INTERNATIONAL" || fulfillmentFromUrl === "INTERNATIONAL_QUOTE") {
        setFulfillment("INTERNATIONAL_QUOTE");
        setPaymentMethod("TRANSFER");
      }
    }
  }, [searchParams, subtotal, appliedPromo]);

  // Handle fulfillment mode change
  const handleSelectFulfillment = (mode: FulfillmentMode) => {
    setFulfillment(mode);
    if (mode === "SHOWROOM_PICKUP") {
      setPaymentMethod("ON_PICKUP");
    } else if (mode === "DOMESTIC_DELIVERY") {
      if (paymentMethod === "ON_PICKUP") {
        setPaymentMethod("CARD");
      }
    } else if (mode === "INTERNATIONAL_QUOTE") {
      setPaymentMethod("TRANSFER");
    }
  };

  // Handle promo code apply
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoError(null);

    const result = await applyPromoCodeAction(promoCode, subtotal);
    setPromoLoading(false);

    if (result.valid) {
      setAppliedPromo({
        code: result.code || promoCode.toUpperCase(),
        discountAmount: result.discountAmount,
      });
      setPromoError(null);
    } else {
      setAppliedPromo(null);
      setPromoError(result.errorMessage || "Code invalide.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
  };

  // Cost calculations
  const shippingFee =
    fulfillment === "DOMESTIC_DELIVERY" ? 150 : fulfillment === "SHOWROOM_PICKUP" ? 0 : 0;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Submit order to PostgreSQL database via Server Action
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setSubmitError("Please fill in your name, email, and phone number.");
      return;
    }

    if (fulfillment !== "SHOWROOM_PICKUP") {
      if (!street.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
        setSubmitError("Please provide complete delivery address details.");
        return;
      }
    }

    startTransition(async () => {
      const result = await createOrderAction({
        customer: {
          fullName,
          email,
          phone,
        },
        fulfillmentType: fulfillment,
        shippingAddress:
          fulfillment !== "SHOWROOM_PICKUP"
            ? {
                fullName,
                streetLine1: street,
                city,
                postalCode,
                country,
                phone,
              }
            : undefined,
        paymentMethod: paymentMethod,
        promoCode: appliedPromo?.code,
        notes: orderNotes,
        items: items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
        })),
      });

      if (result.success) {
        setOrderResult({
          success: true,
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          quoteNumber: result.quoteNumber,
          fulfillment,
          total: grandTotal,
          email,
          paymentMethod,
          discountAmount,
        });
        clearCart();
      } else {
        setSubmitError(result.errorMessage || "Failed to register order.");
      }
    });
  };

  // Post-submission confirmation display
  if (orderResult && orderResult.success) {
    const isQuote = orderResult.fulfillment === "INTERNATIONAL_QUOTE";
    const isReservation = orderResult.fulfillment === "SHOWROOM_PICKUP";

    return (
      <div className="bg-white min-h-[75vh] py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              isQuote
                ? "bg-amber-500/10 text-amber-600"
                : "bg-[#16803C]/10 text-[#16803C]"
            }`}
          >
            {isQuote ? (
              <Globe className="w-8 h-8" />
            ) : isReservation ? (
              <Building className="w-8 h-8" />
            ) : (
              <Check className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F5F5F5] border border-[#E2E2E2]">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <span className="text-xs font-mono font-medium text-[#E10600] uppercase tracking-wider">
                {isQuote
                  ? `Ref: ${orderResult.quoteNumber || orderResult.orderNumber}`
                  : `Ref: ${orderResult.orderNumber}`}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-semibold uppercase text-[#0B0B0B]">
              {isQuote
                ? tCheckout("successQuoteTitle")
                : isReservation
                ? tCheckout("successReservationTitle")
                : tCheckout("successDeliveryTitle")}
            </h1>

            <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed font-normal">
              {isQuote ? (
                <>
                  Dossier logged for destination <strong>{country}</strong>. Receipt dispatched to{" "}
                  <strong>{orderResult.email}</strong>.
                </>
              ) : isReservation ? (
                <>
                  Your machine is exclusively reserved at our Paris showroom. Handover details sent to{" "}
                  <strong>{orderResult.email}</strong>.
                </>
              ) : (
                <>
                  Confirmation receipt and pre-delivery inspection summary dispatched to{" "}
                  <strong>{orderResult.email}</strong>.
                </>
              )}
            </p>
          </div>

          {/* Showroom Visit Location Notice (For Reservation) */}
          {isReservation && (
            <div className="p-4 rounded border border-[#16803C]/30 bg-[#16803C]/5 text-xs text-start space-y-2 max-w-lg mx-auto">
              <div className="flex items-center gap-2 text-[#16803C] font-heading font-semibold uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>{tCheckout("successReservationNotice")}</span>
              </div>
              <p className="text-neutral-700 leading-relaxed font-normal">
                {tCheckout("successReservationNoticeDesc")}
              </p>
            </div>
          )}

          {/* Receipt Card */}
          <div className="p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] text-xs text-start space-y-3 max-w-lg mx-auto">
            <div className="flex justify-between border-b border-[#E2E2E2] pb-2">
              <span className="text-[#737373]">Reference Number:</span>
              <strong className="font-mono text-[#0B0B0B] font-medium">{orderResult.orderNumber}</strong>
            </div>

            {orderResult.quoteNumber && (
              <div className="flex justify-between border-b border-[#E2E2E2] pb-2">
                <span className="text-[#737373]">Quotation Request:</span>
                <strong className="font-mono text-[#E10600] font-medium">{orderResult.quoteNumber}</strong>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-[#737373]">Order Type:</span>
              <strong className="text-[#0B0B0B] font-medium">
                {isReservation
                  ? tCheckout("pickupCardTitle")
                  : orderResult.fulfillment === "DOMESTIC_DELIVERY"
                  ? tCheckout("deliveryCardTitle")
                  : `${tCheckout("overseasCardTitle")} (${country})`}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-[#737373]">Payment Selection:</span>
              <strong className="text-[#0B0B0B] font-medium">
                {isReservation
                  ? tCheckout("paymentOnPickupTitle")
                  : orderResult.paymentMethod === "CARD"
                  ? tCheckout("paymentCardTitle")
                  : tCheckout("paymentTransferTitle")}
              </strong>
            </div>

            {orderResult.discountAmount && orderResult.discountAmount > 0 && (
              <div className="flex justify-between text-[#16803C] font-semibold">
                <span>Discount:</span>
                <span>
                  -
                  {orderResult.discountAmount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-[#E2E2E2] pt-3 font-semibold text-sm">
              <span className="text-[#0B0B0B]">
                {isReservation
                  ? tCheckout("totalDuePickup")
                  : isQuote
                  ? tCheckout("totalDueQuote")
                  : tCheckout("totalDue")}
              </span>
              <span className="text-[#E10600] font-heading text-lg font-semibold">
                {orderResult.total?.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href={`/account?orderNumber=${encodeURIComponent(
                orderResult.orderNumber || ""
              )}&email=${encodeURIComponent(orderResult.email || "")}`}
              className="px-6 py-3 rounded bg-[#0B0B0B] hover:bg-[#171717] text-white font-heading font-medium text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-[#E10600]" />
              <span>{tCheckout("trackPortal")}</span>
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-3 rounded border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] text-[#0B0B0B] font-heading font-medium text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{tCheckout("printSlip")}</span>
            </button>

            <Link
              href="/shop"
              className="px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span>{tCheckout("exploreMore")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="bg-white min-h-[60vh] py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#F5F5F5] border border-[#E2E2E2] flex items-center justify-center text-neutral-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-semibold uppercase text-[#0B0B0B]">
            {tCommon("cartEmpty")}
          </h2>
          <p className="text-xs text-[#737373] font-normal">
            There are currently no machines or equipment in your shopping cart.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs uppercase tracking-wider transition-colors mt-2"
          >
            <span>{tCommon("shopNow")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Header */}
        <div className="border-b border-[#E2E2E2] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#737373] uppercase tracking-wider mb-1">
              <Link href="/cart" className="hover:text-[#E10600] flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>{tCheckout("returnToCart")}</span>
              </Link>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold uppercase text-[#0B0B0B]">
              {tCheckout("pageTitle")}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 bg-[#F5F5F5] px-3 py-1.5 rounded border border-[#E2E2E2]">
            <Lock className="w-3.5 h-3.5 text-[#16803C]" />
            <span>{tCheckout("encryptionBadge")}</span>
          </div>
        </div>

        {submitError && (
          <div className="mb-6 p-4 rounded border border-red-300 bg-red-50 text-red-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <p className="font-medium">{submitError}</p>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Multi-Step Order Information */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Details */}
            <div className="p-5 sm:p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E2E2] pb-3">
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-medium text-xs">
                  1
                </div>
                <h2 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                  {tCheckout("step1Title")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-fullname" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1">
                    {tCheckout("fullName")}
                  </label>
                  <input
                    id="checkout-fullname"
                    type="text"
                    required
                    placeholder="Jean-Marc Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-email" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1">
                    {tCheckout("email")}
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="jean.dupont@motorsport.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="checkout-phone" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1">
                    {tCheckout("phone")}
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Order & Fulfillment Mode Choice */}
            <div className="p-5 sm:p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E2E2] pb-3">
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-medium text-xs">
                  2
                </div>
                <div>
                  <h2 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                    {tCheckout("step2Title")}
                  </h2>
                  <p className="text-[11px] text-[#737373]">
                    {tCheckout("step2Subtitle")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Showroom Reservation (Pay on Collection) */}
                <label
                  onClick={() => handleSelectFulfillment("SHOWROOM_PICKUP")}
                  className={`p-3.5 rounded border cursor-pointer flex flex-col justify-between transition-all ${
                    fulfillment === "SHOWROOM_PICKUP"
                      ? "border-[#E10600] bg-white shadow-xs ring-1 ring-[#E10600]"
                      : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-heading font-semibold text-xs uppercase text-[#0B0B0B] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-[#E10600]" />
                        <span>{tCheckout("pickupCardTitle")}</span>
                      </span>
                      <span className="text-[9px] font-mono font-medium text-[#16803C] bg-[#16803C]/10 px-1.5 py-0.5 rounded uppercase">
                        {tCheckout("pickupZeroOnline")}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed">
                      {tCheckout("pickupCardDesc")}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#E2E2E2] flex items-center justify-between text-[10px] font-mono font-medium text-[#16803C]">
                    <span>{tCheckout("pickupHoldOnline")}</span>
                    <span>{tCheckout("pickupFreeHandover")}</span>
                  </div>
                </label>

                {/* Option 2: Domestic Freight Delivery */}
                <label
                  onClick={() => handleSelectFulfillment("DOMESTIC_DELIVERY")}
                  className={`p-3.5 rounded border cursor-pointer flex flex-col justify-between transition-all ${
                    fulfillment === "DOMESTIC_DELIVERY"
                      ? "border-[#E10600] bg-white shadow-xs ring-1 ring-[#E10600]"
                      : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-heading font-semibold text-xs uppercase text-[#0B0B0B] flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#0B0B0B]" />
                        <span>{tCheckout("deliveryCardTitle")}</span>
                      </span>
                      <span className="text-[9px] font-mono font-medium text-[#0B0B0B] bg-neutral-200 px-1.5 py-0.5 rounded">
                        €150.00
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed">
                      {tCheckout("deliveryCardDesc")}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#E2E2E2] flex items-center justify-between text-[10px] font-mono text-neutral-600">
                    <span>{tCheckout("deliveryMainland")}</span>
                    <span>{tCheckout("deliveryMethod")}</span>
                  </div>
                </label>

                {/* Option 3: International Freight Quotation */}
                <label
                  onClick={() => handleSelectFulfillment("INTERNATIONAL_QUOTE")}
                  className={`p-3.5 rounded border cursor-pointer flex flex-col justify-between transition-all ${
                    fulfillment === "INTERNATIONAL_QUOTE"
                      ? "border-[#E10600] bg-white shadow-xs ring-1 ring-[#E10600]"
                      : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-heading font-semibold text-xs uppercase text-[#0B0B0B] flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-amber-600" />
                        <span>{tCheckout("overseasCardTitle")}</span>
                      </span>
                      <span className="text-[9px] font-mono font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded uppercase">
                        {tCheckout("overseasQuoteBadge")}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed">
                      {tCheckout("overseasCardDesc")}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#E2E2E2] flex items-center justify-between text-[10px] font-mono text-neutral-600">
                    <span>{tCheckout("overseasWorldwide")}</span>
                    <span>{tCheckout("overseasToBeQuoted")}</span>
                  </div>
                </label>
              </div>

              {/* Showroom Handover Details Banner (if Showroom Reservation) */}
              {fulfillment === "SHOWROOM_PICKUP" && (
                <div className="p-3.5 rounded border border-[#16803C]/30 bg-[#16803C]/5 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#16803C] font-heading font-semibold uppercase text-[11px]">
                    <Building className="w-4 h-4 shrink-0" />
                    <span>{tCheckout("showroomHandoverBannerTitle")}</span>
                  </div>
                  <p className="text-[11px] text-neutral-700 leading-relaxed font-normal">
                    <strong>Location:</strong> {tCheckout("showroomHandoverBannerAddress")}
                    <br />
                    <strong>Hours:</strong> {tCheckout("showroomHandoverBannerHours")}
                    <br />
                    <span className="text-[#16803C] font-medium">
                      ✓ {tCheckout("showroomHandoverBannerNotice")}
                    </span>
                  </p>
                </div>
              )}

              {/* Step 3: Destination Address (Only if Delivery or International Quote) */}
              {fulfillment !== "SHOWROOM_PICKUP" && (
                <div className="pt-3 border-t border-[#E2E2E2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-xs uppercase text-[#0B0B0B]">
                      {fulfillment === "INTERNATIONAL_QUOTE"
                        ? tCheckout("step3OverseasTitle")
                        : tCheckout("step3DeliveryTitle")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-street" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1">
                        {tCheckout("streetAddress")}
                      </label>
                      <input
                        id="checkout-street"
                        type="text"
                        required
                        placeholder="15 Rue de la Victoire"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                      />
                    </div>

                    <div>
                      <label htmlFor="checkout-city" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1">
                        {tCheckout("city")}
                      </label>
                      <input
                        id="checkout-city"
                        type="text"
                        required
                        placeholder="Lyon"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                      />
                    </div>

                    <div>
                      <label htmlFor="checkout-postal" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1">
                        {tCheckout("postalCode")}
                      </label>
                      <input
                        id="checkout-postal"
                        type="text"
                        required
                        placeholder="69002"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600] font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="checkout-country" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B] mb-1">
                        {tCheckout("country")}
                      </label>
                      <input
                        id="checkout-country"
                        type="text"
                        required
                        placeholder={
                          fulfillment === "INTERNATIONAL_QUOTE"
                            ? "e.g. United Kingdom, Switzerland, UAE, USA"
                            : "France"
                        }
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Payment Method Choice */}
            <div className="p-5 sm:p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E2E2] pb-3">
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-medium text-xs">
                  {fulfillment === "SHOWROOM_PICKUP" ? "3" : "4"}
                </div>
                <div>
                  <h2 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                    {fulfillment === "SHOWROOM_PICKUP"
                      ? tCheckout("step4PickupTitle")
                      : tCheckout("step4DeliveryTitle")}
                  </h2>
                </div>
              </div>

              {/* If Showroom Reservation is selected */}
              {fulfillment === "SHOWROOM_PICKUP" ? (
                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod("ON_PICKUP")}
                    className="p-4 rounded border border-[#16803C] bg-white flex items-start gap-3 cursor-pointer shadow-xs"
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "ON_PICKUP"}
                      onChange={() => setPaymentMethod("ON_PICKUP")}
                      className="mt-1 text-[#E10600]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-xs uppercase text-[#0B0B0B]">
                          {tCheckout("paymentOnPickupTitle")}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-[#16803C] bg-[#16803C]/10 px-2 py-0.5 rounded">
                          {tCheckout("paymentOnPickupBadge")}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] leading-relaxed font-normal">
                        {tCheckout("paymentOnPickupDesc")}
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                /* If Home Delivery is selected */
                <div className="space-y-2">
                  <label
                    onClick={() => setPaymentMethod("CARD")}
                    className={`p-3.5 rounded border cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === "CARD"
                        ? "border-[#E10600] bg-white shadow-xs"
                        : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-[#E10600]" />
                      <div>
                        <span className="font-heading font-medium text-xs uppercase text-[#0B0B0B] block">
                          {tCheckout("paymentCardTitle")}
                        </span>
                        <span className="text-[10px] text-[#737373] font-normal">
                          {tCheckout("paymentCardDesc")}
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "CARD"}
                      onChange={() => setPaymentMethod("CARD")}
                      className="text-[#E10600]"
                    />
                  </label>

                  <label
                    onClick={() => setPaymentMethod("TRANSFER")}
                    className={`p-3.5 rounded border cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === "TRANSFER"
                        ? "border-[#E10600] bg-white shadow-xs"
                        : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-[#E10600]" />
                      <div>
                        <span className="font-heading font-medium text-xs uppercase text-[#0B0B0B] block">
                          {tCheckout("paymentTransferTitle")}
                        </span>
                        <span className="text-[10px] text-[#737373] font-normal">
                          {tCheckout("paymentTransferDesc")}
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "TRANSFER"}
                      onChange={() => setPaymentMethod("TRANSFER")}
                      className="text-[#E10600]"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Special Instructions & Notes */}
            <div className="p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-2">
              <label htmlFor="checkout-notes" className="block text-[11px] font-heading font-medium uppercase text-[#0B0B0B]">
                {fulfillment === "SHOWROOM_PICKUP"
                  ? tCheckout("notesPickupLabel")
                  : tCheckout("notesDeliveryLabel")}
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                placeholder={
                  fulfillment === "SHOWROOM_PICKUP"
                    ? tCheckout("notesPickupPlaceholder")
                    : tCheckout("notesDeliveryPlaceholder")
                }
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
              />
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 sm:p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] sticky top-24 space-y-4">
              <div className="border-b border-[#E2E2E2] pb-3 flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                  {tCheckout("orderSummaryTitle", { count: totalCount })}
                </h3>
                <Link href="/cart" className="text-[11px] font-medium text-[#E10600] hover:underline">
                  {tCheckout("manageCart")}
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded bg-white border border-[#E2E2E2]"
                  >
                    {item.image ? (
                      <div className="relative w-12 h-12 rounded bg-[#0B0B0B] overflow-hidden shrink-0 border border-[#E2E2E2]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-neutral-200 flex items-center justify-center font-heading text-[10px]">
                        PM
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-xs font-medium text-[#0B0B0B] uppercase truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-[#737373]">
                        Qty: {item.quantity} • {item.sku}
                      </p>
                    </div>
                    <span className="font-heading text-xs font-semibold text-[#0B0B0B] shrink-0">
                      {(item.price * item.quantity).toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input on Checkout */}
              <div className="pt-2 border-t border-[#E2E2E2]">
                {appliedPromo ? (
                  <div className="p-2 rounded bg-white border border-[#16803C]/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#16803C] font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedPromo.code}</span>
                      <span className="font-normal text-[11px] text-[#737373]">
                        (-{appliedPromo.discountAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-neutral-400 hover:text-red-600 font-medium text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      aria-label="Coupon Code"
                      placeholder="Coupon Code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded bg-white border border-[#E2E2E2] text-xs font-mono uppercase focus:outline-none focus:border-[#E10600]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      className="px-3 py-1.5 rounded bg-[#0B0B0B] hover:bg-[#171717] text-white font-heading font-medium text-xs uppercase tracking-wider"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && <p className="text-[10px] text-red-600 mt-1">{promoError}</p>}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 border-t border-[#E2E2E2] space-y-2 text-xs font-normal">
                <div className="flex justify-between text-[#737373]">
                  <span>{tCheckout("subtotal")}</span>
                  <span className="font-mono text-[#0B0B0B]">
                    {subtotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-[#16803C] font-semibold">
                    <span>Discount ({appliedPromo.code}):</span>
                    <span>
                      -
                      {discountAmount.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#737373]">
                  <span>{tCheckout("shippingFee")}</span>
                  <span className="font-mono text-[#0B0B0B]">
                    {fulfillment === "SHOWROOM_PICKUP"
                      ? tCheckout("pickupFreeHandover")
                      : fulfillment === "DOMESTIC_DELIVERY"
                      ? "€150.00"
                      : tCheckout("overseasToBeQuoted")}
                  </span>
                </div>

                {/* Showroom Reservation Payment Notice */}
                {fulfillment === "SHOWROOM_PICKUP" && (
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Due Online Now: €0.00</strong> (Pay balance in Paris upon collection)</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-[#E2E2E2] text-sm font-semibold">
                  <span className="font-heading uppercase text-base text-[#0B0B0B]">
                    {fulfillment === "SHOWROOM_PICKUP"
                      ? tCheckout("totalDuePickup")
                      : fulfillment === "INTERNATIONAL_QUOTE"
                      ? tCheckout("totalDueQuote")
                      : tCheckout("totalDue")}
                  </span>
                  <span className="font-heading text-xl text-[#E10600]">
                    {grandTotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-lg shadow-red-700/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? (
                    <span>...</span>
                  ) : fulfillment === "SHOWROOM_PICKUP" ? (
                    <>
                      <Building className="w-4 h-4" />
                      <span>{tCheckout("submitPickup")}</span>
                    </>
                  ) : fulfillment === "INTERNATIONAL_QUOTE" ? (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>{tCheckout("submitQuote")}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{tCheckout("submitDeliveryCard")}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-[#737373] text-center leading-snug">
                {fulfillment === "SHOWROOM_PICKUP"
                  ? "Zero charge online. Vehicle held exclusively for your showroom appointment."
                  : "Official order recorded directly in Presty Motors Paris system with legal guarantee."}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
