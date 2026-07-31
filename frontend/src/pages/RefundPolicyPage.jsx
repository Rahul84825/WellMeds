import React from "react";
import SEO from "../components/common/SEO";
import { RotateCcw, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const RefundPolicyPage = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Refund & Cancellation Policy", url: "/refund-policy" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <SEO
        title="Refund & Cancellation Policy | WellMeds"
        description="Learn about WellMeds hassle-free refund process, medicine return criteria, damaged shipment policies, and 100% money-back guarantee terms."
        canonical="/refund-policy"
        breadcrumbs={breadcrumbs}
      />

      <section className="bg-[#172b26] text-white py-14 px-4 border-b border-[#26453d]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#203a34] text-[#84d6b9] text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-[#2e5249]">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Customer Protection & Money-Back Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Transparent, fair, and fast processing for order cancellations, returns, and refund requests.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
          
          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h2>1. Eligible Return Scenarios</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              We offer full replacement or 100% money-back refund under the following conditions:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-650 list-disc list-inside">
              <li>Item delivered was damaged, tampered, or expired.</li>
              <li>Incorrect medicine or wrong dosage delivered compared to order confirmation.</li>
              <li>Order cancelled prior to pharmacist dispatch.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2>2. Non-Returnable Products (Safety Regulations)</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              To prevent cross-contamination and ensure patient safety under Drug Control regulations, cold-chain biological products (e.g. insulin), opened seals, and unsealed surgical consumables cannot be returned once delivered intact.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <Clock className="w-5 h-5 shrink-0" />
              <h2>3. Refund Processing Timeline</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              Approved refunds are credited directly to your original payment method (UPI, Net Banking, Credit/Debit card) within <strong>3–5 business days</strong> following returned item inspection.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default RefundPolicyPage;
