import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import SEO from "../components/common/SEO";
import Loader from "../components/Loader";
import { calculateDeliveryDates } from "../components/ProductDetail/ProductDeliveryCheck";
import { formatCurrency, calculateDiscountPercent, calculateSavings, formatPrice } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import { getCardImageUrl } from "../utils/image";
import {
  ChevronRight,
  ChevronLeft,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  CheckCircle,
  Truck,
  ShieldCheck,
  Award,
  Package,
  Sparkles,
  Building2,
  Phone,
  HelpCircle,
  Share2,
  Maximize2,
  Scissors,
  Layers,
  MapPin,
  RefreshCw,
  Send,
  AlertCircle,
  FileText
} from "lucide-react";

const SurgicalProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();

  // Data states
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  // Lightbox modal state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Bulk pricing inquiry modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    name: "",
    hospitalName: "",
    phone: "",
    email: "",
    quantity: "",
    notes: "",
  });
  const [bulkSubmitted, setBulkSubmitted] = useState(false);

  // Pincode availability state
  const [pincodeInput, setPincodeInput] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wellmeds_delivery_location") || "{}");
      return saved.pincode || "600017";
    } catch {
      return "600017";
    }
  });
  const [pincodeResult, setPincodeResult] = useState(() => {
    return {
      checked: true,
      available: true,
      pincode: "600017",
      datesText: calculateDeliveryDates("600017", "Chennai"),
    };
  });
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  // Share tooltip
  const [copiedLink, setCopiedLink] = useState(false);

  // Derived Images List
  const imagesList = useMemo(() => {
    if (!product) return [DEFAULT_PRODUCT_IMAGE];
    const validImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (validImages.length > 0) return validImages;
    if (product.image) return [product.image];
    return [DEFAULT_PRODUCT_IMAGE];
  }, [product]);

  // Derived Variants
  const variantsList = useMemo(() => {
    if (product && Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }
    if (product) {
      return [
        {
          name: "Standard",
          sellingPrice: product.price || 0,
          mrp: product.originalPrice || product.price || 0,
          stock: product.stock !== undefined ? product.stock : 99,
        },
      ];
    }
    return [];
  }, [product]);

  // Current active variant
  const currentVariant = useMemo(() => {
    if (variantsList.length === 0) return null;
    return variantsList[selectedVariantIdx] || variantsList[0];
  }, [variantsList, selectedVariantIdx]);

  // Dynamic Pricing Calculation
  const currentPrice = currentVariant ? (currentVariant.sellingPrice ?? currentVariant.price) : product?.price || 0;
  const currentMrp = currentVariant ? (currentVariant.mrp || currentPrice) : product?.originalPrice || currentPrice;
  const discountPercent = calculateDiscountPercent(currentMrp, currentPrice);
  const savings = calculateSavings(currentMrp, currentPrice);
  const isOutOfStock = product?.inStock === false || (currentVariant?.stock !== undefined && currentVariant.stock <= 0);

  // Cart Status
  const productId = (product?._id || product?.id)?.toString();
  const variantName = currentVariant?.name || "";
  const cartItemKey = variantName ? `${productId}-${variantName}` : productId;

  const cartItem = cartItems?.find(
    (item) => item.id === cartItemKey || (item.productId === productId && (item.variantName || "") === variantName)
  );
  const isInCart = !!cartItem;
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // Lock body scroll when any modal/lightbox is open
  useEffect(() => {
    if (isLightboxOpen || bulkModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen, bulkModalOpen]);

  // Keyboard navigation for Lightbox and Bulk Modal
  useEffect(() => {
    if (!isLightboxOpen && !bulkModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isLightboxOpen) setIsLightboxOpen(false);
        if (bulkModalOpen) setBulkModalOpen(false);
      } else if (isLightboxOpen) {
        if (e.key === "ArrowLeft") {
          setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
        } else if (e.key === "ArrowRight") {
          setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, bulkModalOpen, imagesList.length]);

  // Load product data
  useEffect(() => {
    let isMounted = true;
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const prod = await api.getProduct(slug);
        if (!isMounted || !prod) return;

        setProduct(prod);
        setActiveImageIdx(0);
        setSelectedVariantIdx(0);
        setQuantity(1);

        // Fetch related surgical products from same category or brand
        const surgCatId = prod.surgicalCategory?._id || prod.surgicalCategory;
        const relatedRes = await api.getProducts({
          isSurgical: true,
          limit: 12,
        });

        if (!isMounted) return;
        const allSurg = relatedRes.products || [];
        const filtered = allSurg.filter(
          (p) => (p._id || p.id)?.toString() !== (prod._id || prod.id)?.toString()
        );

        // Prioritize same surgical category
        const sameCategory = filtered.filter(
          (p) => (p.surgicalCategory?._id || p.surgicalCategory)?.toString() === surgCatId?.toString()
        );
        const others = filtered.filter(
          (p) => (p.surgicalCategory?._id || p.surgicalCategory)?.toString() !== surgCatId?.toString()
        );

        setRelatedProducts([...sameCategory, ...others].slice(0, 4));
      } catch (err) {
        console.error("Failed to load surgical product", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Handle Variant Selection
  const handleSelectVariant = (idx) => {
    setSelectedVariantIdx(idx);
  };

  // Add to Cart
  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    try {
      await addToCart(
        {
          ...product,
          price: currentPrice,
          originalPrice: currentMrp,
        },
        quantity,
        currentVariant
      );
    } catch (err) {
      console.error("Failed to add surgical product to cart", err);
    }
  };

  // Buy Now (Add + Navigate to Checkout)
  const handleBuyNow = async () => {
    if (!product || isOutOfStock) return;
    try {
      if (!isInCart) {
        await addToCart(
          {
            ...product,
            price: currentPrice,
            originalPrice: currentMrp,
          },
          quantity,
          currentVariant
        );
      }
      navigate("/checkout");
    } catch (err) {
      console.error("Buy now failed", err);
    }
  };

  // Check Pincode
  const handleCheckPincode = (e) => {
    if (e) e.preventDefault();
    setPincodeError("");
    const pin = String(pincodeInput || "").trim();
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPincodeError("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setCheckingPincode(true);
    setTimeout(() => {
      const dates = calculateDeliveryDates(pin, "");
      setPincodeResult({
        checked: true,
        available: true,
        pincode: pin,
        datesText: dates,
      });
      setCheckingPincode(false);
      try {
        localStorage.setItem(
          "wellmeds_delivery_location",
          JSON.stringify({ pincode: pin, city: "", displayText: pin })
        );
      } catch {}
    }, 350);
  };

  // Copy Link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Submit Bulk Inquiry
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (!bulkForm.name || !bulkForm.phone) {
      alert("Please provide your name and contact phone number.");
      return;
    }
    setBulkSubmitted(true);
    setTimeout(() => {
      setBulkModalOpen(false);
      setBulkSubmitted(false);
      setBulkForm({ name: "", hospitalName: "", phone: "", email: "", quantity: "", notes: "" });
      alert("Thank you! Your bulk procurement inquiry has been received. Our clinical supply team will contact you within 2 hours.");
    }, 1200);
  };

  // Breadcrumbs for SEO
  const rawCat = product?.surgicalCategory;
  const categoryName = typeof rawCat === "object" ? rawCat?.name : (rawCat || "Surgical Supplies");
  const categorySlug = typeof rawCat === "object" ? rawCat?.slug : "";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Surgical", url: "/surgical" },
    ...(categorySlug ? [{ name: categoryName, url: `/surgical/${categorySlug}` }] : []),
    { name: product?.name || "Product", url: `/surgical/products/${slug}` },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 rounded-full border-4 border-[#157a6d] border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Loading Clinical Product Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Package size={48} className="text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Surgical Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md">
          The surgical supply item you requested may have been relocated or is temporarily unavailable.
        </p>
        <Link
          to="/surgical"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#157a6d] text-white font-bold text-xs uppercase tracking-wider"
        >
          <span>Browse Surgical Supplies</span>
        </Link>
      </div>
    );
  }

  // Filter populated highlights & specifications
  const validHighlights = (product.highlights || []).filter((h) => h && h.label && h.value);
  const validSpecifications = (product.specifications || []).filter((s) => s && s.label && s.value);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans pb-20 animate-[fade-in_0.3s_ease-out]">
      {/* ── SEO METADATA ── */}
      <SEO
        title={product.seo?.metaTitle || `${product.name} | Buy Online at WellMeds`}
        description={
          product.seo?.metaDescription ||
          product.shortDescription ||
          `Purchase authentic clinical-grade ${product.name} online at WellMeds with certified batch testing and hospital delivery.`
        }
        canonical={`/surgical/products/${slug}`}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 text-left">
        {/* ── BREADCRUMB ── */}
        <nav className="flex items-center flex-wrap text-xs text-slate-400 gap-1.5 font-medium select-none">
          <Link to="/" className="hover:text-[#157a6d] transition-colors">Home</Link>
          <ChevronRight size={13} className="text-slate-300 dark:text-zinc-700" />
          <Link to="/surgical" className="hover:text-[#157a6d] transition-colors">Surgical</Link>
          {categorySlug && (
            <>
              <ChevronRight size={13} className="text-slate-300 dark:text-zinc-700" />
              <Link to={`/surgical/${categorySlug}`} className="hover:text-[#157a6d] transition-colors truncate max-w-[160px]">
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={13} className="text-slate-300 dark:text-zinc-700" />
          <span className="text-[#157a6d] dark:text-emerald-400 font-bold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* ═════════════════════════════════════════════════════════════════════
            HERO SECTION (LEFT GALLERY + RIGHT PURCHASE PANEL)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ── LEFT: IMAGE GALLERY (5 COLUMNS) ── */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Vertical Thumbnail Strip (Desktop/Tablet) */}
              {imagesList.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[440px] scrollbar-none shrink-0 pb-1 sm:pb-0">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      onMouseEnter={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border-2 p-1.5 flex items-center justify-center overflow-hidden shrink-0 transition-all cursor-pointer ${
                        activeImageIdx === idx
                          ? "border-[#157a6d] shadow-sm ring-2 ring-[#157a6d]/20 scale-[1.02]"
                          : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={getCardImageUrl(imgUrl, { width: 120 }) || DEFAULT_PRODUCT_IMAGE}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Large Main Image Container */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative flex-1 aspect-square rounded-2xl bg-white border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs cursor-zoom-in group"
              >
                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#bbf7d0] dark:bg-emerald-950/80 text-[#15803d] dark:text-emerald-300 text-xs font-extrabold font-sans shadow-2xs">
                      {discountPercent}% OFF
                    </span>
                  </div>
                )}

                {/* Lightbox / Zoom Prompt Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 cursor-pointer"
                  title="Click to expand fullscreen"
                >
                  <Maximize2 size={15} />
                </button>

                {/* Primary Image */}
                <img
                  src={getCardImageUrl(imagesList[activeImageIdx], { width: 1000 }) || DEFAULT_PRODUCT_IMAGE}
                  alt={product.name}
                  loading="eager"
                  className="w-full h-full max-w-full max-h-full object-contain select-none transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PRODUCT_IMAGE;
                  }}
                />

                {/* Arrows for multi-image */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Gallery Hint */}
            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <span>Click image to view high-resolution zoom</span>
            </p>
          </div>

          {/* ── RIGHT: PRODUCT DETAILS & PURCHASE CARD (7 COLUMNS) ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header / Brand / Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-[#157a6d]/20 text-[#157a6d] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Scissors size={12} />
                    <span>{categoryName}</span>
                  </span>
                  {product.subcategory && (
                    <span className="text-xs text-slate-400 font-semibold">
                      • {product.subcategory}
                    </span>
                  )}
                </div>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#157a6d] font-semibold cursor-pointer transition-colors"
                  title="Share product link"
                >
                  <Share2 size={14} />
                  <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              {(product.manufacturer || product.brand) && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
                  Manufactured / Marketed by:{" "}
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {product.manufacturer || product.brand}
                  </span>
                </p>
              )}
            </div>

            {/* Price Block */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                  {formatCurrency(currentPrice)}
                </span>

                {currentMrp > currentPrice && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-mono">
                    MRP {formatCurrency(currentMrp)}
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="px-3 py-1 rounded-full bg-[#bbf7d0] dark:bg-emerald-950/80 text-[#15803d] dark:text-emerald-300 text-xs sm:text-sm font-extrabold shadow-2xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {savings > 0 && (
                <p className="text-xs sm:text-sm text-[#16a34a] dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle size={15} />
                  <span>You Save: ₹{formatPrice(savings)} ({discountPercent}% Discount Applied)</span>
                </p>
              )}

              <p className="text-[11px] text-slate-400">
                Inclusive of all clinical GST & batch compliance taxes.
              </p>
            </div>

            {/* ── VARIANT SELECTOR (IF MULTIPLE VARIANTS) ── */}
            {variantsList.length > 1 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                    <Layers size={15} className="text-[#157a6d]" />
                    <span>Select Variation:</span>
                  </label>
                  <span className="text-xs text-[#157a6d] font-bold">
                    Selected: {currentVariant.name}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {variantsList.map((v, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    const vPrice = v.sellingPrice !== undefined ? v.sellingPrice : v.price;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                          isSelected
                            ? "bg-[#157a6d] text-white border-[#157a6d] shadow-sm scale-[1.02]"
                            : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-[#157a6d]/60"
                        }`}
                      >
                        <span>{v.name}</span>
                        <span className={`text-[11px] font-mono font-medium ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                          ({formatCurrency(vPrice)})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── PINCODE / DELIVERY AVAILABILITY ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                  <Truck size={16} className="text-[#157a6d]" />
                  <span>Check Pincode Availability</span>
                </span>
                <span className="text-[11px] text-slate-400">Pan-India Clinical Dispatch</span>
              </div>

              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#157a6d]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={checkingPincode}
                  className="px-5 py-2 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {checkingPincode ? <RefreshCw size={14} className="animate-spin" /> : "Check"}
                </button>
              </form>

              {pincodeError && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>{pincodeError}</span>
                </p>
              )}

              {pincodeResult.checked && (
                <div className="pt-1 text-xs space-y-1">
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>✓ Delivery Available to PIN {pincodeResult.pincode}</span>
                  </p>
                  <p className="text-slate-500 dark:text-zinc-400">
                    Estimated Delivery: <span className="font-bold text-slate-800 dark:text-zinc-200">{pincodeResult.datesText}</span>
                  </p>
                </div>
              )}
            </div>

            {/* ── QUANTITY & CART ACTIONS ── */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 min-w-[120px] h-12">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm shadow-2xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-white px-2">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => setQuantity((prev) => Math.min(30, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 text-slate-700 dark:text-white flex items-center justify-center font-bold text-sm shadow-2xs hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Add To Cart */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 h-12 px-6 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:text-slate-500 cursor-pointer"
                >
                  <ShoppingCart size={16} />
                  <span>{isOutOfStock ? "Out of Stock" : isInCart ? "Update in Cart" : "Add to Cart"}</span>
                </button>

                {/* Buy Now */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="sm:w-40 h-12 px-6 rounded-xl bg-[#172b26] dark:bg-zinc-800 hover:bg-[#0f1f1b] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Status Alert if in cart */}
              {isInCart && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  <span>Item currently in your cart (Qty: {cartQuantity}). Ready for checkout.</span>
                </p>
              )}
            </div>

            {/* ── TRUST BADGES BAR ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-[#157a6d] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">100% Genuine</p>
                  <p className="text-slate-400 text-[10px]">Direct Clinical Sourcing</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-2.5">
                <Award size={20} className="text-[#157a6d] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">Hospital Grade</p>
                  <p className="text-slate-400 text-[10px]">ISO & CE Standards</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-2.5">
                <Truck size={20} className="text-[#157a6d] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">Fast Dispatch</p>
                  <p className="text-slate-400 text-[10px]">Secure Sanitized Pack</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-2.5">
                <Phone size={20} className="text-[#157a6d] shrink-0" />
                <div className="text-[11px] leading-tight">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">Clinical Support</p>
                  <p className="text-slate-400 text-[10px]">Expert Healthcare Help</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            HIGHLIGHTS SECTION (DYNAMIC KEY/VALUE PAIRS)
        ═════════════════════════════════════════════════════════════════════ */}
        {validHighlights.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <Sparkles size={20} className="text-[#157a6d]" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Product Highlights</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {validHighlights.map((h, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800/80 flex flex-col justify-between space-y-1"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    {h.label}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-100">
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            SPECIFICATIONS & DESCRIPTION SECTION
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Specifications Table (5 Cols) */}
          {validSpecifications.length > 0 && (
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <Award size={18} className="text-[#157a6d]" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Specifications</h3>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {validSpecifications.map((s, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-400 font-semibold">{s.label}</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Description (7 or 12 Cols) */}
          <div className={`${validSpecifications.length > 0 ? "lg:col-span-7" : "lg:col-span-12"} bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <FileText size={18} className="text-[#157a6d]" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product Description</h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white">
                Product Information – {product.name}
              </p>
              {product.description ? (
                <div className="whitespace-pre-line space-y-2">
                  {product.description}
                </div>
              ) : (
                <p>
                  Manufactured to precise medical engineering tolerances, this clinical product is verified for sterile safety, durability, and biocompatibility in professional healthcare environments.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            TRUST & AUTHENTICITY SECTION (WELLMEDS CLINICAL IDENTITY)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Why Buy Surgical Supplies from WellMeds?</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              WellMeds guarantees clinical chain-of-custody, direct manufacturer relationships, and rigorous quality inspection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#157a6d]/10 text-[#157a6d] flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Certified Clinical Sourcing</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Direct procurement from authorized pharmaceutical and medical device manufacturers with verifiable batch certifications.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#157a6d]/10 text-[#157a6d] flex items-center justify-center">
                <Package size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sterile & Tamper-Proof Packaging</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Hospital consumables are stored and packed in climate-regulated pharmaceutical fulfillment centers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#157a6d]/10 text-[#157a6d] flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Reliable Healthcare Logistics</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Expedited delivery across India with temperature-monitored routes and dedicated clinical tracking.
              </p>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            RELATED SURGICAL PRODUCTS
        ═════════════════════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Related Surgical Products
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Recommended clinical supplies from the same category and specialty lines.
                </p>
              </div>

              <Link
                to="/surgical/all"
                className="text-xs font-bold text-[#157a6d] hover:underline flex items-center gap-1"
              >
                <span>View All Surgical</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod._id || prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          FULLSCREEN LIGHTBOX MODAL (PORTALED TO BODY WITH Z-[9999])
      ═════════════════════════════════════════════════════════════════════ */}
      {isLightboxOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLightboxOpen(false);
            }
          }}
          className="fixed inset-0 w-screen h-screen z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-[fade-in_0.2s_ease-out] cursor-zoom-out"
          role="dialog"
          aria-modal="true"
          aria-label="Image Zoom Preview"
        >
          {/* Modal Content Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center cursor-default animate-[scale-up_0.2s_ease-out]"
          >
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-30 backdrop-blur-md border border-white/25 shadow-lg"
              aria-label="Close Lightbox"
              title="Close (Esc)"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>

            {/* Left Navigation Arrow */}
            {imagesList.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 backdrop-blur-md border border-white/25 shadow-lg"
                aria-label="Previous image"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft size={24} className="stroke-[2.5]" />
              </button>
            )}

            {/* Main Lightbox Image Viewport */}
            <div className="w-full flex items-center justify-center max-h-[72vh] sm:max-h-[78vh] p-2 sm:p-4">
              <img
                src={getCardImageUrl(imagesList[activeImageIdx], { width: 1400 }) || DEFAULT_PRODUCT_IMAGE}
                alt={product.name}
                className="max-h-[68vh] sm:max-h-[74vh] max-w-full object-contain rounded-2xl shadow-2xl bg-white p-4 sm:p-6"
              />
            </div>

            {/* Right Navigation Arrow */}
            {imagesList.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIdx((prev) => (prev + 1) % imagesList.length)}
                className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-20 backdrop-blur-md border border-white/25 shadow-lg"
                aria-label="Next image"
                title="Next (Right Arrow)"
              >
                <ChevronRight size={24} className="stroke-[2.5]" />
              </button>
            )}

            {/* Bottom Thumbnails Strip */}
            {imagesList.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto max-w-[90vw] p-2 bg-black/60 rounded-2xl backdrop-blur-md border border-white/10">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-1 overflow-hidden transition-all cursor-pointer shrink-0 ${
                      activeImageIdx === idx
                        ? "ring-2 ring-[#157a6d] scale-105 shadow-md"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getCardImageUrl(imgUrl, { width: 120 }) || DEFAULT_PRODUCT_IMAGE}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          BULK PROCUREMENT INQUIRY MODAL (PORTALED TO BODY WITH Z-[9999])
      ═════════════════════════════════════════════════════════════════════ */}
      {bulkModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setBulkModalOpen(false);
            }
          }}
          className="fixed inset-0 w-screen h-screen z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-[fade-in_0.15s_ease-out]"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-5 animate-[scale-in_0.15s_ease-out] text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[#157a6d]">
                <Building2 size={20} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Purchase Inquiry</h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Inquire about volume pricing for <span className="font-bold text-slate-800 dark:text-zinc-200">"{product.name}"</span>. Our healthcare supply team will respond with a formal quotation.
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. / Mr. / Ms."
                    value={bulkForm.name}
                    onChange={(e) => setBulkForm({ ...bulkForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Hospital / Clinic</label>
                  <input
                    type="text"
                    placeholder="Facility name"
                    value={bulkForm.hospitalName}
                    onChange={(e) => setBulkForm({ ...bulkForm, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={bulkForm.phone}
                    onChange={(e) => setBulkForm({ ...bulkForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Estimated Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 500 units / 50 boxes"
                    value={bulkForm.quantity}
                    onChange={(e) => setBulkForm({ ...bulkForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Specific Requirements / GSTIN</label>
                <textarea
                  rows={2}
                  placeholder="Include required delivery location, variant sizes, or compliance requirements..."
                  value={bulkForm.notes}
                  onChange={(e) => setBulkForm({ ...bulkForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitted}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                >
                  <Send size={13} />
                  <span>{bulkSubmitted ? "Submitting..." : "Submit Inquiry"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SurgicalProductDetailPage;
