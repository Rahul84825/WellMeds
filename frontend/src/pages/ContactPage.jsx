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
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Contact Us & Store Location | WellMeds Pharmacy Baner Pune"
        description="Visit WellMeds Pharmacy at Baner, Pune or contact our registered clinical pharmacists. Toll-free support, store map, prescription inquiries."
        canonical="/contact"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        {/* ── HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <nav className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold select-none">
              <Link to="/" className="hover:text-[#157a6d]">Home</Link>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Contact Us</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>24/7 PATIENT SUPPORT & PHARMACY DESK</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                We Are Here to Help
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Have a query regarding prescriptions, cold-chain delivery, or specialized formulations? Contact our licensed medical team.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/upload-prescription"
                className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
              >
                <FileText size={15} />
                <span>Upload Prescription</span>
              </Link>
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1ebe5d] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
              >
                <MessageSquare size={15} />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── CONTACT GRID: CARDS & FORM ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Store Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 space-y-4 shadow-sm">
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

      {/* ── CONSULTATION MODAL ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default Contact;
