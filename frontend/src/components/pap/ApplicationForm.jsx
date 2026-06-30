import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Upload, CheckCircle2, FileText, ClipboardList } from "lucide-react";

const checklistItems = [
  { id: "rx", label: "Specialist Doctor Prescription" },
  { id: "id", label: "Government Photo ID (Aadhar/Passport)" },
  { id: "income", label: "Income Proof (ITR / Salary Slip / Certificate)" },
  { id: "reports", label: "Recent Medical & Diagnostic Reports" },
  { id: "letter", label: "Hospital Treatment Estimate Letter" },
  { id: "photo", label: "Patient Passport Size Photo" }
];

const ApplicationForm = ({ selectedProgram }) => {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    phone: "",
    email: "",
    medicine: "",
    doctor: "",
    hospital: "",
    income: "",
    message: ""
  });

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [documentsFile, setDocumentsFile] = useState(null);
  const [checklist, setChecklist] = useState({
    rx: false,
    id: false,
    income: false,
    reports: false,
    letter: false,
    photo: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Set program name automatically if pre-selected
  React.useEffect(() => {
    if (selectedProgram) {
      setFormData((prev) => ({ ...prev, medicine: selectedProgram }));
    }
  }, [selectedProgram]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (id) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.phone || !formData.email || !formData.medicine) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (prescriptionFile) {
      data.append("prescription", prescriptionFile);
    }
    if (documentsFile) {
      data.append("documents", documentsFile);
    }

    try {
      const response = await axios.post("/api/pap/apply", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      if (response.data.success) {
        setSuccess(true);
        toast.success("Application submitted successfully!");
        setFormData({
          patientName: "",
          age: "",
          phone: "",
          email: "",
          medicine: "",
          doctor: "",
          hospital: "",
          income: "",
          message: ""
        });
        setPrescriptionFile(null);
        setDocumentsFile(null);
        setChecklist({
          rx: false,
          id: false,
          income: false,
          reports: false,
          letter: false,
          photo: false
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pap-application-form" className="py-16 px-6 sm:px-12 lg:px-24 bg-white dark:bg-zinc-900 border-t border-slate-150 dark:border-zinc-850/60">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* Left Side: Interactive Checklist */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8 text-left">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-[#086b53]/10 text-[#086b53] rounded-full text-[10px] font-black uppercase tracking-widest">
              Application Prep
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100 leading-tight">
              Required Documents Checklist
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              To process your PAP application with the pharmaceutical company, we require verified clinical and financial documents. 
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
              Use the interactive checklist below to mark the documents you have ready, then attach them in the form.
            </p>
          </div>

          {/* Interactive Checklist Cards */}
          <div className="bg-slate-50 dark:bg-zinc-950/40 border border-slate-150 dark:border-zinc-850/50 p-lg rounded-2xl space-y-md shadow-sm">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 flex items-center gap-xs border-b border-slate-200/60 dark:border-zinc-800 pb-xs">
              <ClipboardList className="text-[#086b53]" size={18} />
              My Document Checklist
            </h4>
            <div className="space-y-sm">
              {checklistItems.map((item) => (
                <label 
                  key={item.id}
                  className="flex items-center gap-md p-2 hover:bg-white dark:hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.id]}
                    onChange={() => handleCheckboxChange(item.id)}
                    className="h-4.5 w-4.5 rounded text-[#086b53] focus:ring-[#086b53] border-slate-300 dark:border-zinc-800 bg-transparent cursor-pointer"
                  />
                  <span className={`text-xs font-medium transition-all ${
                    checklist[item.id] 
                      ? "line-through text-slate-400 dark:text-zinc-500" 
                      : "text-slate-650 dark:text-zinc-300"
                  }`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7">
          <div className="bg-slate-50/65 dark:bg-zinc-950/20 border border-slate-200 dark:border-zinc-850/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            {success ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-md">
                <CheckCircle2 className="text-emerald-500" size={54} />
                <div className="space-y-xs">
                  <h3 className="font-black text-lg text-slate-800 dark:text-zinc-100">
                    Application Docket Compiled!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm font-medium">
                    Your PAP application has been received. A dedicated patient caseworker has been assigned to your case and will call you in the next 3 hours to finalize the submission dossier.
                  </p>
                </div>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-xl py-2.5 bg-[#086b53] hover:bg-[#065340] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Apply for Another Program
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-md">
                <h3 className="font-black text-base text-slate-800 dark:text-zinc-100 text-left border-b border-slate-200/60 dark:border-zinc-800/80 pb-sm mb-md">
                  Patient Assistance Program Application
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Patient Name *</label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
                    />
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="e.g. 45"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Contact Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. +91 98765 43210"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
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
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Prescribed Medicine *</label>
                    <input
                      type="text"
                      name="medicine"
                      value={formData.medicine}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Herceptin 440mg"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
                    />
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Prescribing Doctor</label>
                    <input
                      type="text"
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleInputChange}
                      placeholder="e.g. Dr. A. K. Sen"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
                    />
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Hospital Name</label>
                    <input
                      type="text"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleInputChange}
                      placeholder="e.g. Apollo Hospital"
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  {/* Upload Prescription */}
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Doctor Prescription</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-md flex flex-col items-center justify-center space-y-xs relative cursor-pointer min-h-[80px] bg-white dark:bg-zinc-900">
                      <input
                        type="file"
                        onChange={(e) => e.target.files && setPrescriptionFile(e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileText className="text-slate-400" size={20} />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold text-center truncate max-w-full px-xs">
                        {prescriptionFile ? prescriptionFile.name : "Attach Rx Sheet"}
                      </span>
                    </div>
                  </div>

                  {/* Upload Documents */}
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Income Proof / Other Docs</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-md flex flex-col items-center justify-center space-y-xs relative cursor-pointer min-h-[80px] bg-white dark:bg-zinc-900">
                      <input
                        type="file"
                        onChange={(e) => e.target.files && setDocumentsFile(e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="text-slate-400" size={20} />
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold text-center truncate max-w-full px-xs">
                        {documentsFile ? documentsFile.name : "Attach Income/ID Sheet"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Annual Family Income</label>
                    <select
                      name="income"
                      value={formData.income}
                      onChange={handleInputChange}
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-850 dark:text-zinc-200 outline-none focus:border-[#086b53] transition-colors"
                    >
                      <option value="">Select Income Bracket</option>
                      <option value="Under 3 Lakhs">Under ₹3 Lakhs</option>
                      <option value="3 to 6 Lakhs">₹3 Lakhs - ₹6 Lakhs</option>
                      <option value="6 to 12 Lakhs">₹6 Lakhs - ₹12 Lakhs</option>
                      <option value="Above 12 Lakhs">Above ₹12 Lakhs</option>
                    </select>
                  </div>
                  <div className="space-y-xs text-left">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Additional Message</label>
                    <input
                      type="text"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Any specific requests or context..."
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] transition-colors"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#086b53] hover:bg-[#086b53]/90 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow-md shadow-emerald-900/10 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Submitting Docket..." : "Submit PAP Application"}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ApplicationForm;
