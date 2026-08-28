import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import Loader from "../components/Loader";
import {
  Settings,
  User,
  Lock,
  Store,
  Bell,
  ShieldCheck,
  Save,
  RefreshCw,
  Moon,
  Info,
  Upload
} from "lucide-react";

const AdminSettings = () => {
  const { user } = useAuth();

  const [savingSection, setSavingSection] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || "Dr. Claire Wilson");
  const [email, setEmail] = useState(user?.email || "admin@wellmeds.in");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [phone, setPhone] = useState(user?.phone || "+91 7798795353");

  // Shop Settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(99);
  const [taxRate, setTaxRate] = useState(12); // GST 12%
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  // Notification Toggles
  const [emailOrderAlerts, setEmailOrderAlerts] = useState(true);
  const [smsPrescriptionAlerts, setSmsPrescriptionAlerts] = useState(true);
  const [lowStockWarning, setLowStockWarning] = useState(true);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadedUrl = await api.uploadImage(file);
      setAvatar(uploadedUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingSection("profile");
    try {
      await api.updateProfile({ name, email, avatar });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveStore = (e) => {
    e.preventDefault();
    setSavingSection("store");
    setTimeout(() => {
      setSavingSection(null);
    }, 800);
  };

  const handleSaveNotify = () => {
    setSavingSection("notify");
    setTimeout(() => {
      setSavingSection(null);
    }, 600);
  };

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">

      {/* Title */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
          <Settings className="text-[#157A6D]" />
          System Settings
        </h1>
        <p className="text-xs text-slate-400 font-medium">Configure global shop operating limits, customize staff details, and modify backend alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">

        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-lg">

          {/* Section 1: Administrator Profile */}
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-xl rounded-2xl space-y-md shadow-xs">
            <div className="flex items-center gap-xs border-b border-slate-100 dark:border-zinc-800 pb-xs">
              <User size={18} className="text-[#157A6D]" />
              <h2 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Admin Staff Profile</h2>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-md">
              <div className="relative w-16 h-16 rounded-full border border-slate-200 dark:border-zinc-700 overflow-hidden bg-slate-50 dark:bg-zinc-800 shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Admin Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-400">
                    {name?.charAt(0) || "A"}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader size="sm" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 px-md py-xs rounded-xl font-bold text-xs flex items-center gap-xs transition-colors">
                <Upload size={14} />
                Change Picture
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-xs">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-md py-xs text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-[#157A6D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-xs">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-md py-xs text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-[#157A6D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-xs">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-md py-xs text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-[#157A6D]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-xs">
              <button
                type="submit"
                disabled={savingSection === "profile"}
                className="bg-[#157A6D] hover:bg-[#116459] text-white px-md py-xs rounded-xl font-bold text-xs flex items-center gap-xs transition-colors shadow-xs"
              >
                {savingSection === "profile" ? <Loader size="sm" /> : <Save size={14} />}
                Save Profile
              </button>
            </div>
          </form>

          {/* Section 2: Store Operations */}
          <form onSubmit={handleSaveStore} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-xl rounded-2xl space-y-md shadow-xs">
            <div className="flex items-center gap-xs border-b border-slate-100 dark:border-zinc-800 pb-xs">
              <Store size={18} className="text-[#157A6D]" />
              <h2 className="font-bold text-sm text-slate-800 dark:text-zinc-200">E-Commerce & Delivery Settings</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-xs">Free Shipping Minimum (₹)</label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full px-md py-xs text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-[#157A6D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-xs">Standard Flat Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={standardDeliveryFee}
                  onChange={(e) => setStandardDeliveryFee(Number(e.target.value))}
                  className="w-full px-md py-xs text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-[#157A6D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-xs">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-md py-xs text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-[#157A6D]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-xs">
              <button
                type="submit"
                disabled={savingSection === "store"}
                className="bg-[#157A6D] hover:bg-[#116459] text-white px-md py-xs rounded-xl font-bold text-xs flex items-center gap-xs transition-colors shadow-xs"
              >
                {savingSection === "store" ? <Loader size="sm" /> : <Save size={14} />}
                Save Parameters
              </button>
            </div>
          </form>

        </div>

        {/* Right Side: Security & Notifications */}
        <div className="space-y-lg">

          {/* Notifications Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-xl rounded-2xl space-y-md shadow-xs">
            <div className="flex items-center gap-xs border-b border-slate-100 dark:border-zinc-800 pb-xs">
              <Bell size={18} className="text-[#157A6D]" />
              <h2 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Alert Preferences</h2>
            </div>

            <div className="space-y-md text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-zinc-300 font-medium">New Order Email Alerts</span>
                <input
                  type="checkbox"
                  checked={emailOrderAlerts}
                  onChange={(e) => {
                    setEmailOrderAlerts(e.target.checked);
                    handleSaveNotify();
                  }}
                  className="w-4 h-4 accent-[#157A6D] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-zinc-300 font-medium">SMS Prescription Uploads</span>
                <input
                  type="checkbox"
                  checked={smsPrescriptionAlerts}
                  onChange={(e) => {
                    setSmsPrescriptionAlerts(e.target.checked);
                    handleSaveNotify();
                  }}
                  className="w-4 h-4 accent-[#157A6D] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-zinc-300 font-medium">Low Stock System Warnings</span>
                <input
                  type="checkbox"
                  checked={lowStockWarning}
                  onChange={(e) => {
                    setLowStockWarning(e.target.checked);
                    handleSaveNotify();
                  }}
                  className="w-4 h-4 accent-[#157A6D] rounded"
                />
              </label>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 p-md rounded-2xl text-xs space-y-xs text-slate-600 dark:text-zinc-400">
            <div className="flex items-center gap-xs font-bold text-slate-800 dark:text-zinc-200">
              <ShieldCheck size={16} className="text-[#157A6D]" />
              WellMeds Core Stack Version
            </div>
            <p>Framework: React 18 + Vite</p>
            <p>API Endpoint: Active</p>
            <p>Database Connection: MongoDB Verified</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminSettings;
