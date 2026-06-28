import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { formatCurrency } from "../utils/currency";
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Calendar, 
  Info,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  CalendarCheck
} from "lucide-react";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form Fields
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("0");
  const [maximumDiscount, setMaximumDiscount] = useState("0");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [status, setStatus] = useState("Active");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [freeDelivery, setFreeDelivery] = useState(false);

  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetCoupons();
      setCoupons(data);
    } catch (err) {
      console.error("Failed to load admin coupons", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateForm = () => {
    setEditingCoupon(null);
    setCode("");
    setName("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinimumOrder("0");
    setMaximumDiscount("0");
    setUsageLimit("");
    setPerUserLimit("1");
    setStatus("Active");
    setStartDate(new Date().toISOString().split("T")[0]);
    setExpiryDate("");
    setFreeDelivery(false);
    setFormOpen(true);
  };

  const openEditForm = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setName(coupon.name || "");
    setDescription(coupon.description || "");
    setDiscountType(coupon.discountType || "percentage");
    setDiscountValue(coupon.discountValue || coupon.discountAmount || "");
    setMinimumOrder(coupon.minimumOrder || coupon.minOrderValue || "0");
    setMaximumDiscount(coupon.maximumDiscount || "0");
    setUsageLimit(coupon.usageLimit || "");
    setPerUserLimit(coupon.perUserLimit || "1");
    setStatus(coupon.status || "Active");
    setStartDate(coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    setExpiryDate(coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : "");
    setFreeDelivery(coupon.freeDelivery || false);
    setFormOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue || !expiryDate) {
      toast.warning("Please fill in code, discount value, and expiry date.");
      return;
    }

    const payload = {
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description: description.trim(),
      discountType,
      discountValue: parseFloat(discountValue),
      discountAmount: parseFloat(discountValue), // backward compatibility
      minimumOrder: parseFloat(minimumOrder),
      minOrderValue: parseFloat(minimumOrder), // backward compatibility
      maximumDiscount: parseFloat(maximumDiscount),
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      perUserLimit: parseInt(perUserLimit),
      status,
      isActive: status === "Active",
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      freeDelivery
    };

    setSaving(true);
    try {
      if (editingCoupon) {
        await api.adminUpdateCoupon(editingCoupon.id, payload);
        toast.success("Coupon updated successfully.");
      } else {
        await api.adminCreateCoupon(payload);
        toast.success("Coupon created successfully.");
      }
      setFormOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    const newStatus = coupon.status === "Active" ? "Inactive" : "Active";
    try {
      await api.adminUpdateCoupon(coupon.id, { 
        status: newStatus,
        isActive: newStatus === "Active"
      });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: newStatus, isActive: newStatus === "Active" } : c));
    } catch (err) {
      console.error("Failed to toggle status", err);
      toast.error("Failed to toggle coupon status.");
    }
  };

  const handleDuplicate = async (coupon) => {
    const duplicatedCode = `${coupon.code}_COPY_${Math.floor(100 + Math.random() * 900)}`;
    const payload = {
      ...coupon,
      code: duplicatedCode,
      usedCount: 0,
      status: "Inactive",
      isActive: false
    };
    delete payload.id;
    delete payload._id;
    delete payload.analytics;

    try {
      await api.adminCreateCoupon(payload);
      toast.success(`Coupon duplicated as: ${duplicatedCode}`);
      fetchCoupons();
    } catch (err) {
      console.error("Failed to duplicate coupon", err);
      toast.error("Failed to duplicate coupon.");
    }
  };

  const handleExpire = async (coupon) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    try {
      await api.adminUpdateCoupon(coupon.id, { expiryDate: yesterday });
      toast.info("Coupon marked as expired.");
      fetchCoupons();
    } catch (err) {
      console.error("Failed to expire coupon", err);
    }
  };

  const handleDelete = async (id, code) => {
    toast.warning(`Delete coupon "${code}"? This will permanently remove its record.`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.adminDeleteCoupon(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
            toast.success("Coupon deleted successfully.");
          } catch (err) {
            console.error("Failed to delete coupon", err);
            toast.error("Failed to delete coupon.");
          }
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Aggregate Metrics for Top stats
  const activeCouponsCount = coupons.filter(c => c.status === "Active" && new Date(c.expiryDate) > new Date()).length;
  const totalDiscountIssued = coupons.reduce((sum, c) => sum + (c.analytics?.totalDiscountGiven || 0), 0);
  const totalUses = coupons.reduce((sum, c) => sum + (c.analytics?.totalUses || 0), 0);
  const totalRevenue = coupons.reduce((sum, c) => sum + (c.analytics?.revenueGenerated || 0), 0);

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Tag className="text-[#004782]" />
            Coupons & Offers
          </h1>
          <p className="text-xs text-slate-400 font-medium">Create discount tickets, limit usages per customer, and track order conversions.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-primary text-white px-lg py-sm rounded-xl font-bold text-xs flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10 select-none cursor-pointer"
        >
          <Plus size={16} />
          Create Coupon
        </button>
      </div>

      {/* Analytics Summaries */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Offers</p>
          <div className="flex items-center gap-xs mt-xs text-slate-800 dark:text-zinc-100">
            <CalendarCheck size={16} className="text-emerald-500" />
            <span className="font-black text-lg">{activeCouponsCount} Promo(s)</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Uses</p>
          <div className="flex items-center gap-xs mt-xs text-slate-800 dark:text-zinc-100">
            <CheckCircle size={16} className="text-primary dark:text-[#a4c9ff]" />
            <span className="font-black text-lg">{totalUses} Times</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Discount Granted</p>
          <div className="flex items-center gap-xs mt-xs text-slate-800 dark:text-zinc-100">
            <Percent size={16} className="text-red-500" />
            <span className="font-black text-lg">{formatCurrency(totalDiscountIssued)}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl shadow-sm">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Revenue Supported</p>
          <div className="flex items-center gap-xs mt-xs text-slate-800 dark:text-zinc-100">
            <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-black text-lg">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Coupons Table Listing */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-md">Coupon Code</th>
                <th className="p-md">Discount Value</th>
                <th className="p-md text-center">Usage Count</th>
                <th className="p-md">Subtotal Constraint</th>
                <th className="p-md">Expiry Status</th>
                <th className="p-md">State</th>
                <th className="p-md">Supported Revenue</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-md">
                      <div className="flex flex-col">
                        <span className="font-black text-xs font-mono bg-slate-100 dark:bg-zinc-800 text-[#004782] dark:text-[#a4c9ff] px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700 w-fit">
                          {coupon.code}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-xs truncate max-w-[120px]" title={coupon.name}>{coupon.name || "No name"}</span>
                      </div>
                    </td>
                    <td className="p-md font-bold text-slate-800 dark:text-zinc-100">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                      {coupon.freeDelivery && <span className="block text-[9px] text-emerald-500 font-extrabold">+ Free Delivery</span>}
                    </td>
                    <td className="p-md text-center">
                      <span className="font-bold">{coupon.analytics?.totalUses || coupon.usedCount}</span>
                      <span className="text-slate-400"> / {coupon.usageLimit === null ? "∞" : coupon.usageLimit}</span>
                    </td>
                    <td className="p-md font-medium">Min order ₹{coupon.minimumOrder || coupon.minOrderValue}</td>
                    <td className="p-md">
                      <div className="flex flex-col text-[10px]">
                        <span className="font-bold">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                        {isExpired ? (
                          <span className="text-red-500 font-bold">Expired</span>
                        ) : (
                          <span className="text-slate-400">Valid</span>
                        )}
                      </div>
                    </td>
                    <td className="p-md">
                      <button 
                        onClick={() => handleToggleStatus(coupon)}
                        className="p-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title={coupon.status === "Active" ? "Deactivate Offer" : "Activate Offer"}
                      >
                        {coupon.status === "Active" ? (
                          <ToggleRight className="text-[#086b53] h-6 w-6" />
                        ) : (
                          <ToggleLeft className="text-slate-300 dark:text-zinc-700 h-6 w-6" />
                        )}
                      </button>
                    </td>
                    <td className="p-md font-black text-slate-800 dark:text-zinc-100">
                      {formatCurrency(coupon.analytics?.revenueGenerated || 0)}
                    </td>
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => openEditForm(coupon)}
                          className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-700 rounded-lg"
                          title="Edit Settings"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(coupon)}
                          className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-700 rounded-lg"
                          title="Duplicate Code"
                        >
                          <Copy size={14} />
                        </button>
                        {!isExpired && (
                          <button
                            onClick={() => handleExpire(coupon)}
                            className="p-sm text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg"
                            title="Force Expire Now"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="p-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                          title="Permanently Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-lg text-center text-slate-400">No promo coupons registered. Click 'Create Coupon' to begin!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal create/edit popup */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-md overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-4xl rounded-2xl shadow-2xl p-lg flex flex-col gap-md text-left animate-[scale-up_0.15s_ease-out] max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-sm">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon Offer"}
              </h3>
              <button 
                onClick={() => setFormOpen(false)}
                className="p-xs hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCoupon} className="flex flex-col lg:flex-row gap-lg items-start">
              
              {/* Left Column: Form Fields */}
              <div className="flex-1 w-full space-y-md">
                
                {/* Code & Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coupon Code *</label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="e.g. WELLMEDS50"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offer Title</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Monsoon Clearance Health savings"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-xs">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offer Description / Conditions</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe details shown to customers at checkout..."
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                  />
                </div>

                {/* Discount Types & Values */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none dark:text-zinc-200"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Discount Value *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "percentage" ? "e.g. 15 (for 15%)" : "e.g. 150 (for ₹150)"}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Max Discount Cap</label>
                    <input
                      type="number"
                      min="0"
                      value={maximumDiscount}
                      onChange={(e) => setMaximumDiscount(e.target.value)}
                      placeholder="e.g. 200 (0 for no cap)"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Minimum constraints & limits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Min Order (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={minimumOrder}
                      onChange={(e) => setMinimumOrder(e.target.value)}
                      placeholder="e.g. 499"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Global Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      placeholder="e.g. 100 (blank if unlimited)"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Limit Per User</label>
                    <input
                      type="number"
                      min="1"
                      value={perUserLimit}
                      onChange={(e) => setPerUserLimit(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Dates & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none dark:text-zinc-200"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none dark:text-zinc-200"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Initial Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none dark:text-zinc-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Free Delivery checkbox */}
                <div className="flex items-center gap-sm pt-sm">
                  <input
                    type="checkbox"
                    id="freeDelivery"
                    checked={freeDelivery}
                    onChange={(e) => setFreeDelivery(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="freeDelivery" className="text-xs font-semibold text-slate-700 dark:text-zinc-200 select-none">
                    Grant Free Delivery with this coupon
                  </label>
                </div>
              </div>

              {/* Right Column: Ticket preview & Save */}
              <div className="w-full lg:w-72 space-y-md bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-md rounded-2xl">
                <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-100">Live Preview</h4>
                
                {/* Simulated Coupon Ticket */}
                <div className="relative bg-gradient-to-br from-[#004782] to-[#0d599b] text-white p-md rounded-xl overflow-hidden shadow-md select-none">
                  {/* Notch cutouts */}
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-slate-50 dark:bg-zinc-950 rounded-full"></div>
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-slate-50 dark:bg-zinc-950 rounded-full"></div>
                  
                  <div className="border border-dashed border-white/20 p-sm rounded-lg flex flex-col items-center text-center gap-xs">
                    <p className="text-[10px] font-black tracking-widest text-[#a4c9ff] uppercase">WELLMEDS TICKET</p>
                    <span className="font-black font-mono text-base tracking-wider bg-white/10 px-md py-0.5 rounded border border-white/10 mt-xs">
                      {code || "CODE"}
                    </span>
                    <h5 className="font-black text-lg mt-xs">
                      {discountValue ? (discountType === "percentage" ? `${discountValue}% OFF` : `₹${discountValue} OFF`) : "0% OFF"}
                    </h5>
                    <p className="text-[9px] opacity-75 mt-xs leading-snug">
                      {description || "Add description details to show on this promo card ticket."}
                    </p>
                    {freeDelivery && <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[8px] font-bold px-2 py-0.5 rounded border border-emerald-400/20 mt-xs">FREE SHIPPING</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-sm pt-md border-t border-slate-200 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-[#086b53] hover:bg-emerald-700 text-white font-bold py-sm rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs"
                  >
                    {saving ? "Saving..." : "Save Coupon"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="w-full border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-bold py-sm rounded-xl text-xs transition-colors select-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
