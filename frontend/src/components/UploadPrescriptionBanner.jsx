import React from "react";
import { Link } from "react-router-dom";
import {
  FileUp,
  ShieldCheck,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Truck,
  Lock,
  Clock,
} from "lucide-react";

/**
 * UploadPrescriptionBanner — WellMeds Design System V2
 * Pure UI Editorial Prescription Pad Banner (Image-free UI component).
 */
const UploadPrescriptionBanner = () => {
  return (
    <section className="py-6 md:py-8 w-full">
      <div className="home-section-container">
        <Link
          to="/upload-prescription"
          className="group relative block rounded-2xl bg-[#ffffff] dark:bg-zinc-900 border border-[#dde8e3] dark:border-zinc-800 p-6 md:p-10 overflow-hidden hover:border-[#157a6d]/60 shadow-[0_12px_36px_rgba(23,43,38,0.06)] transition-all duration-300"
        >
          {/* Paper texture & soft mint ambient background */}
          <div className="absolute inset-0 bg-[#f4f9f7] dark:bg-zinc-950 opacity-70 group-hover:opacity-90 transition-opacity" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Copy */}
            <div className="lg:col-span-7 text-left space-y-4">
              <div className="font-clinical-mono text-xs font-semibold tracking-widest text-[#157a6d] uppercase flex items-center gap-2">
                <FileUp className="w-4 h-4 text-[#157a6d]" />
                <span>EXPRESS RX SERVICE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#b08d3e]" />
                <span>24/7 PHARMACIST REVIEW</span>
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight">
                Upload Your Prescription. <br className="hidden sm:inline" />
                We’ll Handle the Rest.
              </h2>

              <p className="font-sans text-xs sm:text-sm text-[#3f544d] dark:text-zinc-400 leading-relaxed max-w-xl">
                Upload your doctor’s note or Rx slip. Our certified pharmacists will verify your dosage, check therapeutic interactions, and dispatch authentic medicines directly to your door.
              </p>

              {/* Step Pills */}
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-lg">
                <div className="flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-800 border border-[#c3d4cc] dark:border-zinc-700 px-2 py-1.5 rounded-lg shadow-2xs">
                  <span className="font-clinical-mono text-xs font-bold text-[#157a6d]">01</span>
                  <span className="font-sans text-[11px] font-medium text-[#172b26] dark:text-zinc-200 truncate">Upload Rx</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-800 border border-[#c3d4cc] dark:border-zinc-700 px-2 py-1.5 rounded-lg shadow-2xs">
                  <span className="font-clinical-mono text-xs font-bold text-[#157a6d]">02</span>
                  <span className="font-sans text-[11px] font-medium text-[#172b26] dark:text-zinc-200 truncate">Rx Review</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-800 border border-[#c3d4cc] dark:border-zinc-700 px-2 py-1.5 rounded-lg shadow-2xs">
                  <span className="font-clinical-mono text-xs font-bold text-[#157a6d]">03</span>
                  <span className="font-sans text-[11px] font-medium text-[#172b26] dark:text-zinc-200 truncate">Fast Delivery</span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#157a6d] group-hover:bg-[#0f6157] text-white font-clinical-mono text-xs font-bold uppercase tracking-wider shadow-sm transition-all">
                  <span>UPLOAD PRESCRIPTION</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Right Column: Pure UI Editorial Prescription Workflow Card (No Image) */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-zinc-900 border border-[#c3d4cc] dark:border-zinc-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4 text-left relative overflow-hidden group-hover:border-[#157a6d]/40 transition-colors">
                
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-dashed border-[#c3d4cc] dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-editorial text-xl font-bold text-[#157a6d]">Rx</span>
                    <span className="font-clinical-mono text-[10px] font-bold text-[#5f776e] uppercase tracking-widest">
                      DIGITAL FULFILLMENT SLIP
                    </span>
                  </div>
                  <span className="font-clinical-mono text-[9px] font-bold text-[#157a6d] bg-[#e7f0ea] dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">
                    INSTANT REVIEW
                  </span>
                </div>

                {/* Workflow Steps */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#f4f9f7] dark:bg-zinc-950 border border-[#dde8e3] dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-md bg-[#157a6d] text-white flex items-center justify-center shrink-0">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-clinical-mono text-xs font-bold text-[#172b26] dark:text-zinc-100">
                        1. Upload PDF or Photo
                      </p>
                      <p className="font-sans text-[11px] text-[#5f776e] dark:text-zinc-400">
                        Supports JPG, PNG, or PDF files.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#f4f9f7] dark:bg-zinc-950 border border-[#dde8e3] dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-md bg-[#157a6d] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-clinical-mono text-xs font-bold text-[#172b26] dark:text-zinc-100">
                        2. Certified Pharmacist Check
                      </p>
                      <p className="font-sans text-[11px] text-[#5f776e] dark:text-zinc-400">
                        We verify dosage & insurance discounts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#f4f9f7] dark:bg-zinc-950 border border-[#dde8e3] dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-md bg-[#157a6d] text-white flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-clinical-mono text-xs font-bold text-[#172b26] dark:text-zinc-100">
                        3. Express Doorstep Dispatch
                      </p>
                      <p className="font-sans text-[11px] text-[#5f776e] dark:text-zinc-400">
                        Cold-chain sealed and trackable delivery.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Security Badge */}
                <div className="pt-2 border-t border-dashed border-[#c3d4cc] dark:border-zinc-800 flex items-center justify-between text-[10px] font-clinical-mono text-[#5f776e]">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#157a6d]" /> 256-Bit SSL Encrypted
                  </span>
                  <span>CDSCO Compliant</span>
                </div>

              </div>
            </div>

          </div>
        </Link>
      </div>
    </section>
  );
};

export default React.memo(UploadPrescriptionBanner);
