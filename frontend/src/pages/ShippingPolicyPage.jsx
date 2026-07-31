import React from "react";
import SEO from "../components/common/SEO";
import { Truck, Thermometer, ShieldCheck, MapPin } from "lucide-react";

const ShippingPolicyPage = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Shipping & Delivery Policy", url: "/shipping-policy" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <SEO
        title="Shipping & Delivery Policy | Cold-Chain Transit"
        description="WellMeds shipping rates, express medicine delivery timelines across Pune, Maharashtra, and pan-India cold-chain logistics."
        canonical="/shipping-policy"
        breadcrumbs={breadcrumbs}
      />

      <section className="bg-[#172b26] text-white py-14 px-4 border-b border-[#26453d]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#203a34] text-[#84d6b9] text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-[#2e5249]">
            <Truck className="w-3.5 h-3.5" />
            <span>Temperature-Controlled Cold-Chain Fulfillment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Reliable, safe, and expedited medicine delivery directly to your home or healthcare facility.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
          
          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <MapPin className="w-5 h-5 shrink-0" />
              <h2>1. Delivery Coverage & Express Slots</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              We offer express same-day and 24-hour priority medicine delivery across Pune city (Baner, Aundh, Wakad, Kothrud, Hinjawadi, Viman Nagar) and 2–4 day express courier service across all pin codes in India.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <Thermometer className="w-5 h-5 shrink-0" />
              <h2>2. Cold-Chain Biological Transit (2°C – 8°C)</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              Biological medicines, insulin, monoclonal antibodies, and vaccines are dispatched in insulated thermal boxes with calibrated gel ice packs, guaranteeing temperature integrity during the entire transit window.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h2>3. Order Tracking & Verification</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              Upon pharmacist approval, a real-time tracking link with live dispatch status is dispatched via SMS and WhatsApp.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default ShippingPolicyPage;
