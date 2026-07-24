import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { formatCurrency } from "../../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../../utils/placeholder";
import { Sparkles, ArrowRightLeft, TrendingDown, Check } from "lucide-react";
import { toast } from "sonner";

const CheaperAlternativeSwap = ({ cartItems = [], onSwapItem = () => {} }) => {
  const [cheaperAlternative, setCheaperAlternative] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const findCheaperAlternative = async () => {
      if (!cartItems || cartItems.length === 0) {
        if (isMounted) setCheaperAlternative(null);
        return;
      }

      // Look through items in cart to see if any have a cheaper similar product
      for (const item of cartItems) {
        const itemId = item.id || item._id;
        try {
          const similar = await api.getSimilarProducts(itemId);
          if (similar && similar.length > 0) {
            // Find similar product with lower price
            const cheaper = similar.find((s) => s.price < item.price);
            if (cheaper) {
              const savingsPerUnit = item.price - cheaper.price;
              const totalSwapSavings = savingsPerUnit * item.quantity;

              if (isMounted) {
                setCheaperAlternative({
                  currentItem: item,
                  cheaperItem: cheaper,
                  savingsPerUnit,
                  totalSwapSavings,
                });
              }
              return;
            }
          }
        } catch (err) {
          console.error("Error finding cheaper alternative:", err);
        }
      }

      if (isMounted) setCheaperAlternative(null);
    };

    findCheaperAlternative();

    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  if (!cheaperAlternative) return null;

  const { currentItem, cheaperItem, totalSwapSavings } = cheaperAlternative;

  const handleSwap = async () => {
    setLoading(true);
    try {
      await onSwapItem(currentItem.id || currentItem._id, cheaperItem, currentItem.quantity);
      toast.success(`Switched to ${cheaperItem.name}! Saved ${formatCurrency(totalSwapSavings)}`);
      setCheaperAlternative(null);
    } catch (err) {
      console.error("Swap failed", err);
      toast.error("Failed to swap alternative product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-300 dark:border-emerald-800/60 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 text-left animate-[fade-in_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left Side Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <TrendingDown size={20} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-zinc-100">
                Cheaper Alternative Available!
              </h4>
              <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Save {formatCurrency(totalSwapSavings)}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
              You can switch <strong className="text-slate-900 dark:text-white font-bold">{currentItem.name}</strong> ({formatCurrency(currentItem.price)}) to{" "}
              <strong className="text-[#038076] dark:text-[#52d6c9] font-bold">{cheaperItem.name}</strong> ({formatCurrency(cheaperItem.price)}) with the exact same active salt & clinical efficacy.
            </p>
          </div>
        </div>

        {/* Swap Action Button */}
        <button
          type="button"
          onClick={handleSwap}
          disabled={loading}
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <ArrowRightLeft size={14} />
          <span>{loading ? "Swapping..." : "Switch & Save"}</span>
        </button>
      </div>
    </div>
  );
};

export default CheaperAlternativeSwap;
