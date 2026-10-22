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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodChoice>("CARD");

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
    total: number;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    email: string;
  } | null>(null);

  // Auto-apply promo from query parameter if present
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
  }, [searchParams, subtotal, appliedPromo]);

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
        notes: orderNotes,
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
        total: response.total ?? grandTotal,
        subtotal: response.subtotal ?? subtotal,
        shippingFee: response.shippingFee ?? shippingFee,
        discountAmount: response.discountAmount ?? discountAmount,
        email,
      });

      clearCart();
    });
  };

  // Order Confirmed / Quotation Requested Screen
  if (orderResult) {
    const isQuote = orderResult.fulfillment === "INTERNATIONAL_QUOTE";

    return (
      <div className="bg-white min-h-[75vh] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              isQuote
                ? "bg-amber-500/10 text-amber-600"
                : "bg-[#16803C]/10 text-[#16803C]"
            }`}
          >
            {isQuote ? <Globe className="w-8 h-8" /> : <Check className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#F5F5F5] border border-[#E2E2E2]">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <span className="text-xs font-mono font-bold text-[#E10600] uppercase tracking-wider">
                {isQuote
                  ? `Shipping Quote Reference: ${orderResult.quoteNumber || orderResult.orderNumber}`
                  : `Order Confirmed • Reference: ${orderResult.orderNumber}`}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-[#0B0B0B]">
              {isQuote
                ? "International Quotation Request Received!"
                : "Thank You for Your Order!"}
            </h1>
            <p className="text-xs sm:text-sm text-[#737373] max-w-lg mx-auto leading-relaxed">
              {isQuote ? (
                <>
                  We have logged your international freight request for destination <strong>{country}</strong>.
                  Our Paris logistics team is preparing a customized freight, customs & duty dossier dispatched to{" "}
                  <strong>{orderResult.email}</strong> within 24–48 hours.
                </>
              ) : (
                <>
                  A formal confirmation receipt and pre-delivery inspection summary have been dispatched to{" "}
                  <strong>{orderResult.email}</strong>. Our Paris workshop team has reserved your vehicle.
                </>
              )}
            </p>
          </div>

          {/* Receipt Card */}
          <div className="p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] text-xs text-start space-y-3 max-w-lg mx-auto">
            <div className="flex justify-between border-b border-[#E2E2E2] pb-2">
              <span className="text-[#737373]">Reference Number:</span>
              <strong className="font-mono text-[#0B0B0B]">
                {orderResult.orderNumber}
              </strong>
            </div>

            {orderResult.quoteNumber && (
              <div className="flex justify-between border-b border-[#E2E2E2] pb-2">
                <span className="text-[#737373]">Quotation Request:</span>
                <strong className="font-mono text-[#E10600]">
                  {orderResult.quoteNumber}
                </strong>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-[#737373]">Fulfillment:</span>
              <strong className="text-[#0B0B0B]">
                {orderResult.fulfillment === "SHOWROOM_PICKUP"
                  ? "Paris 16e Flagship Showroom Pickup"
                  : orderResult.fulfillment === "DOMESTIC_DELIVERY"
                  ? "Domestic Enclosed Tailgate Freight"
                  : `International Freight (${country})`}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-[#737373]">Payment Selection:</span>
              <strong className="text-[#0B0B0B]">
                {paymentMethod === "CARD"
                  ? "Credit / Debit Card (Pre-Authorized)"
                  : paymentMethod === "TRANSFER"
                  ? "Official Bank Wire Transfer (IBAN Issued)"
                  : "Paris Showroom Settlement on Collection"}
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
                {isQuote ? "Subtotal (Excl. Overseas Shipping):" : "Total Amount (TTC):"}
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
              <span>Print Receipt</span>
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
              Secure Checkout & Vehicle Order
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 bg-[#F5F5F5] px-3 py-1.5 rounded border border-[#E2E2E2]">
            <Lock className="w-3.5 h-3.5 text-[#16803C]" />
            <span>256-bit SSL Encrypted & Verified</span>
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

            {/* Step 2: Fulfillment Choice */}
            <div className="p-5 sm:p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E2E2] pb-3">
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-black text-xs">
                  2
                </div>
                <h2 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                  Fulfillment & Delivery Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Pickup */}
                <label
                  onClick={() => setFulfillment("SHOWROOM_PICKUP")}
                  className={`p-3.5 rounded border cursor-pointer flex flex-col justify-between transition-all ${
                    fulfillment === "SHOWROOM_PICKUP"
                      ? "border-[#E10600] bg-white shadow-xs"
                      : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-black text-xs uppercase text-[#0B0B0B]">
                      Paris Showroom
                    </span>
                    <span className="text-[10px] font-bold text-[#16803C] uppercase">FREE</span>
                  </div>
                  <p className="text-[10px] text-[#737373] leading-relaxed">
                    Personalized vehicle briefing at 128 Av. des Sports Motorisés, Paris 16e.
                  </p>
                </label>

                {/* Option 2: Domestic Delivery */}
                <label
                  onClick={() => setFulfillment("DOMESTIC_DELIVERY")}
                  className={`p-3.5 rounded border cursor-pointer flex flex-col justify-between transition-all ${
                    fulfillment === "DOMESTIC_DELIVERY"
                      ? "border-[#E10600] bg-white shadow-xs"
                      : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-black text-xs uppercase text-[#0B0B0B]">
                      Domestic Freight
                    </span>
                    <span className="text-[10px] font-bold text-[#0B0B0B] font-mono">€150.00</span>
                  </div>
                  <p className="text-[10px] text-[#737373] leading-relaxed">
                    Enclosed tailgate delivery in France in a protective steel transport frame.
                  </p>
                </label>

                {/* Option 3: International Quotation */}
                <label
                  onClick={() => setFulfillment("INTERNATIONAL_QUOTE")}
                  className={`p-3.5 rounded border cursor-pointer flex flex-col justify-between transition-all ${
                    fulfillment === "INTERNATIONAL_QUOTE"
                      ? "border-[#E10600] bg-white shadow-xs"
                      : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-black text-xs uppercase text-[#0B0B0B]">
                      Overseas Quote
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Quote</span>
                  </div>
                  <p className="text-[10px] text-[#737373] leading-relaxed">
                    Custom worldwide air & maritime freight dossier with customs assistance.
                  </p>
                </label>
              </div>

              {/* Step 3: Address Details (if not showroom pickup) */}
              {fulfillment !== "SHOWROOM_PICKUP" && (
                <div className="pt-3 border-t border-[#E2E2E2] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs uppercase text-[#0B0B0B]">
                      {fulfillment === "INTERNATIONAL_QUOTE"
                        ? "International Destination Address"
                        : "Domestic Delivery Address"}
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
                        placeholder={fulfillment === "INTERNATIONAL_QUOTE" ? "e.g. United Kingdom, Switzerland, UAE, USA" : "France"}
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-9 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Payment Choice */}
            <div className="p-5 sm:p-6 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2E2E2] pb-3">
                <div className="w-6 h-6 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-black text-xs">
                  {fulfillment === "SHOWROOM_PICKUP" ? "3" : "4"}
                </div>
                <h2 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                  Payment Method
                </h2>
              </div>

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
                        Credit / Debit Card (Visa, Mastercard, Amex)
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        Instant secure reservation with 3D-Secure authentication.
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
                        Bank Wire Transfer (SEPA / IBAN)
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        Official proforma invoice and bank IBAN coordinates issued upon checkout.
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

                {fulfillment === "SHOWROOM_PICKUP" && (
                  <label
                    onClick={() => setPaymentMethod("ON_PICKUP")}
                    className={`p-3.5 rounded border cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === "ON_PICKUP"
                        ? "border-[#E10600] bg-white shadow-xs"
                        : "border-[#E2E2E2] bg-white/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-[#E10600]" />
                      <div>
                        <span className="font-heading font-bold text-xs uppercase text-[#0B0B0B] block">
                          Payment in Paris Showroom on Collection
                        </span>
                        <span className="text-[10px] text-[#737373]">
                          Inspect the machine in person with our mechanics before final payment.
                        </span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "ON_PICKUP"}
                      onChange={() => setPaymentMethod("ON_PICKUP")}
                      className="text-[#E10600]"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Special Instructions & Notes */}
            <div className="p-4 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-2">
              <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B]">
                Order Notes / Tailgate Logistics Requests (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g., Gate code, specific handover window, or test ride preferences..."
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
                  <span>Fulfillment & Transport:</span>
                  <span className="font-mono text-[#0B0B0B]">
                    {fulfillment === "SHOWROOM_PICKUP"
                      ? "FREE"
                      : fulfillment === "DOMESTIC_DELIVERY"
                      ? "€150.00"
                      : "To be quoted"}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-[#E2E2E2] text-sm font-black">
                  <span className="font-heading uppercase text-base text-[#0B0B0B]">
                    {fulfillment === "INTERNATIONAL_QUOTE" ? "Machine Total (Excl. Freight):" : "Total (TTC):"}
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
                    <span>Registering Order in Workshop System...</span>
                  ) : fulfillment === "INTERNATIONAL_QUOTE" ? (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Submit Shipping Quote Request</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Confirm & Place Order (
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
                Official transaction recorded directly in Presty Motors Paris system with legal guarantee.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
