import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ShoppingBag,
  AlertCircle,
  Calendar,
  ArrowRight,
  Sparkles,
  Zap,
  Tag,
} from "lucide-react";
import { api } from "../services/api";

/* ─────────────────────────────────────────────────────────────────────────
   PREMIUM OFFER CARD THEMES
   Each theme has a complete visual identity — background, gradient text,
   badge, coupon pill, button, and decorative colours.
───────────────────────────────────────────────────────────────────────── */
const THEMES = [
  {
    // Mint / Teal
    cardBg: "linear-gradient(145deg, #f0faf8 0%, #e2f7f3 60%, #d4f0ea 100%)",
    cardBorder: "#b4e4d8",
    cardShadow: "rgba(14, 159, 126, 0.12)",
    eyebrowBg: "rgba(14, 159, 126, 0.12)",
    eyebrowText: "#0b7a62",
    heroGradient: "linear-gradient(135deg, #059669, #0891b2)",
    minBadgeBg: "rgba(14, 159, 126, 0.10)",
    minBadgeText: "#0b7a62",
    minBadgeBorder: "rgba(14, 159, 126, 0.25)",
    pillBg: "rgba(14, 159, 126, 0.08)",
    pillBorder: "rgba(14, 159, 126, 0.30)",
    pillText: "#0b7a62",
    pillHoverBg: "rgba(14, 159, 126, 0.14)",
    primaryBtn: "linear-gradient(135deg, #059669, #0891b2)",
    primaryBtnShadow: "rgba(14, 159, 126, 0.30)",
    shopBtnBorder: "#059669",
    shopBtnText: "#059669",
    deco1: "rgba(14, 159, 126, 0.08)",
    deco2: "rgba(8, 145, 178, 0.06)",
    expiryText: "#52796f",
  },
  {
    // Blue / Indigo
    cardBg: "linear-gradient(145deg, #eff6ff 0%, #dbeafe 60%, #c7d2fe 100%)",
    cardBorder: "#93c5fd",
    cardShadow: "rgba(37, 99, 235, 0.12)",
    eyebrowBg: "rgba(37, 99, 235, 0.10)",
    eyebrowText: "#1d4ed8",
    heroGradient: "linear-gradient(135deg, #2563eb, #7c3aed)",
    minBadgeBg: "rgba(37, 99, 235, 0.08)",
    minBadgeText: "#1d4ed8",
    minBadgeBorder: "rgba(37, 99, 235, 0.22)",
    pillBg: "rgba(37, 99, 235, 0.07)",
    pillBorder: "rgba(37, 99, 235, 0.28)",
    pillText: "#1d4ed8",
    pillHoverBg: "rgba(37, 99, 235, 0.13)",
    primaryBtn: "linear-gradient(135deg, #2563eb, #7c3aed)",
    primaryBtnShadow: "rgba(37, 99, 235, 0.30)",
    shopBtnBorder: "#2563eb",
    shopBtnText: "#2563eb",
    deco1: "rgba(37, 99, 235, 0.07)",
    deco2: "rgba(124, 58, 237, 0.05)",
    expiryText: "#3b5bdb",
  },
  {
    // Peach / Coral
    cardBg: "linear-gradient(145deg, #fff7ed 0%, #fed7aa 55%, #fecaca 100%)",
    cardBorder: "#fdba74",
    cardShadow: "rgba(234, 88, 12, 0.12)",
    eyebrowBg: "rgba(234, 88, 12, 0.10)",
    eyebrowText: "#c2410c",
    heroGradient: "linear-gradient(135deg, #ea580c, #dc2626)",
    minBadgeBg: "rgba(234, 88, 12, 0.08)",
    minBadgeText: "#c2410c",
    minBadgeBorder: "rgba(234, 88, 12, 0.22)",
    pillBg: "rgba(234, 88, 12, 0.07)",
    pillBorder: "rgba(234, 88, 12, 0.28)",
    pillText: "#c2410c",
    pillHoverBg: "rgba(234, 88, 12, 0.13)",
    primaryBtn: "linear-gradient(135deg, #ea580c, #dc2626)",
    primaryBtnShadow: "rgba(234, 88, 12, 0.30)",
    shopBtnBorder: "#ea580c",
    shopBtnText: "#ea580c",
    deco1: "rgba(234, 88, 12, 0.07)",
    deco2: "rgba(220, 38, 38, 0.05)",
    expiryText: "#9a3412",
  },
  {
    // Purple / Violet
    cardBg: "linear-gradient(145deg, #faf5ff 0%, #ede9fe 60%, #ddd6fe 100%)",
    cardBorder: "#c4b5fd",
    cardShadow: "rgba(124, 58, 237, 0.12)",
    eyebrowBg: "rgba(124, 58, 237, 0.10)",
    eyebrowText: "#6d28d9",
    heroGradient: "linear-gradient(135deg, #7c3aed, #db2777)",
    minBadgeBg: "rgba(124, 58, 237, 0.08)",
    minBadgeText: "#6d28d9",
    minBadgeBorder: "rgba(124, 58, 237, 0.22)",
    pillBg: "rgba(124, 58, 237, 0.07)",
    pillBorder: "rgba(124, 58, 237, 0.28)",
    pillText: "#6d28d9",
    pillHoverBg: "rgba(124, 58, 237, 0.13)",
    primaryBtn: "linear-gradient(135deg, #7c3aed, #db2777)",
    primaryBtnShadow: "rgba(124, 58, 237, 0.30)",
    shopBtnBorder: "#7c3aed",
    shopBtnText: "#7c3aed",
    deco1: "rgba(124, 58, 237, 0.07)",
    deco2: "rgba(219, 39, 119, 0.05)",
    expiryText: "#5b21b6",
  },
  {
    // Sky / Aqua
    cardBg: "linear-gradient(145deg, #f0f9ff 0%, #bae6fd 60%, #a5f3fc 100%)",
    cardBorder: "#7dd3fc",
    cardShadow: "rgba(2, 132, 199, 0.12)",
    eyebrowBg: "rgba(2, 132, 199, 0.10)",
    eyebrowText: "#0369a1",
    heroGradient: "linear-gradient(135deg, #0284c7, #0891b2)",
    minBadgeBg: "rgba(2, 132, 199, 0.08)",
    minBadgeText: "#0369a1",
    minBadgeBorder: "rgba(2, 132, 199, 0.22)",
    pillBg: "rgba(2, 132, 199, 0.07)",
    pillBorder: "rgba(2, 132, 199, 0.28)",
    pillText: "#0369a1",
    pillHoverBg: "rgba(2, 132, 199, 0.13)",
    primaryBtn: "linear-gradient(135deg, #0284c7, #0891b2)",
    primaryBtnShadow: "rgba(2, 132, 199, 0.30)",
    shopBtnBorder: "#0284c7",
    shopBtnText: "#0284c7",
    deco1: "rgba(2, 132, 199, 0.07)",
    deco2: "rgba(8, 145, 178, 0.05)",
    expiryText: "#075985",
  },
  {
    // Emerald / Green
    cardBg: "linear-gradient(145deg, #f0fdf4 0%, #bbf7d0 60%, #a7f3d0 100%)",
    cardBorder: "#6ee7b7",
    cardShadow: "rgba(16, 185, 129, 0.12)",
    eyebrowBg: "rgba(16, 185, 129, 0.10)",
    eyebrowText: "#065f46",
    heroGradient: "linear-gradient(135deg, #10b981, #059669)",
    minBadgeBg: "rgba(16, 185, 129, 0.08)",
    minBadgeText: "#065f46",
    minBadgeBorder: "rgba(16, 185, 129, 0.22)",
    pillBg: "rgba(16, 185, 129, 0.07)",
    pillBorder: "rgba(16, 185, 129, 0.28)",
    pillText: "#065f46",
    pillHoverBg: "rgba(16, 185, 129, 0.13)",
    primaryBtn: "linear-gradient(135deg, #10b981, #059669)",
    primaryBtnShadow: "rgba(16, 185, 129, 0.30)",
    shopBtnBorder: "#10b981",
    shopBtnText: "#065f46",
    deco1: "rgba(16, 185, 129, 0.07)",
    deco2: "rgba(5, 150, 105, 0.05)",
    expiryText: "#064e3b",
  },
];

/* ─── Badge labels rotating by index ─────────────────────────────────── */
const OFFER_BADGES = [
  "LIMITED OFFER",
  "FLASH DEAL",
  "SPECIAL OFFER",
  "MEMBER OFFER",
  "EXCLUSIVE",
  "SEASONAL DEAL",
];

/* ─── Decorative SVG shapes (very low opacity, per-card) ─────────────── */
const DecoCircles = ({ theme }) => (
  <svg
    aria-hidden="true"
    width="220"
    height="220"
    viewBox="0 0 220 220"
    fill="none"
    style={{
      position: "absolute",
      top: "-40px",
      right: "-40px",
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.9,
    }}
  >
    <circle cx="160" cy="60" r="90" fill={theme.deco1} />
    <circle cx="180" cy="30" r="50" fill={theme.deco2} />
    <circle cx="120" cy="100" r="30" fill={theme.deco1} />
    {/* Medical cross watermark */}
    <g opacity="0.35" fill={theme.pillBorder}>
      <rect x="74" y="60" width="12" height="40" rx="3" />
      <rect x="60" y="74" width="40" height="12" rx="3" />
    </g>
  </svg>
);

const DecoBottomLeft = ({ theme }) => (
  <svg
    aria-hidden="true"
    width="130"
    height="130"
    viewBox="0 0 130 130"
    fill="none"
    style={{
      position: "absolute",
      bottom: "-20px",
      left: "-20px",
      pointerEvents: "none",
      zIndex: 0,
      opacity: 0.7,
    }}
  >
    <circle cx="30" cy="100" r="65" fill={theme.deco2} />
    {/* Capsule pill illustration */}
    <rect x="20" y="58" width="40" height="18" rx="9" fill={theme.deco1} />
    <rect x="20" y="58" width="20" height="18" rx="9" fill={theme.pillBorder} opacity="0.4" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────────────
   SINGLE PREMIUM OFFER CARD
───────────────────────────────────────────────────────────────────────── */
const OfferCard = ({ coupon, index, copiedCode, onCopy }) => {
  const theme = THEMES[index % THEMES.length];
  const badge = OFFER_BADGES[index % OFFER_BADGES.length];

  // Prefer discountValue (canonical) with fallback to discountAmount (legacy alias)
  const discountVal = coupon.discountValue ?? coupon.discountAmount ?? 0;
  const minOrder = coupon.minimumOrder ?? coupon.minOrderValue ?? 0;

  const isCopied = copiedCode === coupon.code;

  const heroText =
    coupon.freeDelivery
      ? "FREE DELIVERY"
      : coupon.discountType === "percentage"
      ? `${discountVal}% OFF`
      : `₹${discountVal} OFF`;

  const description =
    coupon.description && coupon.description.trim()
      ? coupon.description
      : coupon.discountType === "percentage"
      ? `Save ${discountVal}% on prescription medicines and healthcare products.`
      : `Flat ₹${discountVal} discount on eligible medical supplies and wellness products.`;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* Card hover: managed via inline refs to avoid React re-renders */
  const cardRef = useRef(null);
  const pillRef = useRef(null);

  const handleCardMouseEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "translateY(-6px)";
    cardRef.current.style.boxShadow = `0 24px 60px ${theme.cardShadow}, 0 6px 20px rgba(0,0,0,0.07)`;
  };
  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "translateY(0)";
    cardRef.current.style.boxShadow = `0 6px 28px ${theme.cardShadow}, 0 2px 8px rgba(0,0,0,0.05)`;
  };

  const handlePillMouseEnter = () => {
    if (!pillRef.current) return;
    pillRef.current.style.background = theme.pillHoverBg;
    pillRef.current.style.transform = "scale(1.02)";
  };
  const handlePillMouseLeave = () => {
    if (!pillRef.current) return;
    pillRef.current.style.background = theme.pillBg;
    pillRef.current.style.transform = "scale(1)";
  };

  return (
    <div
      ref={cardRef}
      role="article"
      aria-label={`Offer: ${heroText} — Code: ${coupon.code}`}
      style={{
        background: theme.cardBg,
        border: `1.5px solid ${theme.cardBorder}`,
        borderRadius: "28px",
        padding: "28px",
        boxShadow: `0 6px 28px ${theme.cardShadow}, 0 2px 8px rgba(0,0,0,0.05)`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
        minHeight: "270px",
        position: "relative",
        overflow: "hidden",
        transition: "transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 280ms ease",
        cursor: "default",
      }}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
    >
      {/* ── Decorative BG Shapes ───────────────────────────────── */}
      <DecoCircles theme={theme} />
      <DecoBottomLeft theme={theme} />

      {/* ── Row 1: Badge + Min Order ───────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Offer badge eyebrow */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: theme.eyebrowBg,
            color: theme.eyebrowText,
            padding: "5px 10px",
            borderRadius: "999px",
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          <Sparkles size={9} />
          {badge}
        </span>

        {/* Minimum order badge */}
        {minOrder > 0 && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              background: theme.minBadgeBg,
              color: theme.minBadgeText,
              border: `1px solid ${theme.minBadgeBorder}`,
              padding: "4px 10px",
              borderRadius: "999px",
            }}
          >
            MIN ₹{minOrder}
          </span>
        )}
      </div>

      {/* ── Row 2: Hero Discount Text ─────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            fontSize: "clamp(38px, 5vw, 52px)",
            fontWeight: 900,
            lineHeight: 1,
            margin: 0,
            letterSpacing: "-0.03em",
            background: theme.heroGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {heroText}
        </p>

        {/* Description */}
        <p
          style={{
            fontSize: "13px",
            color: "#374151",
            marginTop: "8px",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontWeight: 400,
          }}
        >
          {description}
        </p>
      </div>

      {/* ── Row 3: Premium Coupon Pill ────────────────────────── */}
      <div
        ref={pillRef}
        role="button"
        tabIndex={0}
        aria-label={`Copy coupon code ${coupon.code}`}
        onClick={() => onCopy(coupon.code)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onCopy(coupon.code)}
        onMouseEnter={handlePillMouseEnter}
        onMouseLeave={handlePillMouseLeave}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: theme.pillBg,
          border: `1.5px dashed ${theme.pillBorder}`,
          borderRadius: "14px",
          padding: "12px 16px",
          cursor: "pointer",
          transition: "all 220ms ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', 'Roboto Mono', monospace",
            fontSize: "15px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: theme.pillText,
            userSelect: "all",
          }}
        >
          {coupon.code}
        </span>

        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: 700,
            color: theme.pillText,
            opacity: 0.85,
          }}
        >
          {isCopied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={13} />
              TAP TO COPY
            </>
          )}
        </span>
      </div>

      {/* ── Row 4: Expiry + Verified ──────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Expiry */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            color: theme.expiryText,
            fontWeight: 500,
          }}
        >
          <Calendar size={12} />
          Expires {formatDate(coupon.expiryDate)}
        </span>

        {/* Verified badge */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "10px",
            fontWeight: 700,
            color: "#065f46",
            background: "rgba(16, 185, 129, 0.10)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            padding: "3px 9px",
            borderRadius: "999px",
          }}
        >
          <Check size={10} />
          Verified by WellMeds
        </span>
      </div>

      {/* ── Row 5: CTA Buttons ────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          position: "relative",
          zIndex: 1,
          marginTop: "auto",
        }}
      >
        {/* Primary: Copy Code */}
        <button
          onClick={() => onCopy(coupon.code)}
          aria-label={`Copy coupon code ${coupon.code}`}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            padding: "13px 16px",
            background: isCopied
              ? "linear-gradient(135deg, #10b981, #059669)"
              : theme.primaryBtn,
            color: "#ffffff",
            borderRadius: "14px",
            border: "none",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: `0 4px 18px ${theme.primaryBtnShadow}`,
            transition: "all 220ms ease",
            transform: isCopied ? "scale(0.98)" : "scale(1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.90";
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = isCopied ? "scale(0.98)" : "scale(1)";
          }}
        >
          {isCopied ? (
            <>
              <Check size={15} />
              Code Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Code
            </>
          )}
        </button>

        {/* Secondary: Shop Now */}
        <Link
          to="/products"
          aria-label="Browse products to use this offer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "13px 18px",
            background: "transparent",
            color: theme.shopBtnText,
            border: `1.5px solid ${theme.shopBtnBorder}`,
            borderRadius: "14px",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 220ms ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.pillHoverBg;
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <ShoppingBag size={14} />
          Shop
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   SKELETON LOADER CARD
───────────────────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div
    style={{
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      borderRadius: "28px",
      padding: "28px",
      height: "290px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
    className="animate-pulse"
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ height: "22px", width: "120px", background: "#e2e8f0", borderRadius: "999px" }} />
      <div style={{ height: "22px", width: "70px", background: "#e2e8f0", borderRadius: "999px" }} />
    </div>
    <div>
      <div style={{ height: "52px", width: "180px", background: "#e2e8f0", borderRadius: "12px" }} />
      <div style={{ height: "14px", width: "100%", background: "#e2e8f0", borderRadius: "6px", marginTop: "12px" }} />
      <div style={{ height: "14px", width: "75%", background: "#e2e8f0", borderRadius: "6px", marginTop: "6px" }} />
    </div>
    <div style={{ height: "52px", width: "100%", background: "#e2e8f0", borderRadius: "14px" }} />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ height: "16px", width: "120px", background: "#e2e8f0", borderRadius: "6px" }} />
      <div style={{ height: "16px", width: "140px", background: "#e2e8f0", borderRadius: "999px" }} />
    </div>
    <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
      <div style={{ flex: 1, height: "46px", background: "#e2e8f0", borderRadius: "14px" }} />
      <div style={{ width: "100px", height: "46px", background: "#e2e8f0", borderRadius: "14px" }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT — CouponCarousel
   All carousel state, autoplay, touch swipe, and navigation is preserved
   exactly from the original implementation.
───────────────────────────────────────────────────────────────────────── */
const CouponCarousel = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Carousel States (preserved from original)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Touch swipe states (preserved from original)
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Resize listener — responsive visible card count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(2); // Desktop: 2 per row (premium wider cards)
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.getCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load coupons", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showControls = coupons.length > visibleCount;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? coupons.length - visibleCount : prev - 1
    );
  }, [coupons.length, visibleCount]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev >= coupons.length - visibleCount ? 0 : prev + 1
    );
  }, [coupons.length, visibleCount]);

  // Autoplay (preserved from original)
  useEffect(() => {
    if (!showControls || isHovered) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [showControls, isHovered, handleNext]);

  // Touch handlers (preserved from original)
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!showControls) return;
    if (touchStart - touchEnd > 50) handleNext();
    if (touchStart - touchEnd < -50) handlePrev();
  };

  // Copy code handler (preserved from original)
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToastMessage(`Coupon code "${code}" copied successfully!`);
    setTimeout(() => {
      setCopiedCode("");
      setToastMessage("");
    }, 3000);
  };

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <section
        aria-label="Loading offers"
        style={{
          padding: "56px 0 64px",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <div className="max-w-max-width mx-auto px-margin-desktop">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error) {
    return (
      <section
        style={{
          padding: "56px 0",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <div className="max-w-max-width mx-auto px-margin-desktop text-center">
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #fecdd3",
              borderRadius: "28px",
              padding: "48px 32px",
              maxWidth: "440px",
              margin: "0 auto",
              boxShadow: "0 6px 28px rgba(220,38,38,0.08)",
            }}
          >
            <AlertCircle size={40} style={{ color: "#ef4444", margin: "0 auto 16px" }} />
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Failed to load offers
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              There was a connection issue. Retry to load current WellMeds promotions.
            </p>
            <button
              onClick={fetchCoupons}
              style={{
                background: "linear-gradient(135deg, #038076, #0891b2)",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: "14px",
                border: "none",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(3,128,118,0.30)",
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ── Empty State ─────────────────────────────────────────── */
  if (coupons.length === 0) {
    return (
      <section
        style={{
          padding: "56px 0",
          background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        }}
      >
        <div className="max-w-max-width mx-auto px-margin-desktop text-center">
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e2e8f0",
              borderRadius: "28px",
              padding: "48px 32px",
              maxWidth: "440px",
              margin: "0 auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Tag size={36} style={{ color: "#94a3b8", margin: "0 auto 16px" }} />
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              No active offers right now
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              Check back later for exclusive discounts on your medications and clinical supplies.
            </p>
            <Link
              to="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #038076, #0891b2)",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: "14px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 700,
                boxShadow: "0 4px 18px rgba(3,128,118,0.25)",
              }}
            >
              Browse Products
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /* ── Main Render ─────────────────────────────────────────── */
  return (
    <section
      aria-label="Exclusive Offers and Coupons"
      style={{
        padding: "56px 0 64px",
        background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-max-width mx-auto px-margin-desktop">

        {/* ── Section Header ──────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#038076",
                marginBottom: "6px",
              }}
            >
              Exclusive Deals
            </p>
            <h2
              style={{
                fontSize: "clamp(22px, 3vw, 30px)",
                fontWeight: 800,
                color: "#0f172a",
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Active Offers & Coupons
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "6px",
                fontWeight: 400,
              }}
            >
              Copy a coupon code and apply it at checkout for instant savings.
            </p>
          </div>

          {/* Dot count badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#038076",
              background: "rgba(3,128,118,0.08)",
              border: "1px solid rgba(3,128,118,0.20)",
              padding: "6px 14px",
              borderRadius: "999px",
              flexShrink: 0,
            }}
          >
            <Zap size={12} />
            {coupons.length} Active Offer{coupons.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Carousel Wrapper ────────────────────────────────── */}
        <div style={{ position: "relative" }}>

          {/* Left Arrow */}
          {showControls && (
            <button
              onClick={handlePrev}
              aria-label="Previous offer"
              style={{
                position: "absolute",
                left: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#334155",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#038076";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#038076";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Right Arrow */}
          {showControls && (
            <button
              onClick={handleNext}
              aria-label="Next offer"
              style={{
                position: "absolute",
                right: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#334155",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#038076";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#038076";
                e.currentTarget.style.transform = "translateY(-50%) scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* ── Sliding Track ────────────────────────────────── */}
          <div
            style={{ overflow: "hidden", width: "100%", paddingBottom: "4px", paddingTop: "4px" }}
          >
            <div
              style={{
                display: "flex",
                transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {coupons.map((coupon, index) => (
                <div
                  key={coupon._id || coupon.id}
                  style={{
                    width: `${100 / visibleCount}%`,
                    flexShrink: 0,
                    padding: "0 12px",
                    boxSizing: "border-box",
                  }}
                >
                  <OfferCard
                    coupon={coupon}
                    index={index}
                    copiedCode={copiedCode}
                    onCopy={handleCopyCode}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pagination Dots ──────────────────────────────────── */}
        {showControls && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "28px",
            }}
          >
            {Array.from({ length: coupons.length - visibleCount + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to offer group ${i + 1}`}
                style={{
                  width: currentIndex === i ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: currentIndex === i ? "#038076" : "#cbd5e1",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 300ms ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Floating Toast Notification (preserved from original) ── */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "#f8fafc",
            padding: "14px 24px",
            borderRadius: "14px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.10)",
            animation: "fade-in 0.2s ease-out",
          }}
        >
          <Check size={16} style={{ color: "#10b981" }} />
          {toastMessage}
        </div>
      )}
    </section>
  );
};

export default CouponCarousel;
