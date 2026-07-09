import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { toast } from "sonner";
import {
  Tag,
  Calendar,
  Copy,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  CreditCard
} from "lucide-react";

const OFFER_BADGES = [
  "SPECIAL OFFER",
  "LIMITED DEAL",
  "FLASH OFFER",
  "EXCLUSIVE",
  "MEMBER DEAL",
  "HOT DISCOUNT"
];

const OffersPage = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth();
  
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("coupons"); // "coupons" | "bank"
  const [sortBy, setSortBy] = useState("savings"); // "savings" | "newest" | "expiring"
  const [copiedCode, setCopiedCode] = useState("");

  // Fetch coupons on mount
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const data = await api.getCoupons();
        setCoupons(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load offers:", err);
        toast.error("Could not load offers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // SEO Optimization & Schema injection
  useEffect(() => {
    // 1. Dynamic Title
    document.title = "WellMeds Offers | Exclusive Coupons & Promo Codes";

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Save more on your healthcare purchases with exclusive WellMeds coupons and bank promotional offers. Browse active coupons and apply during checkout.";

    // 3. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    // 4. OpenGraph Tags
    const setOgTag = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setOgTag("og:title", "WellMeds Offers | Save Big on Healthcare");
    setOgTag("og:description", "Save more on your healthcare purchases with exclusive WellMeds coupons and bank promotional offers.");
    setOgTag("og:url", window.location.href);
    setOgTag("og:type", "website");

    // 5. Breadcrumb & Offers JSON-LD Schema
    const scriptId = "offers-jsonld";
    let scriptEl = document.getElementById(scriptId);
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Offers",
          "item": window.location.href
        }
      ]
    };

    scriptEl.text = JSON.stringify(breadcrumbSchema);

    return () => {
      if (scriptEl) {
        scriptEl.remove();
      }
    };
  }, []);

  // Memoized sorted coupons list
  const sortedCoupons = useMemo(() => {
    const list = [...coupons];
    if (sortBy === "savings") {
      // Highest Savings First: sort by discountValue descending
      return list.sort((a, b) => {
        const valA = a.discountValue ?? 0;
        const valB = b.discountValue ?? 0;
        return valB - valA;
      });
    } else if (sortBy === "newest") {
      // Newest First: sort by creation date descending
      return list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "expiring") {
      // Expiring Soon First: sort by expiryDate ascending
      return list.sort((a, b) => {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
      });
    }
    return list;
  }, [coupons, sortBy]);

  // Handle coupon copy
  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Coupon code copied successfully!");
      setTimeout(() => setCopiedCode(""), 3000);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
      toast.error("Failed to copy code. Please write it down: " + code);
    }
  };

  // Handle Apply Now redirection
  const handleApplyNow = (code) => {
    // Copy the code for the user
    try {
      navigator.clipboard.writeText(code);
      toast.success(`Coupon code "${code}" copied and applying!`);
    } catch (err) {
      console.warn(err);
    }

    if (cartItems.length === 0) {
      // Redirect to products page if cart is empty
      navigate("/products");
    } else {
      // Redirect based on login status / flow
      if (user) {
        navigate(`/checkout?coupon=${code}`);
      } else {
        navigate(`/cart?coupon=${code}`);
      }
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#038076] dark:text-[#a4c9ff]">Offers</span>
      </nav>

      {/* Header */}
      <div className="mb-lg">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-white mb-xs tracking-tight">
          WellMeds Offers
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
          Save more on your healthcare purchases with exclusive coupons and promotional offers. Browse active offers and apply them during checkout to maximize your savings.
        </p>
      </div>

      {/* Navigation Tabs and Sorting bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 mb-lg gap-md">
        {/* Tabs */}
        <div className="flex gap-sm">
          <button
            onClick={() => setActiveTab("coupons")}
            className={`px-lg py-sm rounded-lg font-bold text-sm transition-all flex items-center gap-xs ${
              activeTab === "coupons"
                ? "bg-[#038076] text-white shadow-md shadow-[#038076]/10"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            }`}
          >
            <Tag size={16} />
            Coupon Offers
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`px-lg py-sm rounded-lg font-bold text-sm transition-all flex items-center gap-xs ${
              activeTab === "bank"
                ? "bg-[#038076] text-white shadow-md shadow-[#038076]/10"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            }`}
          >
            <CreditCard size={16} />
            Bank Offers
          </button>
        </div>

        {/* Sorting Dropdown (Only visible for Coupon tab when coupons exist) */}
        {activeTab === "coupons" && coupons.length > 0 && (
          <div className="flex items-center gap-sm">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-xs">
              <TrendingDown size={14} />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold px-md py-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#038076]"
            >
              <option value="savings">Highest Savings First</option>
              <option value="newest">Newest</option>
              <option value="expiring">Expiring Soon</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {loading ? (
        // Grid skeleton loader
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-lg h-60 animate-pulse flex flex-col gap-sm">
              <div className="flex justify-between">
                <div className="h-6 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
                <div className="h-6 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="h-10 w-40 bg-slate-200 dark:bg-zinc-800 rounded mt-md" />
              <div className="h-4 w-full bg-slate-200 dark:bg-zinc-800 rounded" />
              <div className="h-10 w-full bg-slate-200 dark:bg-zinc-800 rounded mt-auto" />
            </div>
          ))}
        </div>
      ) : activeTab === "bank" ? (
        // Bank Offers Coming Soon Tab
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 rounded-3xl p-xl text-center max-w-xl mx-auto shadow-sm my-xxl">
          <CreditCard className="mx-auto text-slate-300 dark:text-slate-700 mb-lg" size={48} />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-sm">
            Bank & Card Offers Coming Soon!
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-lg">
            We are partnering with major banks to bring you exclusive instant discounts and cashback offers. Stay tuned!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-xs bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-[#038076] dark:text-[#a4c9ff] px-xl py-sm rounded-xl font-bold text-sm transition-all"
          >
            Browse Wellness Products
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : sortedCoupons.length === 0 ? (
        // Coupon Empty State
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-900 rounded-3xl p-xl text-center max-w-xl mx-auto shadow-sm my-xxl">
          <Tag className="mx-auto text-slate-300 dark:text-slate-700 mb-lg animate-pulse" size={48} />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-sm">
            No active offers available right now.
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-lg">
            Check back later for exclusive discounts on your medications, surgical devices, and wellness products.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-xs bg-gradient-to-r from-[#038076] to-[#0891b2] text-white px-xl py-sm rounded-xl font-bold text-sm shadow-lg shadow-[#038076]/20 hover:shadow-xl hover:shadow-[#038076]/30 transition-all cursor-pointer active:scale-[0.98]"
          >
            Browse Products
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        // Grid display of active coupon cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {sortedCoupons.map((coupon, index) => {
            const badge = OFFER_BADGES[index % OFFER_BADGES.length];
            const discountVal = coupon.discountValue ?? coupon.discountAmount ?? 0;
            const minOrder = coupon.minimumOrder ?? coupon.minOrderValue ?? 0;
            const maxDiscount = coupon.maximumDiscount ?? 0;
            const isCopied = copiedCode === coupon.code;

            const heroText = coupon.freeDelivery
              ? "FREE DELIVERY"
              : coupon.discountType === "percentage"
              ? `${discountVal}% OFF`
              : `₹${discountVal} OFF`;

            const description = coupon.description && coupon.description.trim()
              ? coupon.description
              : coupon.discountType === "percentage"
              ? `Save ${discountVal}% on prescription medicines and healthcare products.`
              : `Flat ₹${discountVal} discount on eligible medical supplies and wellness products.`;

            return (
              <div
                key={coupon._id || coupon.id}
                className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-900 rounded-3xl p-lg shadow-sm hover:shadow-md dark:hover:border-[#038076]/50 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group select-none"
              >
                {/* Visual Medical Pattern Accent */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-[#038076]/5 to-[#0891b2]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                
                <div>
                  {/* Eyebrow and Min Order row */}
                  <div className="flex items-center justify-between mb-sm relative z-10">
                    <span className="inline-flex items-center gap-xs text-[10px] font-extrabold tracking-wider text-[#038076] dark:text-[#a4c9ff] bg-[#038076]/5 dark:bg-[#038076]/10 px-md py-xs rounded-lg border border-[#038076]/10">
                      <Sparkles size={10} />
                      {badge}
                    </span>
                    {minOrder > 0 && (
                      <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-900 px-md py-xs rounded-lg">
                        MIN ORDER: ₹{minOrder}
                      </span>
                    )}
                  </div>

                  {/* Discount Title */}
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-xs">
                    {heroText}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-md line-clamp-2">
                    {description}
                  </p>

                  {/* Dashed Coupon Pill Box */}
                  <div
                    onClick={() => handleCopyCode(coupon.code)}
                    className="flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-300 dark:border-zinc-800 rounded-xl p-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors mb-md relative overflow-hidden"
                  >
                    {/* Perforation holes on coupon edges */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-900" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-900" />
                    
                    <span className="font-mono font-extrabold text-sm text-[#038076] dark:text-[#a4c9ff] tracking-wider pl-xs">
                      {coupon.code}
                    </span>
                    <button className="flex items-center gap-xs text-[10px] font-bold text-[#038076] dark:text-[#a4c9ff]">
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          COPIED
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          COPY
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card footer details & Buttons */}
                <div className="mt-md border-t border-slate-100 dark:border-zinc-900 pt-md flex flex-col gap-sm">
                  {/* T&C constraints information */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                    <span className="flex items-center gap-xs">
                      <Calendar size={12} />
                      Exp: {formatDate(coupon.expiryDate)}
                    </span>
                    {maxDiscount > 0 && (
                      <span className="flex items-center gap-xs">
                        <Info size={11} />
                        Max Discount: ₹{maxDiscount}
                      </span>
                    )}
                  </div>

                  {/* Interaction Buttons Row */}
                  <div className="flex gap-sm">
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className={`flex-1 flex items-center justify-center gap-xs py-sm rounded-xl font-bold text-xs transition-all active:scale-[0.97] cursor-pointer ${
                        isCopied
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy Code
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleApplyNow(coupon.code)}
                      className="flex-1 flex items-center justify-center gap-xs bg-[#038076] hover:bg-[#02665e] text-white py-sm rounded-xl font-bold text-xs shadow-md shadow-[#038076]/10 hover:shadow-lg transition-all active:scale-[0.97] cursor-pointer"
                    >
                      <ShoppingBag size={13} />
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
