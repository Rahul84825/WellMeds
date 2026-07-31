import React from "react";
import { 
  Home, 
  Briefcase, 
  Bookmark, 
  MapPin, 
  Phone, 
  Check, 
  Edit3, 
  Trash2, 
  Star, 
  MessageSquare
} from "lucide-react";

const AddressCard = ({
  address,
  isSelected = false,
  onSelect = null,
  onEdit = null,
  onDelete = null,
  onSetDefault = null,
  showActions = true,
}) => {
  if (!address) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case "Work":
        return Briefcase;
      case "Other":
        return Bookmark;
      default:
        return Home;
    }
  };

  const TypeIcon = getTypeIcon(address.type);

  const formattedAddressText = [
    address.houseNo,
    address.building,
    address.street,
    address.landmark ? `Near ${address.landmark}` : null,
    `${address.city}, ${address.state} - ${address.pincode}`,
    address.country || "India",
  ].filter(Boolean).join(", ");

  return (
    <div
      onClick={() => onSelect && onSelect(address._id || address.id)}
      className={`relative rounded-2xl p-4 transition-all border text-left select-none ${
        isSelected
          ? "bg-teal-50/70 dark:bg-teal-950/20 border-[#038076] shadow-sm ring-1 ring-[#038076]"
          : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      {/* Top Bar: Type Pill & Badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#038076]/10 dark:bg-[#038076]/20 text-[#038076] dark:text-[#84d6b9] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            <TypeIcon size={12} />
            {address.type || "Home"}
          </span>

          {address.isDefault && (
            <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-amber-200 dark:border-amber-800/40">
              <Star size={10} className="fill-amber-500 text-amber-500" />
              Default
            </span>
          )}
        </div>

        {/* Selection Checkmark */}
        {isSelected && (
          <span className="w-5 h-5 rounded-full bg-[#038076] text-white flex items-center justify-center shadow-xs">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Contact Name & Mobile */}
      <div className="mb-1">
        <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 mr-2">
          {address.fullName}
        </span>
        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
          +91 {address.mobile}
          {address.altMobile ? ` / +91 ${address.altMobile}` : ""}
        </span>
      </div>

      {/* Street & Location Details */}
      <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed mb-2 font-normal">
        {formattedAddressText}
      </p>

      {/* Delivery Instructions */}
      {address.deliveryInstructions && (
        <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/60 p-2 rounded-xl mb-3 border border-slate-100 dark:border-zinc-800 font-medium">
          <MessageSquare size={12} className="text-[#038076] shrink-0 mt-0.5" />
          <span>Instructions: {address.deliveryInstructions}</span>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-xs font-bold text-slate-500">
          {onSetDefault && !address.isDefault && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault(address._id || address.id);
              }}
              className="text-xs text-slate-500 hover:text-[#038076] dark:hover:text-[#84d6b9] transition-colors cursor-pointer"
            >
              Set as Default
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(address);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#038076] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                title="Edit Address"
              >
                <Edit3 size={14} />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(address._id || address.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer"
                title="Delete Address"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
