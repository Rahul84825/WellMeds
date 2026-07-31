import React from "react";
import SEO from "../components/common/SEO";
import { Shield, Lock, Eye, FileText, CheckCircle2, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy-policy" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <SEO
        title="Privacy Policy | Data Protection & Patient Security"
        description="WellMeds is committed to protecting your personal healthcare data, medical records, and payment information in full compliance with Indian DPDP laws and global standards."
        canonical="/privacy-policy"
        breadcrumbs={breadcrumbs}
      />

      {/* Header Banner */}
      <section className="bg-[#172b26] text-white py-14 px-4 border-b border-[#26453d]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#203a34] text-[#84d6b9] text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-[#2e5249]">
            <Lock className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 & HIPAA Compliant Data Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
            Privacy Policy & Data Security
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Your trust is our highest priority. Learn how WellMeds collects, safeguards, and protects your medical prescriptions, order data, and health information.
          </p>
          <div className="mt-4 text-xs font-mono text-slate-400">
            Last Updated: July 2026 | Effective Version 2.4
          </div>
        </div>
      </section>

      {/* Policy Content Body */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8">
          
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <Shield className="w-5 h-5 shrink-0" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              WellMeds ("We", "Our", "Us") operates as a licensed digital specialty pharmacy under the Pharmacy Act and Drugs and Cosmetics Rules of India. To verify prescriptions and safely dispatch medications, we collect:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-650 list-disc list-inside">
              <li><strong>Personal Identifiers:</strong> Name, delivery address, phone number, email address.</li>
              <li><strong>Prescription Records:</strong> Uploaded medical prescriptions, prescriber details, and dosage instructions required by law for Schedule H / H1 drugs.</li>
              <li><strong>Technical Data:</strong> IP addresses, browser types, cookie identifiers for session management and anti-fraud monitoring.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <Lock className="w-5 h-5 shrink-0" />
              <h2>2. How We Use & Protect Your Health Data</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              Your prescription images and health information are restricted strictly to licensed registered pharmacists for clinical verification. We enforce end-to-end 256-bit SSL encryption during transit and encrypted storage at rest.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">No Third-Party Sale</h3>
                  <p className="text-xs text-emerald-700 mt-1">We never sell, rent, or trade your medical history to advertising networks.</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Encrypted Auditing</h3>
                  <p className="text-xs text-emerald-700 mt-1">All audit logs are stored securely to comply with state drug administration regulations.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 text-[#157a6d] font-bold text-lg sm:text-xl border-b border-slate-100 pb-3 mb-4">
              <Eye className="w-5 h-5 shrink-0" />
              <h2>3. Patient Rights & Data Erasure</h2>
            </div>
            <p className="text-sm text-slate-650 leading-relaxed">
              Under the Digital Personal Data Protection (DPDP) Act 2023, you retain full ownership of your data. You may request access to, correction of, or deletion of your non-statutory records by writing to our Data Protection Officer.
            </p>
          </section>

          {/* Section 4: Contact DPO */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 text-slate-900 font-bold text-base mb-2">
              <Phone className="w-4 h-4 text-[#157a6d]" />
              <h3>Data Protection Officer Contact</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For any privacy inquiries, data deletion requests, or compliance feedback, contact:
              <br />
              <strong>WellMeds Privacy Office</strong> — Baner, Pune, Maharashtra 411045.
              <br />
              Email: <a href="mailto:privacy@wellmeds.in" className="text-[#157a6d] underline font-semibold">privacy@wellmeds.in</a> | Phone: +91-800-WELLMEDS
            </p>
          </section>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-semibold text-[#157a6d]">
            <Link to="/terms-and-conditions" className="hover:underline">Terms & Conditions →</Link>
            <Link to="/refund-policy" className="hover:underline">Refund Policy →</Link>
            <Link to="/shipping-policy" className="hover:underline">Shipping Policy →</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
