import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

const RequestForm = () => {
  const [formData, setFormData] = useState({
    medicineName: "",
    saltName: "",
    brand: "",
    country: "",
    quantity: 1,
    phone: "",
    email: "",
    message: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.medicineName || !formData.phone || !formData.email || !formData.quantity) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (file) {
      data.append("prescription", file);
    }

    try {
      const response = await axios.post("/api/import-requests", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      if (response.data.success) {
        setSuccess(true);
        toast.success("Request submitted successfully!");
        setFormData({
          medicineName: "",
          saltName: "",
          brand: "",
          country: "",
          quantity: 1,
          phone: "",
          email: "",
          message: ""
        });
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="import-request-form" className="py-16 px-6 sm:px-12 lg:px-24 bg-slate-50 dark:bg-zinc-950/40 border-t border-slate-150 dark:border-zinc-850/60">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* Left Side: Info */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 text-left">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-[#038076]/10 text-[#038076] rounded-full text-[10px] font-black uppercase tracking-widest">
              Specialized Sourcing
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100 leading-tight">
              Can't Find Your Medicine Locally?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              Many advanced oncology, immunology, and orphan disease therapies are not yet registered or commercially available in India. 
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              WellMeds bridges this gap by acting as your dedicated sourcing partner. Simply submit this request form with a valid prescription, and our clinical team will handle the regulatory clearances, procurement logistics, and deliver it directly to your home.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-slate-150 dark:border-zinc-850/50 p-lg rounded-2xl space-y-md shadow-sm">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 flex items-center gap-xs">
              <ShieldCheck className="text-emerald-500" size={18} />
              WellMeds Sourcing Guarantee
            </h4>
            <ul className="space-y-sm text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <li className="flex items-start gap-xs">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>Direct import under patient-named import permits.</span>
              </li>
              <li className="flex items-start gap-xs">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>Full temperature-monitored cold-chain log sheets.</span>
              </li>
              <li className="flex items-start gap-xs">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                <span>Verified customs documentation and duty slips.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-md">
            {success ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-md">
                <CheckCircle2 className="text-emerald-500" size={54} />
                <div className="space-y-xs">
                  <h3 className="font-black text-lg text-slate-800 dark:text-zinc-100">
                    Submission Received!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm font-medium">
                    Thank you for submitting your request. A certified pharmacist from our global access desk will contact you via phone or email within the next 2 hours.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-xl py-2.5 bg-[#004782] hover:bg-[#003c6e] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-md">
                <h3 className="font-black text-base text-slate-800 dark:text-zinc-100 text-left border-b border-slate-100 dark:border-zinc-800 pb-sm mb-md">
                  Import Medicine Request Form
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Medicine Name *</label>
                    <input
                      type="text"
                      name="medicineName"
                      value={formData.medicineName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Sorafenat 200mg"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors"
                    />
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Salt Name</label>
                    <input
                      type="text"
                      name="saltName"
                      value={formData.saltName}
                      onChange={handleInputChange}
                      placeholder="e.g. Sorafenib Tosylate"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Brand / Manufacturer</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g. Natco Pharma"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors"
                    />
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Sourcing Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g. Germany (Optional)"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors"
                    />
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. +91 98765 43210"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors"
                    />
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. name@example.com"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-xs text-left">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Upload Medical Prescription</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-zinc-850 rounded-xl p-md flex flex-col items-center justify-center space-y-sm hover:border-[#004782] transition-colors relative cursor-pointer min-h-[96px]">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="text-slate-400" size={24} />
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">
                      {file ? file.name : "Click or drag your Rx sheet (PDF, JPG, PNG)"}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-xs text-left">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Additional Message</label>
                  <textarea
                    name="message"
                    rows="3"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Provide any extra clinical details or delivery instructions..."
                    className="w-full p-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#004782] transition-colors resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#038076] hover:bg-[#038076]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow-md shadow-emerald-900/10 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting Request..." : "Submit Import Request"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default RequestForm;
