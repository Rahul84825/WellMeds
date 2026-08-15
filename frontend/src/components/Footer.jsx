import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BUSINESS_INFO } from "../config/businessInfo";
import {
  ShieldCheck,
  Award,
  Thermometer,
  Clock,
  Truck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

/**
 * Footer — WellMeds Design System V2 (Editorial Identity)
 * Premium, Apple/Stripe-level specialty pharmacy footer.
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
    <footer className="w-full bg-[#172b26] text-white pt-16 pb-12 border-t border-[#26453d] transition-colors duration-300 font-sans">
      <div className="home-section-container">
        
        {/* Top Newsletter & Brand Header Block */}
        <div className="pb-12 border-b border-[#26453d] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-left">
            <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#84d6b9] uppercase mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#84d6b9]" />
              <span>WELLMEDS SPECIALTY PHARMACY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
              <span>EST. PUNE, INDIA</span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-tight mb-3">
              Precision Healthcare & Trusted Medicine Fulfillment.
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#a3c2b8] max-w-xl leading-relaxed">
              Subscribe to our clinical bulletin for therapeutic updates, chronic treatment advice, and exclusive specialty healthcare offers.
            </p>
          </div>

          {/* Newsletter Input */}
          <div className="lg:col-span-5">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#84d6b9]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#203a34] border border-[#2e5249] text-white text-xs font-clinical-mono placeholder-[#78a094] focus:outline-none focus:border-[#84d6b9] transition-colors"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-lg bg-[#157a6d] hover:bg-[#1bb09d] text-white font-clinical-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
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
            <p className="font-clinical-mono text-[10px] text-[#78a094] mt-2 text-left flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#84d6b9]" /> 100% Secure. We respect your privacy and never spam.
            </p>
          </div>
        </div>

        {/* Middle Columns Grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-left border-b border-[#26453d]">
          {/* Column 1: Brand & Operating Hours */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-editorial text-2xl font-bold text-white tracking-tight">
                Well<span className="text-[#84d6b9]">Meds</span>
              </span>
            </Link>
            
            {/* Address */}
            <div className="flex items-start gap-2 text-xs text-[#a3c2b8] leading-relaxed">
              <MapPin className="w-4 h-4 text-[#84d6b9] shrink-0 mt-0.5" />
              <span>{BUSINESS_INFO.address.shortFormatted}</span>
            </div>

            <div className="pt-2 space-y-2 font-clinical-mono text-xs text-[#d3e8e1]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#84d6b9] shrink-0" />
                <span>Phone: <strong>{BUSINESS_INFO.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#84d6b9] shrink-0" />
                <span>Email: <strong>{BUSINESS_INFO.email}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#84d6b9] shrink-0" />
                <span>Open: <strong>{BUSINESS_INFO.hoursDisplay}</strong></span>
              </div>
            </div>
          </div>

          {/* Column 2: Specialty Categories */}
          <div>
            <h4 className="font-clinical-mono text-xs font-bold uppercase tracking-widest text-[#84d6b9] mb-4">
              SPECIALTY PHARMACY
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#a3c2b8]">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Prescription Medicines
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-white transition-colors">
                  Medicine Delivery in Pune
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-white transition-colors">
                  Pharmaceutical Brands
                </Link>
              </li>
              <li>
                <Link to="/molecules" className="hover:text-white transition-colors">
                  Molecule Reference Index
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Therapeutic Categories
                </Link>
              </li>
              <li>
                <Link to="/surgical" className="hover:text-white transition-colors">
                  Surgical & Medical Supplies
                </Link>
              </li>
              <li>
                <Link to="/wellness" className="hover:text-white transition-colors">
                  Wellness & Daily Supplements
                </Link>
              </li>
              <li>
                <Link to="/upload-prescription" className="hover:text-white transition-colors text-[#84d6b9] font-semibold">
                  Upload Rx Document →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Patient Care */}
          <div>
            <h4 className="font-clinical-mono text-xs font-bold uppercase tracking-widest text-[#84d6b9] mb-4">
              PATIENT CARE & COMPANY
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#a3c2b8]">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About WellMeds
                </Link>
              </li>
              <li>
                <Link to="/how-we-keep-you-safe" className="hover:text-white transition-colors">
                  Safety & Cold-Chain Protocol
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Pharmacists
                </Link>
              </li>
              <li>
                <Link to="/patient-assistance-program" className="hover:text-white transition-colors">
                  Patient Assistance Program (PAP)
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Specialty Health Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Policies */}
          <div>
            <h4 className="font-clinical-mono text-xs font-bold uppercase tracking-widest text-[#84d6b9] mb-4">
              LEGAL & POLICIES
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#a3c2b8]">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">
                  Cold-Chain Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/how-we-keep-you-safe" className="hover:text-white transition-colors">
                  Medical & Regulatory Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Accreditation Badges */}
        <div className="py-8 border-b border-[#26453d] flex flex-wrap items-center justify-between gap-4 text-xs font-clinical-mono text-[#a3c2b8]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#84d6b9]" />
            <span>CDSCO Licensed Pharmacy</span>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[#84d6b9]" />
            <span>2–8°C Cold Chain Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#84d6b9]" />
            <span>ISO 9001:2026 Certified Facility</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#84d6b9]" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>

        {/* Bottom Medical Disclaimer & Copyright */}
        <div className="pt-8 text-left space-y-4">
          <p className="font-sans text-[11px] text-[#78a094] leading-relaxed">
            <strong>Medical Disclaimer:</strong> WellMeds operates as a licensed digital retail pharmacy. Information provided on this website is for informational and educational purposes only and is not intended as medical advice or a substitute for professional diagnosis by a qualified healthcare practitioner. Prescription medicines require a valid doctor’s prescription from a registered medical practitioner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-[11px] font-clinical-mono text-[#78a094]">
            <p>© {new Date().getFullYear()} WellMeds Healthcare Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Pune, Maharashtra, India</span>
              <span>·</span>
              <a href="#terms" className="hover:text-white transition-colors">Terms</a>
              <span>·</span>
              <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default React.memo(Footer);
