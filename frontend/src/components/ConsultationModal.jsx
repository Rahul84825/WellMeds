import React, { useState } from "react";
import { Stethoscope, ShieldCheck, HeartPulse } from "lucide-react";
import Modal from "./Modal";

import { toast } from "sonner";

export const ConsultationModal = ({ isOpen, onClose }) => {
  const [queryType, setQueryType] = useState("dosage");

  const handleSubmit = () => {
    toast.success("Consultation request sent! A licensed pharmacist will reach out to you shortly.");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Pharmacist Consultation"
      maxWidth="max-w-md"
    >
      <div className="space-y-lg text-left animate-[fade-in_0.2s_ease-out]">
        
        {/* Doctor / Pharmacist Profile Card */}
        <div className="flex items-center gap-md bg-slate-50 dark:bg-zinc-800/50 p-md rounded-2xl border border-slate-100 dark:border-zinc-800">
          <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-outline-variant shrink-0">
            <img
              alt="Dr. Claire Wilson"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxr9a9BZ7uZjIAgex8m212dSE8oZZ378LNCU61QGXYiMVdzxsG7VdTm6Rz8IBPUYF4QDggHvH8mNE7T9JJ0xU_KRS4rGJxd9ALF41K5WOQ10jORgrxEpdL3g31lRZ4h2wVw90K3eRqgUj81M3CfGZnZlmZx_lCfqZQh1zFwQZ0QwJ_RJ4cgnuvYFdI8p6wrgDYk84FNG-ScPB4TEzFpsIfMP-cwpsWk1DJbBYIUlwY0vXhXeVslg_ayRcNmBJONkn4LOG2mm31M7fi"
              className="w-full h-full object-cover"
            />
            {/* Active Status Badge */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-xs">
              <p className="font-label-md text-label-md font-bold text-on-surface">Dr. Claire Wilson, PharmD</p>
              <ShieldCheck size={14} className="text-secondary" />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Lic No: PHA-9921 • 8+ Yrs Exp</p>
            <p className="text-[11px] text-secondary font-bold flex items-center gap-xs mt-0.5">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Online & Ready to Consult
            </p>
          </div>
        </div>

        {/* Informative Pitch */}
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Need clinical advice on medicine dosage, potential drug interactions, storage guidelines, or finding generic alternatives? Let us know below, and our pharmacist will contact you in minutes.
        </p>

        {/* Dynamic Consultation Form */}
        <div className="space-y-md">
          
          {/* Dropdown Choice */}
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Reason for Consultation</label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              className="w-full p-md bg-white dark:bg-zinc-900 border border-outline-variant rounded-xl font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-[#004782] outline-none transition-all"
            >
              <option value="dosage">Dosage & Directions of Use</option>
              <option value="interactions">Drug Interactions & Allergies</option>
              <option value="alternatives">Generic Drug Alternatives</option>
              <option value="prescription">Prescription Reading & Clarifications</option>
              <option value="other">Other Health Concerns</option>
            </select>
          </div>

          {/* Message Content */}
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Brief Description of Concern</label>
            <textarea
              placeholder="Describe your query in detail (e.g. current symptoms, alternative drug names, dosages)..."
              rows={4}
              className="w-full p-md bg-white dark:bg-zinc-900 border border-outline-variant rounded-xl font-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-[#004782] outline-none transition-all"
            />
          </div>

        </div>

        {/* HIPAA/Privacy Assurance Banner */}
        <div className="flex items-center gap-sm bg-[#004782]/5 dark:bg-[#004782]/10 p-sm rounded-xl border border-[#004782]/10">
          <HeartPulse size={16} className="text-[#004782] dark:text-primary-fixed-dim" />
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-normal">
            Your clinical consultation is encrypted and secure. All details are kept confidential under clinical confidentiality standards.
          </p>
        </div>

        {/* Submit Action */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#004782] hover:bg-[#003c70] text-white py-sm rounded-xl font-label-md text-label-md font-bold hover:shadow-md active:scale-98 transition-all"
        >
          Book Consultation
        </button>

      </div>
    </Modal>
  );
};

export default ConsultationModal;
