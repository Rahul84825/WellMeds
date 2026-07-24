import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Shield, Thermometer, Tag } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/placeholder";
import QuantitySelector from "../common/QuantitySelector";
import { RxBadge } from "../search/Badges";

const CartItemCard = ({
  item,
  onUpdateQuantity = () => {},
  onRemove = () => {},
  prescriptionStatus = null, // "Required" | "Uploaded" | "Verified"
}) => {
  const itemId = item.id || item._id;
  const isRx = item.isPrescriptionRequired || item.requiresRx || false;
  const isColdChain = item.isColdChain || false;

  const manufacturer = item.manufacturer || item.brand || "WELLMEDS";
  const packSize = item.packSize || item.productSpecifications?.packSize || "1 Pack";
  const strength = item.strength || item.productSpecifications?.strength || "";
  const moleculeName = item.molecules?.[0]?.name || item.genericName || item.productSpecifications?.genericName;

  const price = Number(item.price || 0);
  const originalPrice = Number(item.originalPrice || item.mrp || price);
  const quantity = Number(item.quantity || 1);

  const lineSubtotal = price * quantity;
  const lineOriginalSubtotal = originalPrice * quantity;
  const lineSavings = lineOriginalSubtotal > lineSubtotal ? lineOriginalSubtotal - lineSubtotal : 0;
  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors text-left">
      
      {/* Product Image & Discount Tag */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center p-2">
        <img
          alt={item.name}
          src={item.image || DEFAULT_PRODUCT_IMAGE}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_PRODUCT_IMAGE;
          }}
          className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
        />
        {discountPercent > 0 && (
          <span className="absolute -top-2 -left-2 bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Details & Controls */}
      <div className="flex-1 w-full flex flex-col sm:flex-row justify-between gap-4">
        
        {/* Item Metadata */}
        <div className="space-y-1.5 flex-1 pr-2">
          <Link
            to={`/products/${item.slug || itemId}`}
            className="font-extrabold text-base text-slate-900 dark:text-white hover:text-[#038076] transition-colors leading-tight line-clamp-2"
          >
            {item.name}
          </Link>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-zinc-400 font-medium">
            <span>By <strong className="text-slate-700 dark:text-zinc-200 font-semibold">{manufacturer}</strong></span>
            {strength && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <span>{strength}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <span>{packSize}</span>
          </div>

          {moleculeName && (
            <p className="text-xs text-[#038076] dark:text-[#84d6b9] font-medium truncate pt-0.5">
              Salt: {moleculeName}
            </p>
          )}

          {/* Badges / Status Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {isRx && (
              <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60 uppercase tracking-wider">
                <span className="w-3 h-3 bg-[#02665e] text-white rounded-full flex items-center justify-center text-[8px] font-black">Rx</span>
                {prescriptionStatus === "Uploaded"
                  ? "Prescription Uploaded"
                  : prescriptionStatus === "Verified"
                  ? "Verified by Pharmacist"
                  : "Rx Required"}
              </span>
            )}

            {isColdChain && (
              <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/60 uppercase tracking-wider">
                <Thermometer size={12} className="text-sky-500" />
                Cold Storage (2–8°C)
              </span>
            )}
          </div>
        </div>

        {/* Price Breakdown & Quantity Selector */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="font-extrabold text-lg text-slate-900 dark:text-white">
              {formatCurrency(lineSubtotal)}
            </p>
            {lineOriginalSubtotal > lineSubtotal && (
              <p className="text-xs text-slate-400 dark:text-zinc-500 line-through">
                MRP {formatCurrency(lineOriginalSubtotal)}
              </p>
            )}
            {lineSavings > 0 && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                Saved {formatCurrency(lineSavings)}
              </p>
            )}
          </div>

          {/* Stepper + Delete Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRemove(itemId)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
              title="Remove item"
            >
              <Trash2 size={17} />
            </button>

            <QuantitySelector
              quantity={quantity}
              onUpdate={(newQty) => onUpdateQuantity(itemId, newQty)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
