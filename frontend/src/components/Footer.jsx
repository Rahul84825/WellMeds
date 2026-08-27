import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";
import {
  ShieldCheck,
  Award,
  Thermometer,
  Clock,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
  Building2,
  FileBadge,
  UserCheck,
  MessageCircle,
  Pill,
  Sparkles,
  ChevronRight,
} from "lucide-react";

/**
 * Footer Component — Truemeds & PlatinumRx Inspired Design
 * - Aesthetic: Calming Pastel Green Background (#edf7f2)
 * - Typography: Sharp Black (#111827 / #0f172a) Modern Sans-Serif (Plus Jakarta Sans / Inter)
 * - Comprehensive multi-column hierarchy, regulatory licenses, customer contacts & newsletter
 */
const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      return;
    }
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="w-full bg-[#edf7f2] dark:bg-[#0c1613] text-slate-900 dark:text-zinc-100 border-t border-[#c6e6d8] dark:border-[#1c322b] transition-colors duration-300 font-sans">
      
      {/* 1. TOP QUICK CATEGORY DISCOVERY BAR (PlatinumRx Style) */}
      <div className="border-b border-[#d2ebdf] dark:border-[#182a24] bg-[#e4f3eb] dark:bg-[#0f1d18] py-4">
        <div className="home-section-container">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-4 h-4 text-[#038076] dark:text-[#84d6b9]" />
              <span>POPULAR CATEGORIES:</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-800 dark:text-zinc-300 font-medium">
              <Link to="/products?category=Prescription" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                All Medicines
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/brands" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                All Brands
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/molecules" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                Molecules Index
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/categories" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                Therapeutic Conditions
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/surgical" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                Surgical & Devices
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/wellness" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                Wellness & Supplements
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/patient-assistance-program" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                Patient Assistance (PAP)
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/health-library" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                Health Library
              </Link>
              <span className="text-[#a4d4c2] dark:text-zinc-700">|</span>
              <Link to="/delivery" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors font-semibold text-[#038076] dark:text-[#84d6b9]">
                Express Delivery in Pune →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT CONTAINER */}
      <div className="home-section-container pt-12 pb-8">
        
        {/* Top Newsletter & Brand Value Proposition Banner (Truemeds Style) */}
        <div className="pb-10 border-b border-[#c8e6d9] dark:border-[#1a2e28] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 bg-[#d7efe3] dark:bg-[#132822] text-[#038076] dark:text-[#84d6b9] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-[#bfe3d1] dark:border-[#1d3d34]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WELLMEDS PRECISION SPECIALTY PHARMACY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#038076]" />
              <span>EST. PUNE, INDIA</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2 tracking-tight">
              Precision Healthcare & Trusted Medicine Fulfillment.
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 max-w-xl leading-relaxed font-normal">
              Claim your complimentary health bulletin subscription for therapeutic clinical updates, chronic disease management tips, and exclusive specialty healthcare offers.
            </p>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email ID..."
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-white dark:bg-[#12201b] border border-[#b8dfce] dark:border-[#233f36] text-slate-900 dark:text-white text-xs font-medium placeholder-slate-500 dark:placeholder-zinc-500 focus:outline-none focus:border-[#038076] focus:ring-1 focus:ring-[#038076] transition-all shadow-sm"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-6 rounded-lg bg-[#038076] hover:bg-[#02635c] active:bg-[#014d47] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SUBSCRIBED</span>
                  </>
                ) : (
                  <>
                    <span>SUBSCRIBE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-2 text-left flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3 text-[#038076] dark:text-[#84d6b9]" /> 100% Secure. We respect your medical privacy and never spam.
            </p>
          </div>
        </div>

        {/* 3. MULTI-COLUMN NAVIGATION GRID */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left border-b border-[#c8e6d9] dark:border-[#1a2e28]">
          
          {/* Column 1: Company & Mission */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Well<span className="text-[#038076] dark:text-[#84d6b9]">Meds</span>
              </span>
            </Link>
            
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              India’s trusted digital specialty pharmacy delivering authentic prescription medicines, cold-chain biologicals, oncology treatments, and surgical supplies with guaranteed precision.
            </p>
          </div>

          {/* Column 2: Specialty Pharmacy */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[#038076] dark:text-[#84d6b9]" />
              <span>SPECIALTY PHARMACY</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-800 dark:text-zinc-200">
              <li>
                <Link to="/products" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  All Prescription Medicines
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Medicine Delivery in Pune
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Pharmaceutical Brands
                </Link>
              </li>
              <li>
                <Link to="/molecules" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Molecule Reference Index
                </Link>
              </li>
              <li>
                <Link to="/surgical" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Surgical & Hospital Supplies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Services */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#038076] dark:text-[#84d6b9]" />
              <span>HELP & ASSISTANCE</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-800 dark:text-zinc-200">
              <li>
                <Link to="/upload-prescription" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Upload Doctor's Prescription
                </Link>
              </li>
              <li>
                <Link to="/patient-assistance-program" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Patient Assistance Program (PAP)
                </Link>
              </li>
              <li>
                <Link to="/health-library" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors font-semibold">
                  Clinical Health Library
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  About WellMeds Pharmacy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Contact Pharmacists
                </Link>
              </li>
              <li>
                <a
                  href={getWhatsAppLink("Hello WellMeds, I need assistance.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors text-[#038076] dark:text-[#84d6b9] font-bold"
                >
                  WhatsApp Pharmacist Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policies */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#038076] dark:text-[#84d6b9]" />
              <span>LEGAL & POLICIES</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-800 dark:text-zinc-200">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Cold-Chain Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors">
                  Grievance Redressal
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. BUSINESS & REGISTERED ADDRESS */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-b border-[#c8e6d9] dark:border-[#1a2e28]">
          
          {/* Contacts */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              CONTACTS
            </h5>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              Need Help? Our Customer care is just a message away — Available daily from <strong>8:00 AM - 11:00 PM</strong>
            </p>
            <div className="pt-1 text-xs text-slate-900 dark:text-zinc-100 font-semibold space-y-1">
              <p>Email: <a href={`mailto:${BUSINESS_INFO.email}`} className="text-[#038076] hover:underline">{BUSINESS_INFO.email}</a></p>
              <p>Phone: <a href={`tel:${BUSINESS_INFO.phoneRaw}`} className="text-[#038076] hover:underline">{BUSINESS_INFO.phoneDisplay}</a></p>
            </div>
          </div>

          {/* Registered Office Address */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              REGISTERED OFFICE ADDRESS
            </h5>
            <p className="text-xs text-slate-900 dark:text-zinc-100 font-bold">
              WellMeds Healthcare Technologies Pvt. Ltd.
            </p>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              {BUSINESS_INFO.address.shortFormatted}
            </p>
          </div>

        </div>

        {/* 5. TRUST ACCREDITATIONS & SECURITY BADGES */}
        <div className="py-6 border-b border-[#c8e6d9] dark:border-[#1a2e28] flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-800 dark:text-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#038076]/15 flex items-center justify-center text-[#038076] dark:text-[#84d6b9]">
              <Thermometer className="w-4 h-4" />
            </div>
            <span>2–8°C Cold Chain Verified Packaging</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#038076]/15 flex items-center justify-center text-[#038076] dark:text-[#84d6b9]">
              <Award className="w-4 h-4" />
            </div>
            <span>ISO 9001:2026 Certified Facility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#038076]/15 flex items-center justify-center text-[#038076] dark:text-[#84d6b9]">
              <Lock className="w-4 h-4" />
            </div>
            <span>256-Bit SSL Encrypted & HIPAA Compliant</span>
          </div>
        </div>

        {/* 6. BOTTOM MEDICAL DISCLAIMER & COPYRIGHT */}
        <div className="pt-6 text-left space-y-3">
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
            <strong className="text-slate-900 dark:text-white font-semibold">Medical Disclaimer:</strong> WellMeds operates as a licensed digital retail pharmacy. Information provided on this platform is for informational and educational purposes only and is not intended as medical advice or a substitute for professional diagnosis, counsel, or treatment by a qualified healthcare practitioner. Prescription medicines (Schedule H, H1, and X) require a valid doctor’s prescription from a registered medical practitioner in India.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-slate-700 dark:text-zinc-300 font-medium">
            <p>© {new Date().getFullYear()} WellMeds Healthcare Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span>Baner, Pune, Maharashtra, India</span>
              <span>·</span>
              <Link to="/terms-and-conditions" className="hover:text-[#038076] transition-colors">Terms of Service</Link>
              <span>·</span>
              <Link to="/privacy-policy" className="hover:text-[#038076] transition-colors">Privacy Policy</Link>
              <span>·</span>
              <Link to="/refund-policy" className="hover:text-[#038076] transition-colors">Refunds</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default React.memo(Footer);
