import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
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
  
  // Profile settings
  const [name, setName] = useState(user?.name || "Admin Staff");
  const [email, setEmail] = useState(user?.email || "admin@wellmeds.com");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  // Store Configuration
  const [shippingLimit, setShippingLimit] = useState("499");
  const [shippingFee, setShippingFee] = useState("40");
  const [taxPercent, setTaxPercent] = useState("12");
  const [storeAddress, setStoreAddress] = useState("WellMeds Healthcare Hub, Sector 5, Bangalore - 560001");
  const [supportPhone, setSupportPhone] = useState("+91 74209 09445");
  const [supportEmail, setSupportEmail] = useState("support@wellmeds.com");

  // Toggles
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyRxUpload, setNotifyRxUpload] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [savingSection, setSavingSection] = useState(null); // 'profile' | 'store' | 'notify'

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.info("Uploading image to Cloudinary...");
      const uploadedUrl = await api.uploadImage(file);
      setAvatar(uploadedUrl);
      toast.success("Avatar image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingSection("profile");
    try {
      await api.updateProfile({ name, email, avatar });
      toast.success("Admin profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile details.");
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveStore = (e) => {
    e.preventDefault();
    setSavingSection("store");
    setTimeout(() => {
      setSavingSection(null);
      toast.success("Store operating parameters saved!");
    }, 800);
  };

  const handleSaveNotify = () => {
    setSavingSection("notify");
    setTimeout(() => {
      setSavingSection(null);
      toast.success("Alert preferences updated!");
    }, 600);
  };

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
          <Settings className="text-[#004782]" />
          System Settings
        </h1>
        <p className="text-xs text-slate-400 font-medium">Configure global shop operating limits, customize staff details, and modify backend alerts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-lg">
          
          {/* Profile Form */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm p-lg space-y-md">
            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800">
              <User size={16} className="text-primary dark:text-[#a4c9ff]" />
              Staff Profile Details
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-md text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile Avatar</label>
                <div className="flex flex-col sm:flex-row items-center gap-md bg-slate-50 dark:bg-zinc-950 p-md rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <div className="relative h-16 w-16 rounded-full bg-[#004782]/10 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-[#004782] text-white flex items-center justify-center font-bold text-lg">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader size="xs" color="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow w-full">
                    <label className="inline-flex items-center justify-center gap-xs px-md py-sm bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 rounded-xl text-[11px] font-bold text-slate-700 dark:text-zinc-200 cursor-pointer shadow-xs transition-all min-h-[38px] select-none text-center">
                      <Upload size={14} className="text-[#004782] dark:text-[#a4c9ff]" />
                      <span>Upload Avatar Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">JPEG, PNG, or WEBP. Max size 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-sm border-t border-slate-100 dark:border-zinc-800">
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verify Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSection !== null}
                className="bg-[#004782] text-white px-lg py-sm rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs select-none cursor-pointer"
              >
                {savingSection === "profile" ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Store Settings Form */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm p-lg space-y-md">
            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800">
              <Store size={16} className="text-secondary dark:text-secondary-fixed-dim" />
              Store Operation Parameters
            </h3>
            
            <form onSubmit={handleSaveStore} className="space-y-md text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Delivery Limit (₹)</label>
                  <input
                    type="number"
                    value={shippingLimit}
                    onChange={(e) => setShippingLimit(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipping Fee (₹)</label>
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default GST Tax (%)</label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Headquarters Address</label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Phone Hotline</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Email Inbox</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSection !== null}
                className="bg-[#086b53] text-white px-lg py-sm rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs select-none cursor-pointer"
              >
                {savingSection === "store" ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                Save Parameters
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Options & Status cards */}
        <div className="space-y-lg">
          
          {/* Notifications Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm p-lg space-y-md">
            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800">
              <Bell size={16} className="text-amber-500" />
              Staff Notifications
            </h3>
            
            <div className="space-y-md text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Alert on new orders</p>
                  <p className="text-[10px] text-slate-400">Receive sounds and popups for orders.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewOrder}
                  onChange={(e) => setNotifyNewOrder(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Alert on prescription uploads</p>
                  <p className="text-[10px] text-slate-400">Trigger email when patients attach Rx.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyRxUpload}
                  onChange={(e) => setNotifyRxUpload(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
              </div>

              <button
                onClick={handleSaveNotify}
                disabled={savingSection !== null}
                className="w-full text-center text-xs font-bold border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 py-sm rounded-xl text-slate-600 dark:text-zinc-200 transition-colors select-none cursor-pointer"
              >
                {savingSection === "notify" ? "Updating..." : "Save Preferences"}
              </button>
            </div>
          </div>

          {/* Maintenance / Security panel */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm p-lg space-y-md">
            <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800">
              <ShieldCheck size={16} className="text-red-500" />
              Store State & Security
            </h3>

            <div className="space-y-md text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-100">Store Maintenance Mode</p>
                  <p className="text-[10px] text-slate-400">Lock shop database for public access.</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
              </div>

              <div className="p-sm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex gap-xs text-[10px] text-amber-700 dark:text-amber-400">
                <Info size={16} className="shrink-0" />
                <p className="leading-snug">Caution: enabling maintenance mode will block users from searching catalogs or creating new orders.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
