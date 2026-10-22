"use client";

import { useState, useTransition } from "react";
import {
  Globe,
  Search,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  User,
  MapPin,
} from "lucide-react";
import { updateAdminQuoteAction } from "@/server/actions/admin";
import { QuoteStatus } from "@prisma/client";

interface QuoteItem {
  id: string;
  quoteNumber: string;
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  destinationCountry: string;
  destinationCity: string;
  destinationAddress: string;
  status: QuoteStatus;
  quotedAmount: number | null;
  requestedItems: any;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
}

export function QuotesManagementView({ initialQuotes }: { initialQuotes: QuoteItem[] }) {
  const [quotes, setQuotes] = useState<QuoteItem[]>(initialQuotes);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Quote pricing modal
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<QuoteStatus>(QuoteStatus.QUOTED);
  const [quotedAmountInput, setQuotedAmountInput] = useState("");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.fullName.toLowerCase().includes(search.toLowerCase()) ||
      q.email.toLowerCase().includes(search.toLowerCase()) ||
      q.destinationCountry.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openQuoteModal = (quote: QuoteItem) => {
    setSelectedQuote(quote);
    setTargetStatus(quote.status === "REQUESTED" ? QuoteStatus.QUOTED : quote.status);
    setQuotedAmountInput(quote.quotedAmount ? quote.quotedAmount.toString() : "850");
    setAdminNotesInput(
      quote.adminNotes ||
        "Air freight crated in certified timber frame. Customs declaration included."
    );
    setModalError(null);
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;

    const amount = parseFloat(quotedAmountInput);
    if (isNaN(amount) || amount < 0) {
      setModalError("Please enter a valid quoted freight amount.");
      return;
    }

    setModalError(null);
    startTransition(async () => {
      const res = await updateAdminQuoteAction(
        selectedQuote.id,
        targetStatus,
        amount,
        adminNotesInput
      );

      if (res.success) {
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === selectedQuote.id
              ? {
                  ...q,
                  status: targetStatus,
                  quotedAmount: amount,
                  adminNotes: adminNotesInput,
                }
              : q
          )
        );
        setSelectedQuote(null);
      } else {
        setModalError(res.errorMessage || "Failed to update quotation.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase text-white tracking-wide">
            International Freight Quotations
          </h1>
          <p className="text-xs text-neutral-400">
            Review overseas delivery dossiers, calculate specialized air/sea freight rates, and dispatch formal quotes.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by quote number, destination country, customer..."
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
          <option value="ALL">All Quote States</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="REVIEWING">REVIEWING</option>
          <option value="QUOTED">QUOTED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-[#222222] rounded bg-[#141414] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1C1C1C] border-b border-[#262626] text-[11px] font-heading font-black uppercase text-neutral-400 tracking-wider">
            <tr>
              <th className="p-3.5">Quote Ref</th>
              <th className="p-3.5">Customer & Contact</th>
              <th className="p-3.5">Destination</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Quoted Freight</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No international quotation requests found.
                </td>
              </tr>
            ) : (
              filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="p-3.5 font-mono text-xs font-bold text-white">
                    <span className="text-amber-400">{q.quoteNumber}</span>
                    <span className="block text-[10px] text-neutral-500 font-mono">
                      Order: {q.orderNumber}
                    </span>
                    <span className="block text-[9px] text-neutral-500 font-normal">
                      {new Date(q.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>

                  <td className="p-3.5 text-neutral-300">
                    <strong className="block text-white font-heading uppercase text-xs">
                      {q.fullName}
                    </strong>
                    <span className="text-[11px] text-neutral-400 block">{q.email}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{q.phone}</span>
                  </td>

                  <td className="p-3.5">
                    <span className="font-heading font-black text-xs uppercase text-white block">
                      {q.destinationCountry}
                    </span>
                    <span className="text-[11px] text-neutral-400">{q.destinationCity}</span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase tracking-wider ${
                        q.status === "QUOTED"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : q.status === "ACCEPTED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      ● {q.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-heading text-xs font-black">
                    {q.quotedAmount !== null ? (
                      <span className="text-emerald-400">
                        {q.quotedAmount.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-mono text-[11px]">Unquoted</span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => openQuoteModal(q)}
                      className="px-2.5 py-1 rounded bg-[#1C1C1C] hover:bg-[#252525] text-white text-[11px] font-heading font-bold uppercase tracking-wider transition-colors border border-[#2E2E2E] cursor-pointer inline-flex items-center gap-1"
                    >
                      <DollarSign className="w-3 h-3 text-[#E10600]" />
                      <span>Quote Rate</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quote Review Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#141414] border border-[#2E2E2E] rounded-lg shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div>
                <h3 className="font-heading text-base font-black uppercase text-white">
                  Dispatch Quotation: {selectedQuote.quoteNumber}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Destination: {selectedQuote.destinationCity}, {selectedQuote.destinationCountry}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
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

            {/* Requested Items Snapshot */}
            <div className="space-y-2">
              <span className="text-[10px] font-heading font-black uppercase tracking-wider text-neutral-400 block">
                Requested Machines Snapshot
              </span>
              <div className="p-3 rounded bg-[#1C1C1C] border border-[#262626] space-y-1.5 text-xs">
                {Array.isArray(selectedQuote.requestedItems) ? (
                  selectedQuote.requestedItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="text-white font-heading uppercase">{item.title}</span>
                      <span className="font-mono text-neutral-400">Qty: {item.quantity}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-neutral-500 text-[11px]">Showroom model request</span>
                )}

                {selectedQuote.customerNotes && (
                  <div className="pt-2 border-t border-[#262626] text-[11px] text-neutral-400">
                    <strong className="text-neutral-300">Customer Logistics Notes:</strong>{" "}
                    {selectedQuote.customerNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveQuote} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  Quoted Freight & Customs Amount (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 950.00"
                  value={quotedAmountInput}
                  onChange={(e) => setQuotedAmountInput(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono text-sm font-bold focus:outline-none focus:border-[#E10600]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  Quotation Status
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as QuoteStatus)}
                  className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600] font-heading font-bold"
                >
                  <option value={QuoteStatus.REVIEWING}>REVIEWING (Under Carrier Analysis)</option>
                  <option value={QuoteStatus.QUOTED}>QUOTED (Dispatched to Customer)</option>
                  <option value={QuoteStatus.ACCEPTED}>ACCEPTED (Confirmed by Client)</option>
                  <option value={QuoteStatus.REJECTED}>REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                  Logistics & Packaging Instructions
                </label>
                <textarea
                  rows={2}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                />
              </div>

              <div className="pt-3 border-t border-[#262626] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="px-4 py-2 rounded border border-[#2E2E2E] hover:bg-[#1C1C1C] text-neutral-300 text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Updating Quote..." : "Save & Issue Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
