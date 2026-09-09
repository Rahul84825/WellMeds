import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAddress } from "../context/AddressContext";
import AddressCard from "../components/address/AddressCard";
import UniversalAddressForm from "../components/address/UniversalAddressForm";
import Modal from "../components/Modal";
import PrescriptionUpload from "../components/PrescriptionUpload";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatDate } from "../utils/date";
import SEO from "../components/common/SEO";
import ProfileInfoCard from "../components/profile/ProfileInfoCard";
import { 
  User, 
  MapPin, 
  Package, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Edit3, 
  Check, 
  AlertCircle, 
  Phone, 
  Mail, 
  Calendar, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  LogOut,
  ShoppingBag,
  ArrowRight,
  Copy,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { formatCurrency } from "../utils/currency";

const formatMemberSince = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } catch {
    return isoString;
  }
};

const getRxStatusStyle = (status) => {
  switch (status) {
    case "Approved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200";
    case "Under Verification":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200";
    case "Rejected":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200";
  }
};

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    selectAddress,
    selectedAddressId,
  } = useAddress();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["addresses", "orders", "prescriptions", "settings"];

  const [activeTab, setActiveTab] = useState(() => {
    return validTabs.includes(tabParam) ? tabParam : "addresses";
  });

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  // Data states
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Address Modals
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Prescription Upload Modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [copiedRxId, setCopiedRxId] = useState(null);

  const handleCopyRxId = (id) => {
    if (navigator.clipboard && id) {
      navigator.clipboard.writeText(id);
      setCopiedRxId(id);
      setTimeout(() => setCopiedRxId(null), 2000);
    }
  };

  // Edit Profile State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const hasProfileChanges = Boolean(
    user &&
    (editName.trim() !== (user.name || "").trim() ||
     editEmail.trim() !== (user.email || "").trim())
  );

  useEffect(() => {
    if (!user) return;
    setEditName(user.name || "");
    setEditEmail(user.email || "");

    const fetchRxData = async () => {
      try {
        const data = await api.getMyPrescriptions();
        setPrescriptions(data || []);
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
      } finally {
        setLoadingRx(false);
      }
    };

    const fetchOrderData = async () => {
      try {
        const list = await api.getUserOrders();
        setOrders(list || []);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRxData();
    fetchOrderData();
  }, [user]);

  const handleUploadSuccess = (data) => {
    if (data.prescription) {
      setPrescriptions((prev) => [data.prescription, ...prev]);
    }
    setUploadOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!hasProfileChanges || isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileSavedSuccess(false);
    setProfileError("");
    try {
      await updateProfile({
        name: editName.trim(),
        email: editEmail.trim() || undefined,
      });
      setProfileSavedSuccess(true);
      setTimeout(() => {
        setProfileSavedSuccess(false);
      }, 4000);
    } catch (err) {
      console.warn("Failed to save profile changes:", err.message);
      setProfileError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] bg-[#f8fbfa] dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <SEO title="User Profile | WellMeds" description="View account details, orders, and addresses." noindex={true} />
        <div className="w-16 h-16 rounded-full bg-[#038076]/10 text-[#038076] flex items-center justify-center mb-4">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Please log in to view your profile</h2>
        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6 max-w-md">
          Access your saved addresses, prescription history, and track active orders seamlessly.
        </p>
        <Link
          to="/login"
          className="bg-[#038076] hover:bg-[#026860] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all"
        >
          Log In / Sign Up
        </Link>
      </div>
    );
  }

  // Profile completion calculation
  const hasName = user.name && !user.name.startsWith("User ");
  const hasEmail = Boolean(user.email);
  const profileCompletion = (hasName ? 50 : 25) + (hasEmail ? 50 : 25);

  return (
    <div className="min-h-screen wellmeds-editorial-bg py-8 md:py-12 select-none text-left font-sans">
      <SEO title={`${user.name || "My Account"} — Profile | WellMeds`} description="Manage your addresses, prescription records, and track orders." noindex={true} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* ── 1. HERO BANNER: ACCOUNT PROFILE OVERVIEW ── */}
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#038076]/10 via-[#84d6b9]/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 relative z-10">
            {/* User Details Left */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left min-w-0">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#026860] to-[#038076] text-white flex items-center justify-center text-3xl font-extrabold shadow-md overflow-hidden border-2 border-white dark:border-zinc-800">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.name || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs border-2 border-white dark:border-zinc-800" title="Verified Customer">
                  <Check size={13} strokeWidth={3} />
                </span>
              </div>

              {/* Information Strip */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                    {user.name || "Valued Customer"}
                  </h1>
                  <span className="inline-flex items-center gap-1 bg-[#038076]/10 dark:bg-[#038076]/20 text-[#038076] dark:text-[#84d6b9] border border-[#038076]/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    <ShieldCheck size={12} />
                    {user.role === "admin" ? "Pharmacist / Admin" : "Verified Patient"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-zinc-300 font-medium pt-0.5">
                  {user.mobile && (
                    <span className="inline-flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                      <Phone size={12} className="text-[#038076] dark:text-[#84d6b9]" /> +91 {user.mobile}
                    </span>
                  )}
                  {user.email && (
                    <span className="inline-flex items-center gap-1 bg-slate-100/80 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg">
                      <Mail size={12} className="text-[#038076] dark:text-[#84d6b9]" /> {user.email}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-slate-400 dark:text-zinc-500 py-1">
                    <Calendar size={12} /> Member since {formatMemberSince(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Completion & Quick Actions */}
            <div className="w-full lg:w-72 shrink-0 bg-slate-50/90 dark:bg-zinc-950/70 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-zinc-100">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#038076] dark:text-[#84d6b9]" />
                  Account Profile
                </span>
                <span className="text-[#038076] dark:text-[#84d6b9]">{profileCompletion}% Complete</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#038076] to-emerald-400 h-full transition-all duration-500 rounded-full" 
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                {profileCompletion === 100 
                  ? "✓ Account information fully synchronized" 
                  : "Add your email address to receive order invoices & e-prescriptions."}
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. QUICK STATS SUMMARY CARDS (4 Cards) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div 
            onClick={() => handleTabChange("addresses")}
            className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
              activeTab === "addresses" 
                ? "border-[#038076] dark:border-[#038076] ring-2 ring-[#038076]/15 bg-[#038076]/5" 
                : "border-slate-200/80 dark:border-zinc-800 hover:border-[#038076]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Addresses</span>
              <div className="w-8 h-8 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{addresses.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Saved delivery locations</p>
          </div>

          <div 
            onClick={() => handleTabChange("orders")}
            className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
              activeTab === "orders" 
                ? "border-[#038076] dark:border-[#038076] ring-2 ring-[#038076]/15 bg-[#038076]/5" 
                : "border-slate-200/80 dark:border-zinc-800 hover:border-[#038076]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Orders</span>
              <div className="w-8 h-8 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{orders.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Total orders placed</p>
          </div>

          <div 
            onClick={() => handleTabChange("prescriptions")}
            className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
              activeTab === "prescriptions" 
                ? "border-[#038076] dark:border-[#038076] ring-2 ring-[#038076]/15 bg-[#038076]/5" 
                : "border-slate-200/80 dark:border-zinc-800 hover:border-[#038076]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Prescriptions</span>
              <div className="w-8 h-8 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{prescriptions.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Rx records uploaded</p>
          </div>

          <div 
            onClick={() => handleTabChange("settings")}
            className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
              activeTab === "settings" 
                ? "border-[#038076] dark:border-[#038076] ring-2 ring-[#038076]/15 bg-[#038076]/5" 
                : "border-slate-200/80 dark:border-zinc-800 hover:border-[#038076]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Settings</span>
              <div className="w-8 h-8 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center group-hover:scale-110 transition-transform">
                <User size={16} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Active</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Security & preferences</p>
          </div>
        </div>

        {/* ── 3. SEGMENTED TAB NAVIGATION BAR ── */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: "addresses", label: "Saved Addresses", count: addresses.length, icon: MapPin },
              { id: "orders", label: "My Orders", count: orders.length, icon: Package },
              { id: "prescriptions", label: "Prescriptions (Rx)", count: prescriptions.length, icon: FileText },
              { id: "settings", label: "Account Settings", icon: User },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#038076] text-white shadow-xs"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. TAB CONTENT PANELS ── */}

        {/* TAB 1: SAVED ADDRESSES */}
        {activeTab === "addresses" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-[fade-in_0.2s_ease-out]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-[#038076] dark:text-[#84d6b9]" size={20} />
                  Delivery Addresses
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Manage your home, work, and family addresses for fast 1-click delivery.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setAddressModalOpen(true);
                }}
                className="bg-[#038076] hover:bg-[#026860] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={16} /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center mx-auto">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No saved addresses yet</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Add your address to enjoy instant express checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressModalOpen(true);
                  }}
                  className="bg-[#038076] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer"
                >
                  + Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const id = addr._id || addr.id;
                  const isSelected = id === selectedAddressId || (!selectedAddressId && addr.isDefault);
                  return (
                    <AddressCard
                      key={id}
                      address={addr}
                      isSelected={isSelected}
                      onSelect={(addrId) => selectAddress(addrId)}
                      onEdit={(a) => {
                        setEditingAddress(a);
                        setAddressModalOpen(true);
                      }}
                      onDelete={deleteAddress}
                      onSetDefault={setDefaultAddress}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-[fade-in_0.2s_ease-out]">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-5">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="text-[#038076] dark:text-[#84d6b9]" size={20} />
                Order History & Invoices
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Track your ongoing parcel deliveries and download official medical tax invoices.
              </p>
            </div>

            {loadingOrders ? (
              <div className="py-12 flex justify-center"><Loader size="md" /></div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center mx-auto">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No orders placed yet</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Explore our wide catalog of genuine medicines and healthcare essentials.</p>
                </div>
                <Link
                  to="/products"
                  className="inline-block bg-[#038076] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all"
                >
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const formattedDate = ord.createdAt ? formatDate(ord.createdAt) : "—";
                  const orderCode = ord.orderId || (ord._id || ord.id)?.slice(-8).toUpperCase();
                  const status = ord.orderStatus || ord.status || "Processing";
                  const isDelivered = status.toLowerCase().includes("delivered");

                  return (
                    <div
                      key={ord._id || ord.id}
                      className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 bg-slate-50/30 dark:bg-zinc-950/30 space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                            Order #{orderCode}
                          </span>
                          <span className="text-slate-400 dark:text-zinc-500">• Placed on {formattedDate}</span>
                        </div>

                        <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                          isDelivered 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] border-[#038076]/20"
                        }`}>
                          {status}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {ord.items && ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-700 dark:text-zinc-300">
                            <span className="font-medium">{item.name} × {item.quantity}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Address Snapshot & Total Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="text-slate-500 dark:text-zinc-400 max-w-md">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-0.5">Delivery Address:</span>
                          <p className="truncate text-[11px]">{ord.shippingAddress || "Pan-India Express Verified Address"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-400 dark:text-zinc-500 text-[11px] block">Total Amount</span>
                          <span className="text-lg font-extrabold text-[#038076] dark:text-[#84d6b9]">{formatCurrency(ord.total || ord.totalAmount || 0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRESCRIPTION CENTER (Rx TAB) */}
        {activeTab === "prescriptions" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-[fade-in_0.2s_ease-out]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-[#038076] dark:text-[#84d6b9]" size={20} />
                  Medical Prescriptions (Rx)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  View uploaded doctor prescriptions verified and prepared by our licensed pharmacists.
                </p>
              </div>

              <Link
                to="/upload-prescription"
                className="bg-[#038076] hover:bg-[#026860] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus size={16} /> Upload New Rx
              </Link>
            </div>

            {loadingRx ? (
              <div className="py-12 flex justify-center"><Loader size="md" /></div>
            ) : prescriptions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center mx-auto">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No prescription records found</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Upload your doctor's prescription for quick verification and custom cart preparation.</p>
                </div>
                <Link
                  to="/upload-prescription"
                  className="inline-block bg-[#038076] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer"
                >
                  Upload Your First Prescription
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => {
                  const statusStyle = getRxStatusStyle(rx.status);
                  const uploadDate = rx.createdAt ? formatDate(rx.createdAt) : "—";
                  const rxId = rx._id || rx.id;
                  const shortId = rxId ? rxId.slice(-8).toUpperCase() : "RX";
                  const isApproved = rx.status === "Approved";
                  const isPending = rx.status === "Pending Review" || rx.status === "Under Verification";

                  return (
                    <div
                      key={rxId}
                      className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 bg-slate-50/40 dark:bg-zinc-950/40 space-y-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Top Header: Rx ID + Status */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md">
                                  #{shortId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyRxId(rxId)}
                                  className="text-[11px] text-slate-400 hover:text-[#038076] dark:hover:text-[#84d6b9] font-medium transition-colors cursor-pointer"
                                  title="Copy Full Rx ID"
                                >
                                  {copiedRxId === rxId ? "Copied!" : "Copy"}
                                </button>
                              </div>
                              <p className="font-bold text-xs text-slate-800 dark:text-zinc-100 truncate mt-1">
                                {rx.name || "Medical Prescription"}
                              </p>
                            </div>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 ${statusStyle}`}>
                            {rx.status}
                          </span>
                        </div>

                        {/* Metadata Strip */}
                        <div className="text-[11px] text-slate-600 dark:text-zinc-400 space-y-1 bg-white/70 dark:bg-zinc-900/70 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80">
                          <div className="flex justify-between items-center">
                            <span>Uploaded Date:</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{uploadDate}</span>
                          </div>
                          {rx.doctorName && (
                            <div className="flex justify-between items-center">
                              <span>Doctor / Clinic:</span>
                              <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[170px]">{rx.doctorName}</span>
                            </div>
                          )}
                          {rx.patientNotes && (
                            <p className="text-[10px] text-slate-500 italic pt-0.5 truncate">
                              Note: "{rx.patientNotes}"
                            </p>
                          )}
                        </div>

                        {/* Prescribed Items (if Prepared by Pharmacist) */}
                        {isApproved && rx.prescribedItems && rx.prescribedItems.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              Prescribed Medicines ({rx.prescribedItems.length} items)
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {rx.prescribedItems.slice(0, 3).map((item, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/60"
                                >
                                  {item.name} {item.quantity > 1 ? `(${item.quantity})` : ""}
                                </span>
                              ))}
                              {rx.prescribedItems.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                                  +{rx.prescribedItems.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-3 mt-2 border-t border-slate-150 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                        {rx.fileUrl ? (
                          <a
                            href={rx.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-[#038076] dark:text-[#84d6b9] hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={12} /> View Document
                          </a>
                        ) : <span />}

                        {isApproved ? (
                          <Link
                            to="/cart"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#038076] hover:bg-[#026860] text-white px-3.5 py-1.5 rounded-lg shadow-xs transition-all"
                          >
                            <ShoppingBag size={12} /> View Cart
                          </Link>
                        ) : isPending ? (
                          <Link
                            to="/upload-prescription"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#038076] dark:text-[#84d6b9] hover:underline"
                          >
                            <Clock size={12} className="animate-pulse" /> Track Status
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACCOUNT SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl animate-[fade-in_0.2s_ease-out]">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-5">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <User className="text-[#038076] dark:text-[#84d6b9]" size={20} />
                Account Details & Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Update your account details and contact preferences.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileSavedSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-2.5 animate-[fade-in_0.2s_ease-out]">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Your account details have been updated successfully.</span>
                </div>
              )}

              {profileError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl text-xs text-rose-800 dark:text-rose-200 font-semibold flex items-center gap-2.5 animate-[fade-in_0.2s_ease-out]">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    setProfileSavedSuccess(false);
                    setProfileError("");
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Used for e-prescriptions & invoices)</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => {
                    setEditEmail(e.target.value);
                    setProfileSavedSuccess(false);
                    setProfileError("");
                  }}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
                />
              </div>

              {user.mobile && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="w-full bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-600 dark:text-zinc-400">
                    +91 {user.mobile}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>

                <button
                  type="submit"
                  disabled={!hasProfileChanges || isSavingProfile}
                  className="bg-[#038076] hover:bg-[#026860] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : profileSavedSuccess ? (
                    <>
                      <Check size={14} className="text-white" />
                      <span>Changes Saved</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => {
          setAddressModalOpen(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
        maxWidth="max-w-lg"
      >
        <div className="p-2">
          <UniversalAddressForm
            initialValues={editingAddress}
            onSubmit={async (cleanData) => {
              setIsSubmittingAddress(true);
              try {
                if (editingAddress) {
                  await updateAddress(editingAddress._id || editingAddress.id, cleanData);
                } else {
                  const newAddr = await addAddress(cleanData);
                  if (newAddr && selectAddress) {
                    selectAddress(newAddr._id || newAddr.id);
                  }
                }
                setAddressModalOpen(false);
                setEditingAddress(null);
              } catch (err) {
                console.error(err);
              } finally {
                setIsSubmittingAddress(false);
              }
            }}
            onCancel={() => {
              setAddressModalOpen(false);
              setEditingAddress(null);
            }}
            submitLabel={editingAddress ? "Update Address" : "Save Address"}
            isSubmitting={isSubmittingAddress}
          />
        </div>
      </Modal>

      {/* Prescription Upload Modal */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Medical Prescription (Rx)"
        maxWidth="max-w-md"
      >
        <PrescriptionUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setUploadOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Profile;
