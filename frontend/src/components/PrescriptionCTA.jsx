import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  UploadCloud, 
  ClipboardCheck, 
  Truck, 
  MessageCircle,
  ShieldCheck 
} from "lucide-react";

const PrescriptionCTA = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (user) {
      navigate("/upload-prescription");
    } else {
      navigate("/login", { state: { from: "/upload-prescription" } });
    }
  };

  const steps = [
    {
      number: 1,
      title: "Upload Your Prescription",
      description: "Upload through our secure portal or send it to us via WhatsApp.",
      icon: UploadCloud,
    },
    {
      number: 2,
      title: "Pharmacist Verification",
      description: "Licensed pharmacists review the details and confirm medicine availability.",
      icon: ClipboardCheck,
    },
    {
      number: 3,
      title: "Fast Doorstep Delivery",
      description: "Medicines are packaged securely and dispatched with temperature care.",
      icon: Truck,
    },
  ];

  return (
    <section className="py-10 md:py-14 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-stretch">
          
          {/* Left Column: Step Guide */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <div className="space-y-3">
              
              <h2 className="text-[32px] font-extrabold leading-tight tracking-tight
                             text-[#1D2B5C] dark:text-zinc-100">
                Get Your Prescription Medicines in <span className="text-[#038076]">3 Simple Steps</span>
              </h2>
            </div>

            {/* List of Steps */}
            <div className="space-y-4 mt-6">
              {steps.map((step) => {
                return (
                  <div
                    key={step.number}
                    className="group flex gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4
                               transition-all duration-200
                               hover:-translate-y-0.5
                               hover:border-[#038076]/25
                               hover:bg-white
                               hover:shadow-[0_6px_20px_rgba(3,128,118,0.06)]
                               dark:border-zinc-800 dark:bg-zinc-900/60
                               dark:hover:border-[#038076]/40 dark:hover:bg-zinc-900"
                  >
                    {/* Icon container */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-xs text-[#004782] dark:bg-zinc-950 dark:border-zinc-800 dark:text-[#a4c9ff] font-extrabold text-[14px]">
                      {step.number}
                    </div>

                    {/* Step Content */}
                    <div className="text-left">
                      <h3 className="text-[14px] font-bold text-[#1D2B5C] dark:text-zinc-100 group-hover:text-[#038076] transition-colors leading-tight mb-1">
                        {step.title}
                      </h3>
                      <p className="text-[12px] leading-relaxed text-slate-500 dark:text-zinc-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Upload Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between h-full">
              
              {/* Drop-zone style zone */}
              <div className="border border-dashed border-[#038076]/30 dark:border-[#038076]/50 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center group transition-all hover:bg-slate-50 hover:border-[#038076]/65 dark:hover:bg-zinc-950/60">
                
                {/* Upload icon */}
                <div className="w-12 h-12 rounded-xl bg-[#004782]/10 dark:bg-[#004782]/20 text-[#004782] dark:text-[#a4c9ff] flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 shrink-0">
                  <UploadCloud className="w-6 h-6" />
                </div>
                
                <h3 className="text-[15px] font-extrabold text-[#1D2B5C] dark:text-zinc-100 mb-1 leading-tight">
                  Upload Prescription
                </h3>
                
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-4">
                  PNG, JPG, JPEG, PDF (Max 10 MB)
                </p>

                {/* Core Upload Button */}
                <button
                  onClick={handleUploadClick}
                  className="w-full bg-[#038076] hover:bg-[#02655f] text-white py-2.5 px-4 rounded-xl text-[13px] font-bold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Select File to Upload</span>
                </button>
              </div>

              {/* Benefit Bullets */}
              <div className="mt-4 space-y-2 border-t border-slate-50 dark:border-zinc-800/60 pt-4 text-left">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                  <span className="text-[#038076] font-extrabold text-sm">&#10003;</span>
                  <span>100% secure &amp; confidential prescription management</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                  <span className="text-[#038076] font-extrabold text-sm">&#10003;</span>
                  <span>Reviewed by certified pharmacists before checkout</span>
                </div>
              </div>

              {/* WhatsApp Option */}
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800/60 text-center">
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-2 font-medium">
                  Prefer using WhatsApp? Send prescription here:
                </p>
                <a
                  href="https://wa.me/917420909445"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 px-3.5 py-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-[12px] transition-all hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp: +91 74209 09445</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PrescriptionCTA;
