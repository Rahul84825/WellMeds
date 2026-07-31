import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { 
  User, 
  Phone, 
  Home, 
  Building, 
  MapPin, 
  Navigation, 
  Compass, 
  Check, 
  AlertCircle,
  Briefcase,
  FileText,
  Bookmark,
  Sparkles
} from "lucide-react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

const UniversalAddressForm = ({
  initialValues = null,
  onSubmit,
  onCancel = null,
  submitLabel = "Save Address",
  isSubmitting = false,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: initialValues?.fullName || user?.name || "",
    mobile: initialValues?.mobile || user?.mobile || user?.phone || "",
    altMobile: initialValues?.altMobile || "",
    houseNo: initialValues?.houseNo || "",
    building: initialValues?.building || "",
    street: initialValues?.street || "",
    landmark: initialValues?.landmark || "",
    city: initialValues?.city || "",
    state: initialValues?.state || "Maharashtra",
    country: initialValues?.country || "India",
    pincode: initialValues?.pincode || "",
    type: initialValues?.type || "Home",
    deliveryInstructions: initialValues?.deliveryInstructions || "",
    isDefault: initialValues?.isDefault !== undefined ? initialValues.isDefault : false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        fullName: initialValues.fullName || user?.name || "",
        mobile: initialValues.mobile || user?.mobile || user?.phone || "",
        altMobile: initialValues.altMobile || "",
        houseNo: initialValues.houseNo || "",
        building: initialValues.building || "",
        street: initialValues.street || "",
        landmark: initialValues.landmark || "",
        city: initialValues.city || "",
        state: initialValues.state || "Maharashtra",
        country: initialValues.country || "India",
        pincode: initialValues.pincode || "",
        type: initialValues.type || "Home",
        deliveryInstructions: initialValues.deliveryInstructions || "",
        isDefault: initialValues.isDefault !== undefined ? initialValues.isDefault : false,
      });
    } else if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        mobile: prev.mobile || user.mobile || user.phone || "",
      }));
    }
  }, [initialValues, user]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Enter a valid 10-digit Indian mobile number";
    }

    if (formData.altMobile.trim() && !/^[6-9]\d{9}$/.test(formData.altMobile.trim())) {
      newErrors.altMobile = "Enter a valid 10-digit alternate mobile number";
    }

    if (!formData.houseNo.trim()) {
      newErrors.houseNo = "House / Flat / Apartment number is required";
    }

    if (!formData.building.trim()) {
      newErrors.building = "Building / Society name is required";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street / Area is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Clean and trim whitespace
      const cleanData = {
        ...formData,
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        altMobile: formData.altMobile.trim(),
        houseNo: formData.houseNo.trim(),
        building: formData.building.trim(),
        street: formData.street.trim(),
        landmark: formData.landmark.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || "India",
        pincode: formData.pincode.trim(),
        deliveryInstructions: formData.deliveryInstructions.trim(),
      };
      onSubmit(cleanData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md text-left select-none">
      
      {/* Contact Details Header */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#038076] dark:text-[#84d6b9] flex items-center gap-1.5">
          <User size={14} /> Contact Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className={`w-full bg-white dark:bg-zinc-900 border ${
                errors.fullName ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
              } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.fullName}
            </p>
          )}
        </div>

        {/* Primary Mobile */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
            <input
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, ""))}
              className={`w-full pl-10 bg-white dark:bg-zinc-900 border ${
                errors.mobile ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
              } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
            />
          </div>
          {errors.mobile && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.mobile}
            </p>
          )}
        </div>
      </div>

      {/* Alternate Mobile */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
          Alternate Mobile Number <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">+91</span>
          <input
            type="tel"
            maxLength={10}
            placeholder="Alternate contact for delivery updates"
            value={formData.altMobile}
            onChange={(e) => handleChange("altMobile", e.target.value.replace(/\D/g, ""))}
            className={`w-full pl-10 bg-white dark:bg-zinc-900 border ${
              errors.altMobile ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
            } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
          />
        </div>
        {errors.altMobile && (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
            <AlertCircle size={12} /> {errors.altMobile}
          </p>
        )}
      </div>

      {/* Address Details Header */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-2 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#038076] dark:text-[#84d6b9] flex items-center gap-1.5">
          <Home size={14} /> Address Details
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {/* House / Flat / Apartment */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
            Flat / House No / Apartment <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Flat 402, B-Wing"
            value={formData.houseNo}
            onChange={(e) => handleChange("houseNo", e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              errors.houseNo ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
            } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
          />
          {errors.houseNo && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.houseNo}
            </p>
          )}
        </div>

        {/* Building / Society */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
            Building / Society Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Echelon Apartments"
            value={formData.building}
            onChange={(e) => handleChange("building", e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              errors.building ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
            } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
          />
          {errors.building && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.building}
            </p>
          )}
        </div>
      </div>

      {/* Street / Area */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
          Street / Area / Sector <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Baner - Pashan Link Road, Baner"
          value={formData.street}
          onChange={(e) => handleChange("street", e.target.value)}
          className={`w-full bg-white dark:bg-zinc-900 border ${
            errors.street ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
          } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
        />
        {errors.street && (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
            <AlertCircle size={12} /> {errors.street}
          </p>
        )}
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
          Landmark <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Near Comfort Zone Society"
          value={formData.landmark}
          onChange={(e) => handleChange("landmark", e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        {/* City */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Pune"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              errors.city ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
            } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
          />
          {errors.city && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.city}
            </p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              errors.state ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
            } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all cursor-pointer`}
          >
            {INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.state}
            </p>
          )}
        </div>

        {/* PIN Code */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
            PIN Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="411045"
            value={formData.pincode}
            onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, ""))}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              errors.pincode ? "border-red-500" : "border-slate-250 dark:border-zinc-800"
            } rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all`}
          />
          {errors.pincode && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
              <AlertCircle size={12} /> {errors.pincode}
            </p>
          )}
        </div>
      </div>

      {/* Address Type Selection Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-2">
          Save Address As
        </label>
        <div className="flex gap-2">
          {[
            { id: "Home", label: "Home", icon: Home },
            { id: "Work", label: "Work", icon: Briefcase },
            { id: "Other", label: "Other", icon: Bookmark },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = formData.type === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => handleChange("type", item.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#038076] text-white border-[#038076] shadow-sm"
                    : "bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Instructions */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-200 mb-1">
          Delivery Instructions <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Leave with gate security guard or call upon arrival"
          value={formData.deliveryInstructions}
          onChange={(e) => handleChange("deliveryInstructions", e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#038076] transition-all resize-none"
        />
      </div>

      {/* Set as Default Toggle */}
      <div className="pt-1 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-100">Set as Default Address</p>
          <p className="text-[11px] text-slate-400">Default address will be automatically selected during checkout.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => handleChange("isDefault", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#038076]"></div>
        </label>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#038076] hover:bg-[#026860] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-3.5 h-3.5" />
          ) : (
            <Check size={15} />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default UniversalAddressForm;
