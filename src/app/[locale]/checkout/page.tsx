"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { useCart } from "@/lib/cart-context";
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

  // Submission result states
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    quoteNumber?: string;
    status: string;
    fulfillment: FulfillmentMode;
    paymentMethod: PaymentMethodChoice;
    total: number;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    email: string;
  } | null>(null);

  // Auto-apply promo and fulfillment mode from query parameter if present
  useEffect(() => {
    const promoFromUrl = searchParams.get("promo");
    if (promoFromUrl && subtotal > 0 && !appliedPromo) {
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
      setPromoError(result.errorMessage || "Invalid promotional code.");
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
      setSubmitError("Your cart is empty. Please select products first.");
      return;
    }

    startTransition(async () => {
      const response = await createOrderAction({
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
                streetLine1: street || "Not specified",
                city: city || "Not specified",
                postalCode: postalCode || "00000",
                country: country || (fulfillment === "DOMESTIC_DELIVERY" ? "France" : "International"),
                phone,
              }
            : undefined,
        paymentMethod,
        items: items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
        })),
        promoCode: appliedPromo?.code,
        notes:
          fulfillment === "SHOWROOM_PICKUP"
            ? `[SHOWROOM RESERVATION] Customer visiting Paris showroom to inspect and pay on collection. ${orderNotes}`.trim()
            : orderNotes,
      });

      if (!response.success) {
        setSubmitError(response.errorMessage || "Failed to process order. Please verify your details.");
        return;
      }

      setOrderResult({
        orderNumber: response.orderNumber || "PM-ORDER",
        quoteNumber: response.quoteNumber,
        status: response.status || "PENDING",
        fulfillment,
        paymentMethod,
        total: response.total ?? grandTotal,
        subtotal: response.subtotal ?? subtotal,
        shippingFee: response.shippingFee ?? shippingFee,
        discountAmount: response.discountAmount ?? discountAmount,
        email,
      });

      clearCart();
    });
  };

  // Order Confirmed / Reservation Confirmed / Quotation Requested Screen
  if (orderResult) {
    const isQuote = orderResult.fulfillment === "INTERNATIONAL_QUOTE";
    const isReservation = orderResult.fulfillment === "SHOWROOM_PICKUP";

    return (
      <div className="bg-white min-h-[75vh] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              isQuote
                ? "bg-amber-500/10 text-amber-600"
                : isReservation
                ? "bg-[#16803C]/10 text-[#16803C]"
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
              <span className="text-xs font-mono font-bold text-[#E10600] uppercase tracking-wider">
                {isQuote
                  ? `Shipping Quote Reference: ${orderResult.quoteNumber || orderResult.orderNumber}`
                  : isReservation
                  ? `Showroom Reservation • Reference: ${orderResult.orderNumber}`
                  : `Delivery Order Confirmed • Reference: ${orderResult.orderNumber}`}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-[#0B0B0B]">
              {isQuote
                ? "International Quotation Request Received!"
                : isReservation
                ? "Machine Reservation Confirmed!"
                : "Thank You for Your Order!"}
            </h1>

            <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed">
              {isQuote ? (
                <>
                  We have logged your international freight request for destination <strong>{country}</strong>.
                  Our Paris logistics team is preparing a customized freight, customs & duty dossier dispatched to{" "}
                  <strong>{orderResult.email}</strong> within 24–48 hours.
                </>
              ) : isReservation ? (
                <>
                  Your machine is exclusively reserved at our Paris showroom with{" "}
                  <strong className="text-[#16803C]">zero upfront online charge</strong>. Our workshop
                  mechanics are preparing the machine for your upcoming visit, inspection, and test ride.
                </>
              ) : (
                <>
                  A formal confirmation receipt and pre-delivery inspection summary have been dispatched to{" "}
                  <strong>{orderResult.email}</strong>. Enclosed tailgate delivery will be scheduled.
                </>
              )}
            </p>
          </div>

          {/* Showroom Visit Location Notice (For Reservation) */}
          {isReservation && (
            <div className="p-4 rounded border border-[#16803C]/30 bg-[#16803C]/5 text-xs text-start space-y-2 max-w-lg mx-auto">
              <div className="flex items-center gap-2 text-[#16803C] font-heading font-black uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Showroom Handover & Inspection Location</span>
              </div>
              <p className="text-neutral-700 leading-relaxed">
                <strong>Presty Motors Paris Flagship:</strong> 128 Avenue des Sports Motorisés, 75016 Paris, France
                <br />
                <strong>Opening Hours:</strong> Tuesday to Saturday, 09:00 – 19:00
                <br />
                <strong>Payment on Collection:</strong> Accepted via Credit/Debit Card, Certified Bank Check, or Cash in person.
              </p>
            </div>
          )}

          {/* Receipt Card */}
          <div className="p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] text-xs text-start space-y-3 max-w-lg mx-auto">
            <div className="flex justify-between border-b border-[#E2E2E2] pb-2">
              <span className="text-[#737373]">Reference Number:</span>
              <strong className="font-mono text-[#0B0B0B]">{orderResult.orderNumber}</strong>
            </div>

            {orderResult.quoteNumber && (
              <div className="flex justify-between border-b border-[#E2E2E2] pb-2">
                <span className="text-[#737373]">Quotation Request:</span>
                <strong className="font-mono text-[#E10600]">{orderResult.quoteNumber}</strong>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-[#737373]">Order Type:</span>
              <strong className="text-[#0B0B0B]">
                {isReservation
                  ? "Showroom Visit & Reservation (Pay on Collection)"
                  : orderResult.fulfillment === "DOMESTIC_DELIVERY"
                  ? "Domestic Enclosed Tailgate Freight"
                  : `International Freight (${country})`}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-[#737373]">Payment Selection:</span>
              <strong className="text-[#0B0B0B]">
                {isReservation
                  ? "Direct Showroom Payment on Collection (Zero Paid Online)"
                  : orderResult.paymentMethod === "CARD"
                  ? "Online Card Payment (Pre-Authorized / Stripe)"
                  : "Official Bank Wire Transfer (SEPA / IBAN Issued)"}
              </strong>
            </div>

            {orderResult.discountAmount > 0 && (
              <div className="flex justify-between text-[#16803C] font-bold">
                <span>Promotional Discount:</span>
                <span>
                  -
                  {orderResult.discountAmount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t border-[#E2E2E2] pt-3 font-bold text-sm">
              <span className="text-[#0B0B0B]">
                {isReservation
                  ? "Amount to Pay upon Showroom Collection:"
                  : isQuote
                  ? "Subtotal (Excl. Overseas Shipping):"
                  : "Total Amount (TTC):"}
              </span>
              <span className="text-[#E10600] font-heading text-lg">
                {orderResult.total.toLocaleString("fr-FR", {
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
                orderResult.orderNumber
              )}&email=${encodeURIComponent(orderResult.email)}`}
              className="px-6 py-3 rounded bg-[#0B0B0B] hover:bg-[#171717] text-white font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-[#E10600]" />
              <span>Track in Customer Portal</span>
            </Link>

            <button
              onClick={() => window.print()}
              className="px-5 py-3 rounded border border-[#E2E2E2] bg-white hover:bg-[#F5F5F5] text-[#0B0B0B] font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Reservation Slip</span>
            </button>

            <Link
              href="/shop"
              className="px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span>Explore More Machines</span>
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
          <h2 className="font-heading text-2xl font-black uppercase text-[#0B0B0B]">
            Your Cart is Empty
          </h2>
          <p className="text-xs text-[#737373]">
            There are currently no machines or equipment in your shopping cart.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors mt-2"
          >
            <span>Browse Catalog</span>
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
                <span>Return to Cart Review</span>
              </Link>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-[#0B0B0B]">
              Checkout & Vehicle Order
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 bg-[#F5F5F5] px-3 py-1.5 rounded border border-[#E2E2E2]">
            <Lock className="w-3.5 h-3.5 text-[#16803C]" />
            <span>256-bit Encrypted Showroom System</span>
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
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-black text-xs">
                  1
                </div>
                <h2 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                  Customer & Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jean-Marc Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jean.dupont@motorsport.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1">
                    Mobile Phone *
                  </label>
                  <input
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
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-black text-xs">
                  2
                </div>
                <div>
                  <h2 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                    Choose Order Mode: Showroom Reservation vs. Delivery
                  </h2>
                  <p className="text-[11px] text-[#737373]">
                    Reserve online to visit and pay in Paris, or select home freight with online payment.
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
                      <span className="font-heading font-black text-xs uppercase text-[#0B0B0B] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-[#E10600]" />
                        <span>Showroom Reservation</span>
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[#16803C] bg-[#16803C]/10 px-1.5 py-0.5 rounded uppercase">
                        Zero Online
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed">
                      Hold vehicle for in-person inspection and test ride at Paris 16e. <strong>Pay on visit</strong>.
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#E2E2E2] flex items-center justify-between text-[10px] font-mono font-bold text-[#16803C]">
                    <span>Hold Online: €0</span>
                    <span>Free Handover</span>
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
                      <span className="font-heading font-black text-xs uppercase text-[#0B0B0B] flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#0B0B0B]" />
                        <span>Home Delivery</span>
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[#0B0B0B] bg-neutral-200 px-1.5 py-0.5 rounded">
                        €150.00
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed">
                      Enclosed tailgate delivery in France in a protective steel transport frame. Pay online.
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#E2E2E2] flex items-center justify-between text-[10px] font-mono text-neutral-600">
                    <span>Mainland France</span>
                    <span>Online / Wire</span>
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
                      <span className="font-heading font-black text-xs uppercase text-[#0B0B0B] flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-amber-600" />
                        <span>Overseas Quote</span>
                      </span>
                      <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded uppercase">
                        Quote
                      </span>
                    </div>
                    <p className="text-[10px] text-[#737373] leading-relaxed">
                      Custom air/sea freight crate packaging with export customs clearance.
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-[#E2E2E2] flex items-center justify-between text-[10px] font-mono text-neutral-600">
                    <span>Worldwide</span>
                    <span>To be quoted</span>
                  </div>
                </label>
              </div>

              {/* Showroom Handover Details Banner (if Showroom Reservation) */}
              {fulfillment === "SHOWROOM_PICKUP" && (
                <div className="p-3.5 rounded border border-[#16803C]/30 bg-[#16803C]/5 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#16803C] font-heading font-black uppercase text-[11px]">
                    <Building className="w-4 h-4 shrink-0" />
                    <span>Paris 16e Flagship Handover & Test Ride</span>
                  </div>
                  <p className="text-[11px] text-neutral-700 leading-relaxed">
                    <strong>Location:</strong> 128 Avenue des Sports Motorisés, 75016 Paris
                    <br />
                    <strong>Hours:</strong> Tuesday to Saturday, 09:00 – 19:00
                    <br />
                    <span className="text-[#16803C] font-bold">
                      ✓ No upfront card payment required online today.
                    </span>{" "}
                    Our mechanics will inspect, dyno-tune, and hold your machine until your visit.
                  </p>
                </div>
              )}

              {/* Step 3: Destination Address (Only if Delivery or International Quote) */}
              {fulfillment !== "SHOWROOM_PICKUP" && (
                <div className="pt-3 border-t border-[#E2E2E2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs uppercase text-[#0B0B0B]">
                      {fulfillment === "INTERNATIONAL_QUOTE"
                        ? "International Destination Address"
                        : "Domestic Tailgate Delivery Address"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="15 Rue de la Victoire"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Lyon"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="69002"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600] font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1">
                        Destination Country *
                      </label>
                      <input
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
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-black text-xs">
                  {fulfillment === "SHOWROOM_PICKUP" ? "3" : "4"}
                </div>
                <div>
                  <h2 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                    {fulfillment === "SHOWROOM_PICKUP"
                      ? "Payment Method: Settle on Showroom Visit"
                      : "Online & Bank Payment Methods"}
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
                        <span className="font-heading font-black text-xs uppercase text-[#0B0B0B]">
                          Direct Showroom Payment on Collection
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#16803C] bg-[#16803C]/10 px-2 py-0.5 rounded">
                          ZERO DUE TODAY
                        </span>
                      </div>
                      <p className="text-[11px] text-[#737373] leading-relaxed">
                        Inspect the machine in person with our workshop team before paying. Settle the balance
                        directly in Paris by Credit/Debit Card, Certified Bank Check, or Cash.
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
                        <span className="font-heading font-bold text-xs uppercase text-[#0B0B0B] block">
                          Online Payment: Credit / Debit Card (Visa, Mastercard, Amex)
                        </span>
                        <span className="text-[10px] text-[#737373]">
                          Secure online checkout (Stripe Gateway). Instant order confirmation.
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
                        <span className="font-heading font-bold text-xs uppercase text-[#0B0B0B] block">
                          Bank Wire Transfer (SEPA / IBAN Proforma)
                        </span>
                        <span className="text-[10px] text-[#737373]">
                          Official proforma invoice and company IBAN details dispatched immediately.
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
              <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B]">
                {fulfillment === "SHOWROOM_PICKUP"
                  ? "Planned Visit Date or Test Ride Preferences (Optional)"
                  : "Order Notes / Tailgate Logistics Requests (Optional)"}
              </label>
              <textarea
                rows={2}
                placeholder={
                  fulfillment === "SHOWROOM_PICKUP"
                    ? "e.g. Planning to visit this Saturday around 14:00 for test ride..."
                    : "e.g. Gate access code, specific tailgate delivery window..."
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
                <h3 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                  Order Summary ({totalCount})
                </h3>
                <Link href="/cart" className="text-[11px] font-bold text-[#E10600] hover:underline">
                  Manage Cart
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
                      <h4 className="font-heading text-xs font-bold text-[#0B0B0B] uppercase truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-[#737373]">
                        Qty: {item.quantity} • {item.sku}
                      </p>
                    </div>
                    <span className="font-heading text-xs font-black text-[#0B0B0B] shrink-0">
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
                    <div className="flex items-center gap-1.5 text-[#16803C] font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedPromo.code}</span>
                      <span className="font-normal text-[11px] text-[#737373]">
                        (-{appliedPromo.discountAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-neutral-400 hover:text-red-600 font-bold text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded bg-white border border-[#E2E2E2] text-xs font-mono uppercase focus:outline-none focus:border-[#E10600]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      className="px-3 py-1.5 rounded bg-[#0B0B0B] hover:bg-[#171717] text-white font-heading font-black text-xs uppercase tracking-wider"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && <p className="text-[10px] text-red-600 mt-1">{promoError}</p>}
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 border-t border-[#E2E2E2] space-y-2 text-xs">
                <div className="flex justify-between text-[#737373]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-[#0B0B0B]">
                    {subtotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-[#16803C] font-bold">
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
                  <span>Fulfillment:</span>
                  <span className="font-mono text-[#0B0B0B]">
                    {fulfillment === "SHOWROOM_PICKUP"
                      ? "Paris Showroom (FREE)"
                      : fulfillment === "DOMESTIC_DELIVERY"
                      ? "€150.00"
                      : "To be quoted"}
                  </span>
                </div>

                {/* Showroom Reservation Payment Notice */}
                {fulfillment === "SHOWROOM_PICKUP" && (
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Due Online Now: €0.00</strong> (Pay balance in Paris upon collection)</span>
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-[#E2E2E2] text-sm font-black">
                  <span className="font-heading uppercase text-base text-[#0B0B0B]">
                    {fulfillment === "SHOWROOM_PICKUP"
                      ? "Total Payable on Collection:"
                      : fulfillment === "INTERNATIONAL_QUOTE"
                      ? "Subtotal (Excl. Freight):"
                      : "Total (TTC):"}
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
                  className="w-full py-3.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-lg shadow-red-700/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? (
                    <span>Registering in Workshop System...</span>
                  ) : fulfillment === "SHOWROOM_PICKUP" ? (
                    <>
                      <Building className="w-4 h-4" />
                      <span>Confirm Showroom Reservation (Pay on Visit)</span>
                    </>
                  ) : fulfillment === "INTERNATIONAL_QUOTE" ? (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Submit Shipping Quote Request</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Confirm & Pay Delivery Order (
                        {grandTotal.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                        )
                      </span>
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
