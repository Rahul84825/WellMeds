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
    // Soft Mint
    cardBg: "linear-gradient(135deg, #f0faf8 0%, #e2f7f3 100%)",
    cardBgForNotch: "#e2f7f3",
    cardBorder: "#b4e4d8",
    cardShadow: "rgba(11, 122, 98, 0.06)",
    eyebrowBg: "#e2f7f3",
    eyebrowText: "#0b7a62",
    heroColor: "#0b7a62",
    minBadgeBg: "rgba(14, 159, 126, 0.08)",
    minBadgeText: "#0b7a62",
    minBadgeBorder: "rgba(14, 159, 126, 0.20)",
    pillBg: "rgba(14, 159, 126, 0.04)",
    pillBorder: "rgba(14, 159, 126, 0.25)",
    pillText: "#0b7a62",
    pillHoverBg: "rgba(14, 159, 126, 0.08)",
    primaryBtn: "#0b7a62",
    primaryBtnHover: "#085c4a",
    shopBtnBorder: "#0b7a62",
    shopBtnText: "#0b7a62",
    decoColor: "#0b7a62",
    expiryText: "#475569",
  },
  {
    // Soft Blue
    cardBg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    cardBgForNotch: "#dbeafe",
    cardBorder: "#bfdbfe",
    cardShadow: "rgba(37, 99, 235, 0.06)",
    eyebrowBg: "#dbeafe",
    eyebrowText: "#1e40af",
    heroColor: "#1e40af",
    minBadgeBg: "rgba(37, 99, 235, 0.08)",
    minBadgeText: "#1e40af",
    minBadgeBorder: "rgba(37, 99, 235, 0.20)",
    pillBg: "rgba(37, 99, 235, 0.04)",
    pillBorder: "rgba(37, 99, 235, 0.25)",
    pillText: "#1e40af",
    pillHoverBg: "rgba(37, 99, 235, 0.08)",
    primaryBtn: "#2563eb",
    primaryBtnHover: "#1d4ed8",
    shopBtnBorder: "#2563eb",
    shopBtnText: "#2563eb",
    decoColor: "#2563eb",
    expiryText: "#475569",
  },
  {
    // Soft Peach
    cardBg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    cardBgForNotch: "#ffedd5",
    cardBorder: "#fed7aa",
    cardShadow: "rgba(234, 88, 12, 0.06)",
    eyebrowBg: "#ffedd5",
    eyebrowText: "#c2410c",
    heroColor: "#c2410c",
    minBadgeBg: "rgba(234, 88, 12, 0.08)",
    minBadgeText: "#c2410c",
    minBadgeBorder: "rgba(234, 88, 12, 0.20)",
    pillBg: "rgba(234, 88, 12, 0.04)",
    pillBorder: "rgba(234, 88, 12, 0.25)",
    pillText: "#c2410c",
    pillHoverBg: "rgba(234, 88, 12, 0.08)",
    primaryBtn: "#ea580c",
    primaryBtnHover: "#c2410c",
    shopBtnBorder: "#ea580c",
    shopBtnText: "#ea580c",
    decoColor: "#ea580c",
    expiryText: "#475569",
  },
  {
    // Soft Lavender
    cardBg: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
    cardBgForNotch: "#f3e8ff",
    cardBorder: "#e9d5ff",
    cardShadow: "rgba(124, 58, 237, 0.06)",
    eyebrowBg: "#f3e8ff",
    eyebrowText: "#6b21a8",
    heroColor: "#6b21a8",
    minBadgeBg: "rgba(124, 58, 237, 0.08)",
    minBadgeText: "#6b21a8",
    minBadgeBorder: "rgba(124, 58, 237, 0.20)",
    pillBg: "rgba(124, 58, 237, 0.04)",
    pillBorder: "rgba(124, 58, 237, 0.25)",
    pillText: "#6b21a8",
    pillHoverBg: "rgba(124, 58, 237, 0.08)",
    primaryBtn: "#7c3aed",
    primaryBtnHover: "#6b21a8",
    shopBtnBorder: "#7c3aed",
    shopBtnText: "#7c3aed",
    decoColor: "#7c3aed",
    expiryText: "#475569",
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

/* ─── Decorative SVGs (subtle medical watermarks) ─────────────────────── */
const MedicalWatermark = ({ theme }) => (
  <>
    {/* Top Right: Elegant Cross + Leaf */}
    <svg
      aria-hidden="true"
      width="160"
      height="160"
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        top: "-15px",
        right: "-15px",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.05,
      }}
    >
      <rect x="42" y="10" width="16" height="48" rx="4" fill={theme.decoColor} />
      <rect x="26" y="26" width="48" height="16" rx="4" fill={theme.decoColor} />
      <path
        d="M75,55 C85,55 90,65 90,75 C80,75 75,70 75,55 Z"
        fill={theme.decoColor}
      />
      <path
        d="M82,72 C88,68 93,72 95,80 C87,80 83,76 82,72 Z"
        fill={theme.decoColor}
      />
    </svg>

    {/* Bottom Left: Capsule + Subtle grid patterns */}
    <svg
      aria-hidden="true"
      width="140"
      height="140"
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        bottom: "-15px",
        left: "-15px",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.04,
      }}
    >
      <g transform="translate(15, 50) rotate(-45)">
        <rect x="0" y="0" width="44" height="20" rx="10" stroke={theme.decoColor} strokeWidth="4" fill="none" />
        <path d="M22,0 L22,20" stroke={theme.decoColor} strokeWidth="4" />
        <rect x="2" y="2" width="18" height="16" rx="8" fill={theme.decoColor} opacity="0.3" />
      </g>
      <circle cx="80" cy="20" r="2" fill={theme.decoColor} />
      <circle cx="90" cy="20" r="2" fill={theme.decoColor} />
      <circle cx="80" cy="30" r="2" fill={theme.decoColor} />
      <circle cx="90" cy="30" r="2" fill={theme.decoColor} />
      <circle cx="85" cy="25" r="3" fill={theme.decoColor} />
    </svg>
  </>
);

/* ─────────────────────────────────────────────────────────────────────────
   SINGLE PREMIUM OFFER CARD
───────────────────────────────────────────────────────────────────────── */
const OfferCard = ({ coupon, index, copiedCode, onCopy }) => {
  const theme = THEMES[index % THEMES.length];
  const badge = OFFER_BADGES[index % OFFER_BADGES.length];

  // Prefer discountValue with fallback to discountAmount
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

  const cardRef = useRef(null);
  const pillRef = useRef(null);

  const handleCardMouseEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "translateY(-4px)";
    cardRef.current.style.boxShadow = `0 12px 30px ${theme.cardShadow}, 0 4px 12px rgba(0,0,0,0.03)`;
  };
  const handleCardMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "translateY(0)";
    cardRef.current.style.boxShadow = `0 4px 16px ${theme.cardShadow}`;
  };

  const handlePillMouseEnter = () => {
    if (!pillRef.current) return;
    pillRef.current.style.background = theme.pillHoverBg;
    pillRef.current.style.transform = "scale(1.01)";
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
        borderRadius: "24px",
        padding: "24px",
        boxShadow: `0 4px 16px ${theme.cardShadow}`,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        height: "100%",
        minHeight: "270px",
        position: "relative",
        overflow: "hidden",
        transition: "transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms ease",
        cursor: "default",
      }}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
    >
      {/* ── Decorative BG Shapes ───────────────────────────────── */}
      <MedicalWatermark theme={theme} />

      {/* ── Top Row: Badge + Min Order ─────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: theme.eyebrowBg,
            color: theme.eyebrowText,
            padding: "4px 8px",
            borderRadius: "6px",
            border: `1px solid ${theme.cardBorder}`,
          }}
        >
          <Sparkles size={9} />
          {badge}
        </span>

        {minOrder > 0 && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              background: theme.minBadgeBg,
              color: theme.minBadgeText,
              border: `1px solid ${theme.minBadgeBorder}`,
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            MIN ₹{minOrder}
          </span>
        )}
      </div>

      {/* ── Center: Hero Offer, Description, Coupon ────────────── */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <p
          style={{
            fontSize: "clamp(30px, 4vw, 38px)",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
            letterSpacing: "-0.02em",
            color: theme.heroColor,
          }}
        >
          {heroText}
        </p>

        <p
          style={{
            fontSize: "13px",
            color: "#475569",
            margin: 0,
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

        {/* Premium Perforated Coupon Pill */}
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
            borderRadius: "10px",
            padding: "10px 14px",
            cursor: "pointer",
            transition: "all 200ms ease",
            position: "relative",
            overflow: "visible",
            marginTop: "4px",
          }}
        >
          {/* Perforated coupon notches */}
          <div
            style={{
              position: "absolute",
              left: "-9px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: theme.cardBgForNotch,
              borderRight: `1.5px solid ${theme.cardBorder}`,
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "-9px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: theme.cardBgForNotch,
              borderLeft: `1.5px solid ${theme.cardBorder}`,
              zIndex: 2,
            }}
          />

          <span
            style={{
              fontFamily: "'Courier New', 'Roboto Mono', monospace",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.1em",
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
              gap: "4px",
              fontSize: "10px",
              fontWeight: 700,
              color: theme.pillText,
              opacity: 0.85,
            }}
          >
            {isCopied ? (
              <>
                <Check size={12} />
                COPIED
              </>
            ) : (
              <>
                <Copy size={11} />
                COPY CODE
              </>
            )}
          </span>
        </div>
      </div>

      {/* ── Bottom: Expiry, Verified, Buttons ──────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          position: "relative",
          zIndex: 1,
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: theme.expiryText,
              fontWeight: 500,
            }}
          >
            <Calendar size={11} />
            Exp. {formatDate(coupon.expiryDate)}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "10px",
              fontWeight: 600,
              color: "#0b7a62",
              background: "rgba(14, 159, 126, 0.08)",
              border: "1px solid rgba(14, 159, 126, 0.15)",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            <Check size={9} />
            Verified
          </span>
        </div>

        {/* Buttons Row */}
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Primary: Copy Code */}
          <button
            onClick={() => onCopy(coupon.code)}
            aria-label={`Copy coupon code ${coupon.code}`}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "11px 14px",
              background: isCopied ? "#10b981" : theme.primaryBtn,
              color: "#ffffff",
              borderRadius: "10px",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 200ms ease, transform 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isCopied ? "#059669" : theme.primaryBtnHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isCopied ? "#10b981" : theme.primaryBtn;
            }}
          >
            {isCopied ? (
              <>
                <Check size={14} />
                Copied
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy Code
              </>
            )}
          </button>

          {/* Secondary: Shop Now (Outline) */}
          <Link
            to="/products"
            aria-label="Browse products to use this offer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "11px 16px",
              background: "transparent",
              color: theme.shopBtnText,
              border: `1.5px solid ${theme.shopBtnBorder}`,
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 200ms ease",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.pillHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ShoppingBag size={13} />
            Shop
            <ArrowRight size={12} />
          </Link>
        </div>
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
    try {
      navigator.clipboard.writeText(code);
    } catch (err) {
      console.warn("Clipboard access failed:", err);
    }
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
        className="bg-white dark:bg-zinc-950"
        style={{
          padding: "56px 0 64px",
        }}
      >
        <div className="home-section-container">
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
        className="bg-white dark:bg-zinc-950"
        style={{
          padding: "56px 0",
        }}
      >
        <div className="home-section-container text-center">
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

  /* ── Empty State — Hide entire section ─────────────────── */
  if (coupons.length === 0) {
    return null;
  }

  /* ── Main Render ─────────────────────────────────────────── */
  return (
    <section
      aria-label="Exclusive Offers and Coupons"
      className="bg-white dark:bg-zinc-950"
      style={{
        padding: "48px 0 56px",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="home-section-container">

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
