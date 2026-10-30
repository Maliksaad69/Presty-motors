import { Link } from "@/i18n/routing";
import { Package, MapPin, Calendar, ArrowRight, Phone, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { OrderLookupView } from "@/components/account/OrderLookupView";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function AccountPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNumber?: string; email?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations({ locale, namespace: "account" });

  // Retrieve actual database orders from PostgreSQL
  const dbOrders = await db.order.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      shipments: true,
      shippingQuote: true,
    },
  });

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="border-b border-[#E2E2E2] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-[#E10600]">
                {t("badge")}
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold uppercase text-[#0B0B0B]">
              {t("title")}
            </h1>
            <p className="text-xs text-[#737373]">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-medium text-xs uppercase tracking-wider transition-colors"
            >
              {t("selectFirst")}
            </Link>
          </div>
        </div>

        {/* Live Order Lookup Component */}
        <OrderLookupView
          initialOrderNumber={searchParams.orderNumber}
          initialEmail={searchParams.email}
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Orders History from Database */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E2E2] pb-3">
              <h2 className="font-heading text-lg font-semibold uppercase text-[#0B0B0B] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E10600]" />
                <span>{t("ordersTitle")} ({dbOrders.length})</span>
              </h2>
              <span className="text-[11px] text-[#737373] font-mono">{t("realTimeFeed")}</span>
            </div>

            {dbOrders.length === 0 ? (
              <div className="p-8 rounded border border-dashed border-[#E2E2E2] text-center space-y-3">
                <p className="text-xs text-[#737373]">{t("noOrders")}</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-heading font-semibold text-[#E10600] uppercase"
                >
                  <span>{t("selectFirst")}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {dbOrders.map((order) => {
                  const firstItem = order.items[0];
                  const isQuote = order.fulfillmentType === "INTERNATIONAL_QUOTE";

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] hover:border-[#0B0B0B] transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E2E2] pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-[#0B0B0B]">
                            {t("ref")} {order.orderNumber}
                          </span>
                          <span className="text-[10px] text-[#737373]">
                            {new Date(order.createdAt).toLocaleDateString(locale, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isQuote && (
                            <span className="text-[10px] font-mono font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              QUOTE: {order.shippingQuote?.quoteNumber || "REQ"}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-heading font-semibold uppercase tracking-wider ${
                              order.status === "DELIVERED"
                                ? "bg-[#16803C]/10 text-[#16803C] border border-[#16803C]/30"
                                : order.status === "PENDING_QUOTE"
                                ? "bg-amber-500/10 text-amber-700 border border-amber-300"
                                : "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/30"
                            }`}
                          >
                            ● {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-heading text-base font-semibold uppercase text-[#0B0B0B]">
                            {firstItem?.productTitle || "Motorsport Vehicle"}
                            {order.items.length > 1 && (
                              <span className="text-xs font-mono font-normal text-[#737373] ml-2 rtl:mr-2">
                                {t("otherItems", { count: order.items.length - 1 })}
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-[#737373] mt-0.5">
                            {t("customer")} {order.guestName || "Showroom Client"} • {t("fulfillment")}{" "}
                            {order.fulfillmentType.replace(/_/g, " ")}
                          </p>
                        </div>

                        <div className="text-start sm:text-end">
                          <span className="font-heading text-base font-semibold text-[#0B0B0B]">
                            {Number(order.total).toLocaleString(locale, {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Customer Info & Showroom Assistance */}
          <div className="lg:col-span-4 space-y-6">
            {/* Showroom Profile Card */}
            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-semibold text-sm">
                  PM
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold uppercase text-[#0B0B0B]">
                    {t("showroomDesk")}
                  </h3>
                  <p className="text-[11px] text-[#737373]">{t("customerOps")}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2E2E2] text-xs">
                <div className="flex items-center gap-2 text-[#737373]">
                  <Phone className="w-3.5 h-3.5 text-[#E10600]" />
                  <span className="font-mono text-[#0B0B0B]">+33 1 42 68 55 00</span>
                </div>
                <div className="flex items-start gap-2 text-[#737373]">
                  <MapPin className="w-3.5 h-3.5 text-[#E10600] shrink-0 mt-0.5" />
                  <span className="text-[#0B0B0B]">128 Avenue des Sports Motorisés, 75016 Paris</span>
                </div>
              </div>
            </div>

            {/* Saved Delivery Rules & Standards */}
            <div className="p-5 rounded border border-[#E2E2E2] bg-[#F5F5F5] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16803C]" />
                <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#0B0B0B]">
                  {t("fulfillmentStandards")}
                </h4>
              </div>
              <ul className="text-[11px] text-[#737373] space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#E10600] font-semibold">•</span>
                  <span>{t("parisShowroomDesc")}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#E10600] font-semibold">•</span>
                  <span>{t("domesticTailgateDesc")}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#E10600] font-semibold">•</span>
                  <span>{t("intlFreightDesc")}</span>
                </li>
              </ul>
            </div>

            {/* Test Ride & Showroom Appointment Card */}
            <div className="p-5 rounded border border-[#E2E2E2] bg-[#0B0B0B] text-white space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E10600]" />
                <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-white">
                  {t("scheduleTestRide")}
                </h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {t("scheduleTestRideDesc")}
              </p>
              <Link
                href="/showroom"
                className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-[#E10600] hover:text-white uppercase tracking-wider"
              >
                <span>{t("bookTestRideBtn")}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
