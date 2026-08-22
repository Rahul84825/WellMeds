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
  ArrowRight
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

  // Edit Profile State
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: editName.trim(),
        email: editEmail.trim() || undefined,
      });
    } catch (err) {
      console.warn("Failed to save profile changes:", err.message);
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
    <div className="min-h-screen wellmeds-editorial-bg py-8 md:py-12 select-none text-left">
      <SEO title={`${user.name || "My Account"} — Profile | WellMeds`} description="Manage your addresses, prescription records, and track orders." noindex={true} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ── PROFILE HERO BANNER ── */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              
              {/* Avatar Circle */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#038076] text-white flex items-center justify-center text-3xl font-extrabold shadow-md overflow-hidden border-2 border-white dark:border-zinc-800">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.name || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs border-2 border-white dark:border-zinc-800" title="Verified Account">
                  <Check size={13} strokeWidth={3} />
                </span>
              </div>

              {/* User Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {user.name || "Valued Customer"}
                  </h1>
                  <span className="bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {user.role === "admin" ? "Pharmacist / Admin" : "Verified Client"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-zinc-300 font-medium pt-1">
                  {user.mobile && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-[#038076]" /> +91 {user.mobile}
                    </span>
                  )}
                  {user.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-[#038076]" /> {user.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" /> Member since {formatMemberSince(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Completion Card */}
            <div className="w-full sm:w-auto bg-slate-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex items-center justify-between gap-4 font-bold text-slate-800 dark:text-zinc-100">
                <span>Account Setup</span>
                <span className="text-[#038076]">{profileCompletion}% Complete</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="bg-[#038076] h-full transition-all duration-500 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
              </div>
              <p className="text-[11px] text-slate-500">
                {profileCompletion === 100 ? "✓ Account fully verified" : "Add email address to get instant e-invoices"}
              </p>
            </div>
          </div>
        </div>

        {/* ── PROFILE INFORMATION CARD ── */}
        <ProfileInfoCard />

        {/* ── QUICK DASHBOARD STATS BAR ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            onClick={() => handleTabChange("addresses")}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-[#157a6d] transition-all shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Addresses</span>
              <MapPin size={18} className="text-[#157a6d]" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{addresses.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Saved delivery locations</p>
          </div>

          <div 
            onClick={() => handleTabChange("orders")}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-[#157a6d] transition-all shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">My Orders</span>
              <Package size={18} className="text-[#157a6d]" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{orders.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Total orders placed</p>
          </div>

          <div 
            onClick={() => handleTabChange("prescriptions")}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-[#157a6d] transition-all shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Prescriptions</span>
              <FileText size={18} className="text-[#157a6d]" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{prescriptions.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Rx records uploaded</p>
          </div>

          <div 
            onClick={() => handleTabChange("settings")}
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-[#157a6d] transition-all shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Settings</span>
              <User size={18} className="text-[#157a6d]" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">Account</p>
            <p className="text-[11px] text-slate-500 mt-1">Edit profile & contact</p>
          </div>
        </div>

        {/* ── EDITORIAL TAB NAVIGATION ── */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-2 text-sm font-bold no-scrollbar">
          {[
            { id: "addresses", label: `Saved Addresses (${addresses.length})`, icon: MapPin },
            { id: "orders", label: `My Orders (${orders.length})`, icon: Package },
            { id: "prescriptions", label: `Prescription Center (${prescriptions.length})`, icon: FileText },
            { id: "settings", label: "Account Settings", icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-[#157a6d] text-[#157a6d] dark:text-emerald-400"
                    : "border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT PANELS ── */}

        {/* 1. SAVED ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6 animate-[fade-in_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-[#038076]" size={20} />
                  My Saved Delivery Addresses
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Addresses saved here are automatically synchronized across Checkout and Upload Prescription.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAddress(null);
                  setAddressModalOpen(true);
                }}
                className="bg-[#038076] hover:bg-[#026860] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50">
                <MapPin size={40} className="mx-auto text-slate-400 mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No saved addresses found</p>
                <p className="text-xs text-slate-500 mb-4">Add your home or office address for 1-click checkout.</p>
                <button
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

        {/* 2. ORDER HISTORY TAB */}
        {activeTab === "orders" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6 animate-[fade-in_0.2s_ease-out]">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="text-[#038076]" size={20} />
                Order History & Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Track your active orders and review past delivery invoices.
              </p>
            </div>

            {loadingOrders ? (
              <div className="py-12 flex justify-center"><Loader size="md" /></div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50">
                <ShoppingBag size={40} className="mx-auto text-slate-400 mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No orders placed yet</p>
                <p className="text-xs text-slate-500 mb-4">Explore our wide range of medicines, healthcare supplements, and surgical categories.</p>
                <Link
                  to="/products"
                  className="inline-block bg-[#038076] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const formattedDate = ord.createdAt ? formatDate(ord.createdAt) : "—";
                  return (
                    <div
                      key={ord._id || ord.id}
                      className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 bg-slate-50/30 dark:bg-zinc-950/30 space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/60 pb-3 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white mr-2">
                            Order #{ord.orderId || (ord._id || ord.id)?.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-slate-400">Placed on {formattedDate}</span>
                        </div>
                        <span className="bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
                          {ord.orderStatus || ord.status || "Processing"}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {ord.items && ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-700 dark:text-zinc-300">
                            <span className="font-semibold">{item.name} × {item.quantity}</span>
                            <span className="font-mono text-slate-900 dark:text-white">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Address Snapshot & Total Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="text-slate-500 max-w-md">
                          <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-0.5">Shipping Address:</span>
                          <p className="truncate">{ord.shippingAddress || "Pan-India Express Address"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-slate-500 text-[11px] block">Total Amount Paid</span>
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

        {/* 3. PRESCRIPTION CENTER TAB */}
        {activeTab === "prescriptions" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6 animate-[fade-in_0.2s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-[#038076]" size={20} />
                  Prescription Records
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  View and manage uploaded medical prescriptions reviewed by licensed pharmacists.
                </p>
              </div>

              <button
                onClick={() => setUploadOpen(true)}
                className="bg-[#038076] hover:bg-[#026860] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={16} /> Upload New Rx
              </button>
            </div>

            {loadingRx ? (
              <div className="py-12 flex justify-center"><Loader size="md" /></div>
            ) : prescriptions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50">
                <FileText size={40} className="mx-auto text-slate-400 mb-2 opacity-60" />
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No prescription records found</p>
                <p className="text-xs text-slate-500 mb-4">Upload your doctor's prescription for quick verification and fast dispatch.</p>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="bg-[#038076] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-[#026860] transition-all cursor-pointer"
                >
                  Upload Your First Prescription
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptions.map((rx) => {
                  const statusStyle = getRxStatusStyle(rx.status);
                  const uploadDate = rx.createdAt ? formatDate(rx.createdAt) : "—";

                  return (
                    <div
                      key={rx._id || rx.id}
                      className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/30 dark:bg-zinc-950/30 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-[#038076]" />
                          <div>
                            <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                              {rx.name || "Medical Prescription"}
                            </p>
                            <p className="text-[10px] text-slate-400">Uploaded {uploadDate}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle}`}>
                          {rx.status}
                        </span>
                      </div>

                      {rx.fileUrl && (
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
                          <a
                            href={rx.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-[#038076] hover:underline flex items-center gap-1"
                          >
                            <ExternalLink size={12} /> View Document
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. ACCOUNT SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-6 max-w-2xl animate-[fade-in_0.2s_ease-out]">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <User className="text-[#038076]" size={20} />
                Account Settings & Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Update your account details and contact preferences.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional for digital invoices)</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#038076]"
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

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out of Account
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#038076] hover:bg-[#026860] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? "Saving..." : "Save Account Changes"}
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
        title={editingAddress ? "Edit Address" : "Add New Address"}
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
