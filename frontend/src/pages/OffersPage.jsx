import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import {
  Tag,
  Calendar,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  Phone,
  FileText,
  ChevronRight,
  Info,
  CreditCard,
  Percent
} from "lucide-react";

const OffersPage = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const data = await api.getCoupons();
        setCoupons(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load offers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 3000);
  };

  const handleApplyNow = (code) => {
    handleCopyCode(code);
    if (cartItems && cartItems.length > 0) {
      navigate("/cart");
    } else {
      navigate("/products");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Valid";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Offers & Coupons", url: "/offers" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Pharmacy Coupons, Offers & Promo Codes | WellMeds"
        description="Save on healthcare and prescription medicines with exclusive coupon codes, bank discounts, and promotional offers at WellMeds."
        canonical="/offers"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Offers & Coupon Codes
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── COUPONS GRID ── */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-300 dark:border-zinc-800 p-6 space-y-3 animate-pulse">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                    <div className="h-5 bg-slate-100 dark:bg-zinc-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : coupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => {
                const isCopied = copiedCode === coupon.code;
                const minSpend = coupon.minOrderAmount || coupon.minPurchase || 0;
                const maxDiscount = coupon.maxDiscountAmount || 0;

                return (
                  <div
                    key={coupon._id || coupon.id}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-4 text-left"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#f4f9f7] text-[#157a6d] font-clinical-mono text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                          <Percent size={13} />
                          {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar size={12} />
                          Exp: {formatDate(coupon.expiryDate)}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg text-[#172b26] dark:text-white">
                          Code: <span className="font-clinical-mono text-[#157a6d]">{coupon.code}</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                          {coupon.description || `Get instant discount on orders above ₹${minSpend}.`}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(coupon.code)}
                        className={`flex-1 py-2.5 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-[#f4f9f7] text-[#172b26] border border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:text-zinc-200"
                          }`}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        <span>{isCopied ? "Copied!" : "Copy Code"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyNow(coupon.code)}
                        className="flex-1 bg-[#157a6d] hover:bg-[#0f5c52] text-white py-2.5 rounded-full font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        <span>Apply</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <Tag size={36} className="mx-auto text-slate-400" />
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                No Active Offers Currently
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Check back soon for seasonal discounts, partner coupon deals, and promotional campaigns.
              </p>
            </div>
          )}
        </div>

        {/* ── WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
        </div>
      </div>

      {/* ── CONSULTATION MODAL ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default OffersPage;
