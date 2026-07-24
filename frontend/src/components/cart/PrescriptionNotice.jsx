import React from "react";
import { FileText, ShieldCheck, Clock, CheckCircle, ArrowRight } from "lucide-react";

const PrescriptionNotice = ({ rxItemCount = 0, onUploadClick = null }) => {
  if (rxItemCount <= 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-teal-500/10 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-5 shadow-xs mb-6 text-left animate-[fade-in_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left Side: Icon & Explanation */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <FileText size={22} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                Prescription Required for {rxItemCount} {rxItemCount === 1 ? "Item" : "Items"}
              </h4>
              <span className="bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Law Compliant
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
              Don't worry! You can easily upload your doctor's prescription during the next checkout step. Our licensed pharmacists will verify it before dispatch.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-zinc-400 font-semibold pt-1">
              <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300">
                <ShieldCheck size={13} /> 100% Pharmacist Verified
              </span>
              <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300">
                <Clock size={13} /> Avg Verification: 15–30 Mins
              </span>
            </div>
          </div>
        </div>

        {/* Optional Action Button */}
        {onUploadClick && (
          <button
            type="button"
            onClick={onUploadClick}
            className="shrink-0 bg-[#02665e] hover:bg-[#014d47] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>Upload Now</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PrescriptionNotice;
