import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import SEO from "../components/common/SEO";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";
import { Sparkles, Phone, FileText, ChevronRight, Mail, MapPin, Clock, Send, MessageSquare } from "lucide-react";

const wellmedsStoreData = {
  name: BUSINESS_INFO.legalName,
  address: BUSINESS_INFO.address.street,
  city: BUSINESS_INFO.address.city,
  state: BUSINESS_INFO.address.state,
  pincode: BUSINESS_INFO.address.postalCode,
  country: BUSINESS_INFO.address.country,
  phone: BUSINESS_INFO.phone,
  email: BUSINESS_INFO.email,
  workingHours: BUSINESS_INFO.hours,
};

const Contact = () => {
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Support");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      return;
    }

    setSubmitted(true);
    try {
      await api.submitContactForm({ name, email, subject, message });
      setName("");
      setEmail("");
      setSubject("Support");
      setMessage("");
    } catch (err) {
      console.warn("Failed to submit contact inquiry:", err.message);
    } finally {
      setSubmitted(false);
    }
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Contact WellMeds | Licensed Pharmacy Support & Helpdesk"
        description="Get in touch with WellMeds licensed pharmacists. 24/7 patient support, prescription consultation, cold-chain delivery inquiries, and pharmacy desk."
        canonical="/contact"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Contact Us
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── CONTACT GRID: CARDS & FORM ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Store Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center border border-emerald-200 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#172b26] dark:text-white">Store Address</h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">{wellmedsStoreData.address}, {wellmedsStoreData.city}, {wellmedsStoreData.state} {wellmedsStoreData.pincode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center border border-emerald-200 shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#172b26] dark:text-white">Phone Support</h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">{wellmedsStoreData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center border border-emerald-200 shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#172b26] dark:text-white">Email Inquiries</h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">{wellmedsStoreData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-2xl bg-[#f4f9f7] text-[#157a6d] flex items-center justify-center border border-emerald-200 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#172b26] dark:text-white">Working Hours</h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">{wellmedsStoreData.workingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-[#f4f9f7] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#172b26] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@domain.com"
                    className="w-full bg-[#f4f9f7] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#172b26] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#f4f9f7] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#172b26] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d]"
                >
                  <option value="Support">Prescription & Order Inquiry</option>
                  <option value="Imported Medicine">Imported Medicine Request</option>
                  <option value="Doctor Consultation">Pharmacist Consultation</option>
                  <option value="Feedback">Feedback & Suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">Your Message *</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Describe your query in detail..."
                  className="w-full bg-[#f4f9f7] dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-xs text-[#172b26] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#157a6d]"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-8 py-3 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer disabled:opacity-50"
              >
                <Send size={15} />
                <span>{submitted ? "Sending..." : "Submit Inquiry"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ── WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
        </div>
      </div>

      {/* ── CONSULTATION MODAL ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default Contact;
