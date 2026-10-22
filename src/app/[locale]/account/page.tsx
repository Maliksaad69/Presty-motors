import { Link } from "@/i18n/routing";
import { Package, MapPin, Calendar, ArrowRight, Phone, ShieldCheck, Clock, User, Globe } from "lucide-react";
import { db } from "@/lib/db";
import { OrderLookupView } from "@/components/account/OrderLookupView";

export const dynamic = "force-dynamic";

export default async function AccountPage(props: {
  searchParams: Promise<{ orderNumber?: string; email?: string }>;
}) {
  const searchParams = await props.searchParams;

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
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#E10600]">
                Customer & Order Portal
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase text-[#0B0B0B]">
              My Racing Account & Orders
            </h1>
            <p className="text-xs text-[#737373]">
              Track live machine assembly, check international shipping quotes, and manage Paris showroom handovers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors"
            >
              Explore Catalog
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
              <h2 className="font-heading text-lg font-black uppercase text-[#0B0B0B] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E10600]" />
                <span>Showroom & Factory Orders ({dbOrders.length})</span>
              </h2>
              <span className="text-[11px] text-[#737373] font-mono">Real-Time Database Feed</span>
            </div>

            {dbOrders.length === 0 ? (
              <div className="p-8 rounded border border-dashed border-[#E2E2E2] text-center space-y-3">
                <p className="text-xs text-[#737373]">No orders recorded in the workshop yet.</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-heading font-black text-[#E10600] uppercase"
                >
                  <span>Select your first vehicle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
                          <span className="font-mono text-xs font-bold text-[#0B0B0B]">
                            REF: {order.orderNumber}
                          </span>
                          <span className="text-[10px] text-[#737373]">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isQuote && (
                            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                              QUOTE: {order.shippingQuote?.quoteNumber || "REQ"}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider ${
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
                          <h3 className="font-heading text-base font-black uppercase text-[#0B0B0B]">
                            {firstItem?.productTitle || "Motorsport Vehicle"}
                            {order.items.length > 1 && (
                              <span className="text-xs font-mono font-normal text-[#737373] ml-2">
                                +{order.items.length - 1} other item(s)
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-[#737373] mt-0.5">
                            Customer: {order.guestName || "Showroom Client"} • Fulfillment:{" "}
                            {order.fulfillmentType.replace(/_/g, " ")}
                          </p>
                        </div>

                        <div className="text-start sm:text-end">
                          <span className="font-heading text-base font-black text-[#0B0B0B]">
                            {Number(order.total).toLocaleString("fr-FR", {
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
                <div className="w-12 h-12 rounded bg-[#0B0B0B] text-white flex items-center justify-center font-heading font-black text-sm">
                  PM
                </div>
                <div>
                  <h3 className="font-heading text-sm font-black uppercase text-[#0B0B0B]">
                    Paris Showroom Desk
                  </h3>
                  <p className="text-[11px] text-[#737373]">Flagship Customer Operations</p>
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
                <h4 className="font-heading text-xs font-black uppercase tracking-wider text-[#0B0B0B]">
                  Fulfillment Standards
                </h4>
              </div>
              <ul className="text-[11px] text-[#737373] space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#E10600] font-bold">•</span>
                  <span><strong>Paris Showroom:</strong> Test-ride handover & pre-delivery dyno sheet briefing.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#E10600] font-bold">•</span>
                  <span><strong>Domestic Tailgate:</strong> Secured steel pallet delivery anywhere in mainland France.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#E10600] font-bold">•</span>
                  <span><strong>International Freight:</strong> Air/Sea crate packaging with phytosanitary & customs declaration.</span>
                </li>
              </ul>
            </div>

            {/* Test Ride & Showroom Appointment Card */}
            <div className="p-5 rounded border border-[#E2E2E2] bg-[#0B0B0B] text-white space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E10600]" />
                <h4 className="font-heading text-xs font-black uppercase tracking-wider text-white">
                  Schedule Track Test Ride
                </h4>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Test any model on our private track before your scheduled delivery.
              </p>
              <Link
                href="/showroom"
                className="inline-flex items-center gap-1.5 text-xs font-heading font-black text-[#E10600] hover:text-white uppercase tracking-wider"
              >
                <span>Book Test Ride at Showroom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
