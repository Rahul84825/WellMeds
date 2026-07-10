import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  UploadCloud,
  ClipboardCheck,
  Truck,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Upload Your Prescription",
    description: "Upload through the website or share it via WhatsApp.",
    icon: UploadCloud,
    accent: "#004782",
  },
  {
    number: 2,
    title: "Pharmacist Verification",
    description: "Our licensed pharmacist reviews and confirms medicine availability.",
    icon: ClipboardCheck,
    accent: "#038076",
  },
  {
    number: 3,
    title: "Fast Delivery",
    description: "Securely packed and delivered across Pune and throughout India.",
    icon: Truck,
    accent: "#004782",
  },
];

const PrescriptionCTA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (user) navigate("/upload-prescription");
    else navigate("/login", { state: { from: "/upload-prescription" } });
  };

  return (
    <section className="py-10 md:py-14 bg-slate-50/60 dark:bg-zinc-950
                        border-y border-slate-100 dark:border-zinc-900
                        transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end
                        md:justify-between gap-3">
          <div>
            <span className="inline-block mb-2 rounded-full bg-[#004782]/10
                             px-3 py-1 text-[10px] font-bold uppercase
                             tracking-widest text-[#004782]">
              How It Works
            </span>
            <h2 className="text-[22px] font-extrabold leading-tight tracking-tight
                           text-[#1D2B5C] dark:text-zinc-100 sm:text-[26px]">
              Get Your Medicines in{" "}
              <span className="text-[#038076]">3 Simple Steps</span>
            </h2>
            <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed
                          text-slate-500 dark:text-zinc-400">
              Upload your doctor's prescription and let WellMeds handle the rest —
              fast verification and reliable delivery.
            </p>
          </div>

          <a
            href="https://wa.me/917420909445"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 self-end shrink-0
                       rounded-full border border-[#038076] px-4 py-2
                       text-[13px] font-semibold text-[#038076]
                       transition-all hover:bg-[#038076] hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp Us
          </a>
        </div>

        {/* ── Layout ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">

          {/* ── Featured card (left) — matches WhyChooseWellMeds hero card ── */}
          <div className="md:col-span-4">
            <div
              className="relative flex h-full min-h-[260px] flex-col
                         justify-between overflow-hidden rounded-2xl p-6 md:p-7"
              style={{
                background: "linear-gradient(135deg, #004782 0%, #038076 100%)",
              }}
            >
              {/* Decorative glows */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40
                              rounded-full bg-white/8 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32
                              rounded-full bg-white/6 blur-xl" />

              {/* Icon */}
              <div className="relative z-10 mb-4 flex h-11 w-11 items-center
                              justify-center rounded-xl border border-white/20
                              bg-white/15 backdrop-blur-sm">
                <UploadCloud className="h-5 w-5 text-white" />
              </div>

              {/* Text */}
              <div className="relative z-10 space-y-2">
                <h3 className="text-[18px] font-extrabold leading-tight text-white
                               sm:text-[20px]">
                  Upload Your Prescription
                </h3>
                <p className="text-[12px] leading-relaxed text-white/75">
                  Share your doctor's prescription and our licensed pharmacists
                  will handle the rest — from verification to doorstep delivery.
                </p>
              </div>

              {/* Info badge */}
              <div className="relative z-10 mt-5 flex items-center gap-3 rounded-xl
                              border border-white/15 bg-white/10 p-3.5 backdrop-blur-md">
                <ShieldCheck className="h-5 w-5 shrink-0 text-white" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white">
                    Verified by Pharmacists
                  </p>
                  <p className="text-[11px] text-white/70">
                    PNG, JPG, JPEG, PDF · Max 10 MB
                  </p>
                </div>
              </div>

              {/* Upload button */}
              <button
                onClick={handleUploadClick}
                className="relative z-10 mt-4 flex w-full cursor-pointer
                           items-center justify-center gap-2 rounded-xl
                           bg-white py-2.5 text-[13px] font-bold
                           text-[#004782] shadow-sm transition-all duration-200
                           hover:bg-white/90 active:scale-[0.98]
                           select-none"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Prescription
              </button>
            </div>
          </div>

          {/* ── Step cards (right) ── */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className="group relative flex flex-col gap-3 rounded-xl
                               border border-slate-100 bg-white p-4
                               transition-all duration-200
                               hover:-translate-y-1
                               hover:border-[#038076]/25
                               hover:shadow-[0_6px_20px_rgba(3,128,118,0.10)]
                               dark:border-zinc-800 dark:bg-zinc-900
                               dark:hover:border-[#038076]/40"
                  >
                    {/* Step number pill */}
                    <span
                      className="absolute right-3 top-3 rounded-full px-2 py-0.5
                                 text-[9px] font-bold uppercase tracking-wider"
                      style={{
                        background: `${step.accent}14`,
                        color: step.accent,
                      }}
                    >
                      Step {step.number}
                    </span>

                    {/* Icon */}
                    <div
                      className="flex h-9 w-9 items-center justify-center
                                 rounded-xl transition-transform duration-200
                                 group-hover:scale-105"
                      style={{
                        background: `${step.accent}14`,
                        color: step.accent,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Text */}
                    <div>
                      <h4 className="text-[13px] font-bold leading-snug
                                     text-[#1D2B5C] transition-colors
                                     group-hover:text-[#038076]
                                     dark:text-zinc-100">
                        {step.title}
                      </h4>
                      <p className="mt-1 text-[12px] leading-relaxed
                                    text-slate-500 dark:text-zinc-400">
                        {step.description}
                      </p>
                    </div>

                    {/* Connector arrow (between steps, hidden on last) */}
                    {step.number < steps.length && (
                      <ArrowRight
                        className="absolute -right-2.5 top-1/2 z-10 hidden
                                   -translate-y-1/2 text-slate-300
                                   sm:block dark:text-zinc-700"
                        style={{ width: 14, height: 14 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* WhatsApp help strip */}
            <div className="mt-3 flex items-center justify-between rounded-xl
                            border border-slate-100 bg-white px-4 py-3
                            dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-[12px] text-slate-500 dark:text-zinc-400">
                Need help with your prescription?
              </p>
              <a
                href="https://wa.me/917420909445"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] font-bold
                           text-[#038076] transition-colors hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5 fill-current" />
                WhatsApp Us
              </a>
            </div>
          </div>

        </div>

        {/* Mobile WhatsApp CTA */}
        <div className="mt-5 flex justify-center md:hidden">
          <a
            href="https://wa.me/917420909445"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border
                       border-[#038076] px-5 py-2.5 text-[13px] font-semibold
                       text-[#038076] transition-all hover:bg-[#038076]
                       hover:text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp Us
          </a>
        </div>

      </div>
    </section>
  );
};

export default PrescriptionCTA;