import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import SEO from "../components/common/SEO";
import { calculateDeliveryDates } from "../components/ProductDetail/ProductDeliveryCheck";
import { calculateDiscountPercent, formatPrice } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import { getCardImageUrl } from "../utils/image";
import { BUSINESS_INFO, getWhatsAppLink } from "../config/businessInfo";
import {
  ChevronRight,
  ChevronLeft,
  X,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Package,
  Building2,
  Share2,
  Maximize2,
  MapPin,
  RefreshCw,
  Send,
  AlertCircle,
  Lock,
  RotateCcw,
  Tag,
  ArrowRight
} from "lucide-react";

const SurgicalProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCart();

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

  // Related products carousel ref & navigation
  const carouselRef = useRef(null);
  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };
  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

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
      return product.variants.map((v, idx) => {
        if (typeof v === "string") {
          const strName = v.trim();
          return {
            name: strName || `Option ${idx + 1}`,
            sellingPrice: product.price || 0,
            mrp: product.originalPrice || product.price || 0,
            stock: product.stock !== undefined ? product.stock : 99,
          };
        }
        const resolvedName = (
          v.name ||
          v.variantName ||
          v.title ||
          v.label ||
          v.size ||
          v.value ||
          v.option ||
          v.packSize ||
          v.type ||
          v.sku ||
          `Option ${idx + 1}`
        );
        return {
          ...v,
          name: String(resolvedName).trim() || `Option ${idx + 1}`,
          sellingPrice: v.sellingPrice !== undefined && v.sellingPrice !== null ? Number(v.sellingPrice) : (v.price !== undefined && v.price !== null ? Number(v.price) : product.price || 0),
          mrp: v.mrp !== undefined && v.mrp !== null ? Number(v.mrp) : (product.originalPrice || product.price || 0),
          stock: v.stock !== undefined ? Number(v.stock) : 99,
        };
      });
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

  // Direct WhatsApp Bulk Pricing URL
  const bulkWhatsAppUrl = useMemo(() => {
    if (!product) return BUSINESS_INFO.whatsappUrl;
    const variantInfo = currentVariant?.name && currentVariant.name !== "Standard" ? ` (Variant: ${currentVariant.name})` : "";
    const msg = `Hi WellMeds, I would like to inquire about bulk / institutional pricing for "${product.name}"${variantInfo}. Please share your best wholesale quote and available quantities.`;
    return getWhatsAppLink(msg);
  }, [product, currentVariant]);

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
          limit: 16,
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

        setRelatedProducts([...sameCategory, ...others].slice(0, 12));
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
      setPincodeError("Please enter a valid 6-digit PIN code");
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
      } catch { }
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#157a6d] border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Loading Product Details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white">
        <SEO title="Surgical Product Not Found — WellMeds" noindex={true} canonical="/surgical" />
        <Package size={48} className="text-slate-400" />
        <h2 className="text-2xl font-bold text-slate-900">Surgical Product Not Found</h2>
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

  // Filter populated specifications
  const validSpecifications = (product.specifications || []).filter((s) => s && s.label && s.value);
  const brandOrManufacturer = product.manufacturer || product.brand || "WellMeds";

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 text-left">
        {/* ── BREADCRUMB ── */}
        <nav className="flex items-center flex-wrap text-xs text-slate-400 gap-1.5 font-medium select-none">
          <Link to="/" className="hover:text-[#157a6d] transition-colors">Home</Link>
          <ChevronRight size={13} className="text-slate-300" />
          <Link to="/surgical" className="hover:text-[#157a6d] transition-colors">Surgical</Link>
          {categorySlug && (
            <>
              <ChevronRight size={13} className="text-slate-300" />
              <Link to={`/surgical/${categorySlug}`} className="hover:text-[#157a6d] transition-colors truncate max-w-[160px]">
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={13} className="text-slate-300" />
          <span className="text-slate-600 font-semibold truncate max-w-[220px] sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* ═════════════════════════════════════════════════════════════════════
            HERO SECTION: SIMPLE CLEAN LAYOUT (NO CARDS, WHITE BG)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ── LEFT: IMAGE GALLERY (5 COLUMNS) ── */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              {/* Vertical Thumbnail Strip (Desktop/Tablet) */}
              {imagesList.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[440px] scrollbar-none shrink-0 pb-1 sm:pb-0">
                  {imagesList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      onMouseEnter={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-white border p-1 flex items-center justify-center overflow-hidden shrink-0 transition-all cursor-pointer ${activeImageIdx === idx
                          ? "border-[#157a6d] ring-1 ring-[#157a6d]"
                          : "border-slate-200 hover:border-slate-300"
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

              {/* Large Main Image Display */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative flex-1 aspect-square rounded-xl bg-white border border-slate-200/80 p-6 sm:p-8 flex items-center justify-center overflow-hidden cursor-zoom-in group"
              >
                {/* Lightbox Trigger Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 border border-slate-200 text-slate-600 shadow-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 cursor-pointer"
                  title="Click to view full image"
                >
                  <Maximize2 size={14} />
                </button>

                {/* Main Product Image */}
                <img
                  src={getCardImageUrl(imagesList[activeImageIdx], { width: 1000 }) || DEFAULT_PRODUCT_IMAGE}
                  alt={product.name}
                  loading="eager"
                  className="w-full h-full max-w-full max-h-full object-contain select-none transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_PRODUCT_IMAGE;
                  }}
                />

                {/* Left/Right arrow controls on hover */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: PRODUCT DETAILS (CLEAN TYPOGRAPHY, MATCHING REFERENCE) ── */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* 2. By Brand / Manufacturer */}
            <p className="text-sm font-medium text-slate-700">
              By <span className="text-[#0284c7] font-semibold hover:underline cursor-pointer">{brandOrManufacturer}</span>
            </p>

            {/* 3. Price Row */}
            <div className="flex items-baseline gap-3 flex-wrap pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                ₹{formatPrice(currentPrice)}
              </span>

              {currentMrp > currentPrice && (
                <span className="text-base sm:text-lg text-slate-500 line-through">
                  MRP ₹{formatPrice(currentMrp)}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="text-sm sm:text-base font-bold text-[#0284c7]">
                  ({discountPercent}% OFF)
                </span>
              )}
            </div>

            {/* 5. Trust Features Bar (Blue outline icons matching reference) */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap py-2 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={18} className="text-[#0284c7]" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={18} className="text-[#0284c7]" />
                <span>Pan India Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={16} className="text-[#0284c7]" />
                <span>Safe Payment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw size={16} className="text-[#0284c7]" />
                <span>7 Days Return</span>
              </div>
            </div>

            {/* 6. Variation Selector (WellMeds Theme Pill Buttons) */}
            {variantsList.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Variation:</span>
                  <span className="text-xs font-bold text-[#157a6d]">
                    {currentVariant?.name || ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {variantsList.map((v, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    const displayName = v.name || `Option ${idx + 1}`;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
                        className={`min-w-[80px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 text-center select-none ${isSelected
                            ? "bg-[#ecfdf5] text-[#0f3b34] border-[#157a6d] shadow-sm ring-2 ring-[#157a6d]/20"
                            : "bg-white text-slate-700 border-slate-200 hover:border-[#157a6d]/40 hover:text-slate-900 shadow-2xs"
                          }`}
                      >
                        <span>{displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. Buying in Bulk? (WellMeds Brand Theme Card) */}
            <div className="rounded-2xl border-2 border-[#157a6d]/25 bg-gradient-to-br from-[#f0fdf4]/70 via-white to-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#157a6d]/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Buying in bulk?
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-xs">
                    <Tag size={13} className="fill-[#15803d]" />
                    <span>Get better prices</span>
                  </span>
                </div>

                <div className="space-y-1 text-xs sm:text-sm font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#16a34a] shrink-0" />
                    <span>Purchase in Bulk Quantity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#16a34a] shrink-0" />
                    <span>Best Prices for your business</span>
                  </div>
                </div>
              </div>

              <a
                href={bulkWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#157a6d] bg-white text-[#157a6d] hover:bg-[#157a6d] hover:text-white font-bold text-sm transition-all shadow-xs group shrink-0 cursor-pointer"
              >
                <span>Explore Bulk Pricing</span>
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* 8. Purchase & Delivery Section: Check delivery on LEFT, Cart & Buy on RIGHT */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* LEFT: Check Delivery Pincode */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#157a6d]" />
                  <span>Check Delivery Pincode:</span>
                </span>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit PIN"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#157a6d] focus:ring-1 focus:ring-[#157a6d]"
                  />
                  <button
                    type="submit"
                    disabled={checkingPincode}
                    className="px-4 py-2.5 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {checkingPincode ? <RefreshCw size={14} className="animate-spin" /> : "Check"}
                  </button>
                </form>

                {pincodeError && (
                  <p className="text-xs text-red-500 font-semibold">{pincodeError}</p>
                )}

                {pincodeResult.checked && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="text-emerald-600 font-bold">✓ Delivery Available</span> to {pincodeResult.pincode} • <span className="font-semibold text-slate-800">{pincodeResult.datesText}</span>
                  </p>
                )}
              </div>

              {/* RIGHT: Quantity + Add to Cart + Buy Now */}
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Quantity &amp; Order:</span>
                  {isInCart && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle size={13} />
                      <span>{cartQuantity} in cart</span>
                    </span>
                  )}
                </div>

                <div className="flex items-stretch gap-2">
                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between border border-slate-200 rounded-xl px-2 py-1 min-w-[96px] h-11 bg-slate-50 shrink-0">
                    <button
                      type="button"
                      disabled={quantity <= 1 || isOutOfStock}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="font-mono font-bold text-sm text-slate-900 px-1.5">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setQuantity((prev) => Math.min(30, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Add To Cart */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className="flex-1 h-11 px-3 rounded-xl bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer text-center"
                  >
                    <ShoppingCart size={15} className="shrink-0" />
                    <span className="truncate">{isOutOfStock ? "Out of Stock" : isInCart ? "Update in Cart" : "Add to Cart"}</span>
                  </button>

                  {/* Buy Now */}
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className="w-28 sm:w-32 h-11 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center shadow-xs transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>

                {/* Institutional / Bulk inquiry & Share */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setBulkModalOpen(true)}
                    className="text-[#157a6d] hover:underline font-bold flex items-center gap-1 cursor-pointer truncate mr-2"
                  >
                    <Building2 size={13} className="shrink-0" />
                    <span className="truncate">Inquire for Hospital Pricing</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="text-slate-500 hover:text-[#157a6d] font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Share2 size={13} />
                    <span>{copiedLink ? "Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            SPECIFICATIONS & DESCRIPTION (CLEAN TEXT SECTIONS, NO BOXED CARDS)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Specifications (5 Columns) */}
          {validSpecifications.length > 0 && (
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 pb-2.5 border-b border-slate-200">
                Technical Specifications
              </h3>
              <div className="divide-y divide-slate-100 text-sm sm:text-[15px]">
                {validSpecifications.map((s, idx) => (
                  <div key={idx} className="py-3 flex justify-between gap-4">
                    <span className="text-slate-500 font-medium">{s.label}</span>
                    <span className="font-bold text-slate-900 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Description (7 or 12 Columns) */}
          <div className={`${validSpecifications.length > 0 ? "lg:col-span-7" : "lg:col-span-12"} space-y-4`}>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 pb-2.5 border-b border-slate-200">
              Product Description
            </h3>
            <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line space-y-3">
              {product.description ? (
                product.description
              ) : (
                <p>
                  Manufactured to precise medical engineering tolerances, this clinical product is verified for sterile safety, durability, and biocompatibility in professional healthcare environments.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            WHY BUY FROM WELLMEDS (CLEAN UNBOXED TRUST SECTION)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="pt-8 border-t border-slate-200 space-y-5">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">Why Buy Surgical Supplies from WellMeds?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm sm:text-base">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#157a6d] shrink-0" />
                <span>Certified Clinical Sourcing</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Direct procurement from authorized pharmaceutical and medical device manufacturers with batch certifications.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-[#157a6d] shrink-0" />
                <span>Sterile &amp; Tamper-Proof Packaging</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Hospital consumables stored and packed in climate-regulated pharmaceutical fulfillment centers.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Truck size={18} className="text-[#157a6d] shrink-0" />
                <span>Reliable Healthcare Logistics</span>
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                Expedited delivery across India with temperature-monitored routes and dedicated clinical tracking.
              </p>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            RELATED SURGICAL PRODUCTS (CAROUSEL WITH ARROWS & VIEW ALL)
        ═════════════════════════════════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <div className="space-y-5 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Related Surgical Products
              </h3>

              <div className="flex items-center gap-3">
                {/* Arrow navigation buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleScrollLeft}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
                    aria-label="Previous products"
                    title="Previous"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleScrollRight}
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
                    aria-label="Next products"
                    title="Next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* View All button */}
                <Link
                  to="/surgical/all"
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:border-[#157a6d] bg-white text-xs sm:text-sm font-bold text-[#157a6d] hover:bg-[#157a6d] hover:text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>View All Surgical</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* Horizontal Carousel */}
            <div
              ref={carouselRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 snap-x snap-mandatory scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {relatedProducts.map((prod) => (
                <div
                  key={prod._id || prod.id}
                  className="w-[240px] sm:w-[270px] md:w-[285px] shrink-0 snap-start"
                >
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          FULLSCREEN LIGHTBOX MODAL
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
                className="max-h-[68vh] sm:max-h-[74vh] max-w-full object-contain rounded-xl shadow-2xl bg-white p-4 sm:p-6"
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
              <div className="mt-3 flex items-center gap-2 overflow-x-auto max-w-[90vw] p-2 bg-black/60 rounded-xl backdrop-blur-md border border-white/10">
                {imagesList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white p-1 overflow-hidden transition-all cursor-pointer shrink-0 ${activeImageIdx === idx
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
          BULK PROCUREMENT INQUIRY MODAL
      ═════════════════════════════════════════════ */}
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
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-[scale-in_0.15s_ease-out] text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#157a6d]">
                <Building2 size={20} />
                <h3 className="text-lg font-bold text-slate-900">Bulk Purchase Inquiry</h3>
              </div>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Inquire about volume pricing for <span className="font-bold text-slate-800">"{product.name}"</span>. Our healthcare supply team will respond with a formal quotation.
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. / Mr. / Ms."
                    value={bulkForm.name}
                    onChange={(e) => setBulkForm({ ...bulkForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Hospital / Clinic</label>
                  <input
                    type="text"
                    placeholder="Facility name"
                    value={bulkForm.hospitalName}
                    onChange={(e) => setBulkForm({ ...bulkForm, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={bulkForm.phone}
                    onChange={(e) => setBulkForm({ ...bulkForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Estimated Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 500 units / 50 boxes"
                    value={bulkForm.quantity}
                    onChange={(e) => setBulkForm({ ...bulkForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Specific Requirements / GSTIN</label>
                <textarea
                  rows={2}
                  placeholder="Include required delivery location, variant sizes, or compliance requirements..."
                  value={bulkForm.notes}
                  onChange={(e) => setBulkForm({ ...bulkForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitted}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
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
