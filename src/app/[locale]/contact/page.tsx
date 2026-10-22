"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Check,
  MessageSquare,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("vehicle-quote");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-[#0B0B0B] text-white py-12 sm:py-16 border-b border-[#171717]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <span className="text-[10px] font-heading font-black uppercase tracking-widest text-[#E10600]">
                Customer Support & Quotations
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              CONTACT PRESTY MOTORS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Have questions regarding machine specifications, stock availability, bespoke international freight quotes, or showroom test rides? Our motorsport team responds within 2 hours during showroom hours.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form & Contacts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded border border-[#E2E2E2] bg-[#F5F5F5] shadow-xs">
              <div className="border-b border-[#E2E2E2] pb-4 mb-6">
                <h2 className="font-heading text-xl font-black uppercase text-[#0B0B0B]">
                  Send a Message or Quote Request
                </h2>
                <p className="text-xs text-[#737373] mt-1">
                  Fill in your details below and a sales engineer will follow up promptly.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#16803C]/10 text-[#16803C] flex items-center justify-center">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-xl font-black uppercase text-[#0B0B0B]">
                    Message Sent Successfully
                  </h3>
                  <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
                    Thank you, {name}. Your inquiry has been routed directly to our Paris sales department. We will contact you at {email || phone}.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 rounded bg-[#0B0B0B] text-white font-heading font-black text-xs uppercase tracking-wider hover:bg-[#171717] transition-colors cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Marc Dupont"
                        className="w-full h-10 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="marc@example.com"
                        className="w-full h-10 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1.5">
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full h-10 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1.5">
                        Inquiry Topic
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full h-10 px-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] font-medium cursor-pointer"
                      >
                        <option value="vehicle-quote">Vehicle Purchase & Availability</option>
                        <option value="international-freight">International Freight & Crating Quote</option>
                        <option value="test-ride">Test Ride Appointment</option>
                        <option value="after-sales">Workshop, Parts & Technical Support</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-black uppercase text-[#0B0B0B] mb-1.5">
                      Your Message or Specification Requirements *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please include details such as delivery country, specific machine models, or questions about protective equipment sizing..."
                      className="w-full p-3 text-xs bg-white border border-[#E2E2E2] rounded text-[#0B0B0B] focus:outline-hidden focus:border-[#E10600] leading-relaxed"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-700/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Transmit Message</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: Direct Channels & Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded border border-[#E2E2E2] bg-white space-y-4">
              <h3 className="font-heading text-sm font-black uppercase tracking-wider text-[#0B0B0B] border-b border-[#E2E2E2] pb-2">
                Direct Communication Channels
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#0B0B0B] text-[#E10600] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#0B0B0B] font-heading uppercase">
                      Showroom Telephone
                    </strong>
                    <span className="text-[#737373] font-mono">+33 1 45 67 89 00</span>
                    <p className="text-[10px] text-neutral-400">Tue — Sat: 9:00 - 19:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#16803C] text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#0B0B0B] font-heading uppercase">
                      WhatsApp Instant Hotline
                    </strong>
                    <span className="text-[#737373] font-mono">+33 6 12 34 56 78</span>
                    <p className="text-[10px] text-neutral-400">Direct photos & walkaround videos</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#0B0B0B] text-[#E10600] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-[#0B0B0B] font-heading uppercase">
                      Sales & Export Department
                    </strong>
                    <span className="text-[#737373]">contact@presty-motors.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded border border-[#E2E2E2] bg-white space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E10600]" />
                <h3 className="font-heading text-sm font-black uppercase text-[#0B0B0B]">
                  Paris Flagship Showroom
                </h3>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                128 Avenue des Sports Motorisés<br />
                75016 Paris, France
              </p>
              <div className="pt-2 border-t border-[#E2E2E2] text-xs text-[#737373]">
                <strong className="text-[#0B0B0B] block font-heading uppercase">Showroom Hours:</strong>
                Tuesday to Saturday: 9:00 AM — 7:00 PM<br />
                Sunday & Monday: Closed
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
