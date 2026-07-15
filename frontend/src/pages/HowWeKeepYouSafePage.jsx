import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  CheckCircle, 
  Snowflake, 
  Thermometer, 
  UserCheck, 
  Award, 
  Lock, 
  Package, 
  MessageSquare, 
  Phone,
  ArrowRight,
  ShieldAlert
} from "lucide-react";

const HowWeKeepYouSafePage = () => {
  // SEO Setup
  useEffect(() => {
    document.title = "How We Keep You Safe | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Learn about WellMeds' safety procedures. From cold-chain shipping and verified sourcing to licensed pharmacist reviews, we ensure your medicines are 100% authentic and safe.");
  }, []);

  return (
    <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] space-y-xxl text-left">
      
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#e6f7f0] via-[#edf8f5] to-[#f7f9fb] dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border border-[#c3efdb] dark:border-zinc-800 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="space-y-md max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container border border-primary/20 px-md py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Patient Safety First
          </span>
          <h1 className="font-headline-lg text-headline-lg md:text-5xl font-bold text-primary dark:text-primary-fixed-dim leading-tight">
            How We Keep You Safe
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant leading-relaxed">
            Every medicine delivered with authenticity, safety, privacy and pharmacist care. At WellMeds, you're not just ordering a product — you're trusting us with medicines that keep you or someone you love alive. We built our entire process around that responsibility.
          </p>
        </div>
        
        {/* Premium Illustration/Icon Section */}
        <div className="flex-shrink-0 w-32 h-32 md:w-44 md:h-44 rounded-full bg-white dark:bg-zinc-900 border border-teal-100 dark:border-zinc-855 flex items-center justify-center shadow-lg relative animate-[float_4s_ease-in-out_infinite]">
          <div className="absolute inset-2 rounded-full border border-dashed border-teal-200 dark:border-zinc-800 animate-[spin_20s_linear_infinite]" />
          <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-[#028076] dark:text-[#00c49f] relative z-10" />
        </div>
      </section>

      {/* Grid: Pillars Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg pt-lg">
        
        {/* Section 1: Every Medicine Verified at the Source */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm transition-all duration-355 hover:shadow-md">
          <div className="w-12 h-12 bg-primary-fixed text-primary rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-[#028076]" />
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">1. Every Medicine, Verified at the Source</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
            We source directly from licensed manufacturers and authorized distributors — never from the gray market, never from unverified third-party sellers.
          </p>
          <ul className="space-y-sm pt-xs">
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-[#028076] mt-2 flex-shrink-0" />
              <span>Every batch is checked against manufacturer records before it reaches our warehouse</span>
            </li>
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-[#028076] mt-2 flex-shrink-0" />
              <span>No medicine leaves our facility without a verified batch and expiry check</span>
            </li>
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-[#028076] mt-2 flex-shrink-0" />
              <span className="font-medium text-slate-700 dark:text-zinc-300">Scan the QR code on your strip to verify authenticity instantly</span>
            </li>
          </ul>
        </section>

        {/* Section 2: Cold-Chain Protection */}
        <section className="bg-[#f0f9ff] dark:bg-zinc-900 border border-[#bae6fd] dark:border-zinc-800 rounded-xl p-lg space-y-md shadow-sm transition-all duration-355 hover:shadow-md">
          <div className="w-12 h-12 bg-[#e0f2fe] dark:bg-zinc-800 text-[#0284c7] rounded-full flex items-center justify-center">
            <Snowflake className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
            2. Cold-Chain Protection
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#0284c7] text-white rounded">Critical Care</span>
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
            Insulin, biologics, and GLP-1 injections lose effectiveness — or become unsafe — if they're exposed to the wrong temperature, even briefly.
          </p>
          <ul className="space-y-sm pt-xs">
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <Thermometer className="w-4 h-4 text-[#0284c7] mt-0.5 flex-shrink-0" />
              <span className="font-semibold text-slate-850 dark:text-zinc-200">Stored strictly at 2–8°C from warehouse to your doorstep</span>
            </li>
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <Thermometer className="w-4 h-4 text-[#0284c7] mt-0.5 flex-shrink-0" />
              <span>Delivered in insulated, temperature-monitored premium packaging</span>
            </li>
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <Thermometer className="w-4 h-4 text-[#0284c7] mt-0.5 flex-shrink-0" />
              <span>Real-time tracking so you always know your medicine is on its way, safely</span>
            </li>
          </ul>
        </section>

        {/* Section 3: Prescription Verification */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm transition-all duration-355 hover:shadow-md">
          <div className="w-12 h-12 bg-secondary-fixed text-secondary rounded-full flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-[#086b53]" />
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">3. Every Prescription, Checked by a Pharmacist</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
            We don't just accept an upload and ship. A licensed clinical pharmacist reviews every prescription-only order before it's dispatched.
          </p>
          <ul className="space-y-sm pt-xs">
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-[#086b53] mt-2 flex-shrink-0" />
              <span>Confirms the prescription is valid and matches your order</span>
            </li>
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-[#086b53] mt-2 flex-shrink-0" />
              <span>Flags any drug-to-drug interactions or dosage concerns</span>
            </li>
            <li className="flex items-start gap-2.5 text-body-sm text-on-surface-variant dark:text-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-[#086b53] mt-2 flex-shrink-0" />
              <span className="font-medium text-slate-700 dark:text-zinc-300">Reachable directly if you have questions — before or after you order</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Licensed & Compliant */}
        <section className="bg-[#fefce8] dark:bg-zinc-900 border border-[#fef08a] dark:border-zinc-800 rounded-xl p-lg space-y-md shadow-sm transition-all duration-355 hover:shadow-md flex flex-col justify-between">
          <div className="space-y-md">
            <div className="w-12 h-12 bg-[#fef9c3] dark:bg-zinc-850 text-[#854d0e] rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-[#d97706]" />
            </div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">4. Licensed & Compliant, Always</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
              WellMeds operates under official retail pharmacy licensing regulations and follows all applicable regulations under the Drugs and Cosmetics Act.
            </p>
          </div>
          
          {/* License Certificate Box Placeholder */}
          <div className="mt-4 p-4 rounded-xl bg-white/95 dark:bg-zinc-950/80 border border-[#fef08a]/80 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-[#fef9c3]/50 dark:bg-zinc-900 text-[#a16207]">
              <Award className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">Pharmacy License Verification</h4>
              <p className="text-[11px] text-[#854d0e] dark:text-zinc-400 font-medium">License No: DL-12345/A-B &amp; DL-67890/C-D</p>
              <div className="mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active &amp; Compliant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Packaging & Privacy */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm transition-all duration-355 hover:shadow-md">
          <div className="w-12 h-12 bg-primary-fixed text-primary rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-[#028076]" />
          </div>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">5. Packaging Built for Care — and Privacy</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
            Every shipment is prepared under clean rooms following exact protocols, keeping safety and patient privacy at the core.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <ShieldAlert className="w-5 h-5 text-[#028076] mb-1.5" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Tamper-Evident</h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Sealed security bags prevent transit interference.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <UserCheck className="w-5 h-5 text-[#028076] mb-1.5" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Safe Handling</h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Delivery agents certified to carry medical goods.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
              <Lock className="w-5 h-5 text-[#028076] mb-1.5" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">Discreet Shipping</h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">Unmarked boxes for highly sensitive therapies.</p>
            </div>
          </div>
        </section>

        {/* Section 6: Data Privacy */}
        <section className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg space-y-md shadow-sm transition-all duration-355 hover:shadow-md flex flex-col justify-between">
          <div className="space-y-md">
            <div className="w-12 h-12 bg-secondary-fixed text-secondary rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#086b53]" />
            </div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">6. Your Health Data Stays Yours</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
              Your prescriptions and clinical information are used only to fulfill your orders and provide pharmacy care-related support. We do not sell, rent, or share your medical data with third parties for marketing purposes.
            </p>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-slate-100/60 dark:bg-zinc-900/60 text-xs text-slate-500 dark:text-zinc-400 border border-slate-200/50 dark:border-zinc-800 text-center font-medium">
            🔒 Fully encrypted database compliant with healthcare privacy guidelines.
          </div>
        </section>
        
      </div>

      {/* Section 7: Talk to a Pharmacist (CTA Block) */}
      <section className="rounded-2xl bg-gradient-to-r from-[#038076] to-[#02655f] dark:from-zinc-900 dark:to-zinc-950 text-white p-8 md:p-12 text-center space-y-md shadow-md">
        <h2 className="font-headline-lg text-headline-lg md:text-4xl font-bold">Talk to a Certified Pharmacist</h2>
        <p className="max-w-2xl mx-auto text-sm md:text-base text-teal-100/90 leading-relaxed font-sans">
          Every order is backed by a real clinical pharmacist you can consult before you order, if you're unsure what you need, or after, to clarify dosage or storage guidelines.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-sm">
          <a
            href="https://wa.me/919511289914"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] active:scale-98 transition-all duration-200 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-sm"
          >
            <Phone className="w-4 h-4" />
            Talk to Pharmacist
          </a>
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border border-white/35 hover:border-white/60 active:scale-98 transition-all duration-200 px-6 py-3 rounded-xl font-bold text-sm text-white"
          >
            <MessageSquare className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
        <p className="text-[11px] text-teal-200/70 pt-xs">
          Have a question about how we handle your medicine? Reach out — we're here to help.
        </p>
      </section>

    </div>
  );
};

export default HowWeKeepYouSafePage;
