import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import PrescriptionUpload from "../components/PrescriptionUpload";
import { formatCurrency } from "../utils/currency";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Share2, 
  FileText, 
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Award,
  Truck,
  RotateCcw,
  Lock,
  Package,
  Calendar,
  Check,
  Building,
  Tag,
  Dna,
  Barcode,
  Hash,
  Activity,
  UserCheck,
  Clock,
  Thermometer,
  Hourglass,
  Zap,
  X,
  Maximize2
} from "lucide-react";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

  const [rxUploadOpen, setRxUploadOpen] = useState(false);
  const [localRxFile, setLocalRxFile] = useState(null);

  // Accordion state for FAQs
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // Active section for sticky navigation
  const [activeSection, setActiveSection] = useState("");
  const sectionRefs = useRef({});

  // Fullscreen preview and image loading state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Swipe gesture states for mobile gallery
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const imagesList = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0 ? product.images : [product.image];
  }, [product]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prod = await api.getProduct(slug);
        setProduct(prod);
        setActiveImageIdx(0);
        setQuantity(1);
        setLocalRxFile(null);
        
        // Fetch all products to calculate similar and related
        const allProds = await api.getProductsList();
        
        // Related products: from product.relatedProducts or fallback to same brand
        if (prod.relatedProducts && prod.relatedProducts.length > 0) {
          setRelatedProducts(prod.relatedProducts);
        } else {
          const related = allProds.filter(p => p.brand === prod.brand && p.slug !== prod.slug).slice(0, 4);
          setRelatedProducts(related);
        }

        // Similar products: same category
        const prodCatId = prod.category?._id || prod.category;
        const similar = allProds.filter(p => {
          const pCatId = p.category?._id || p.category;
          return pCatId && prodCatId && pCatId.toString() === prodCatId.toString() && p.slug !== prod.slug;
        }).slice(0, 4);
        setSimilarProducts(similar);

        // Update recently viewed in localStorage
        try {
          const recent = JSON.parse(localStorage.getItem("wellmeds_recently_viewed") || "[]");
          const filtered = recent.filter(p => p.slug !== prod.slug);
          filtered.unshift({
            id: prod.id || prod._id,
            _id: prod.id || prod._id,
            name: prod.name,
            brand: prod.brand,
            price: prod.price,
            originalPrice: prod.originalPrice,
            image: prod.image,
            slug: prod.slug,
            requiresRx: prod.requiresRx,
            badge: prod.badge
          });
          const sliced = filtered.slice(0, 5);
          localStorage.setItem("wellmeds_recently_viewed", JSON.stringify(sliced));
          setRecentlyViewed(sliced.filter(p => p.slug !== prod.slug));
        } catch (e) {
          console.warn("Failed to update recently viewed:", e);
        }
      } catch (err) {
        console.error("Product fetch failed", err);
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug, navigate]);

  // Reset image loading state on image change
  useEffect(() => {
    setIsImageLoading(true);
  }, [activeImageIdx, slug]);

  // --- SEO & Schema.org JSON-LD Injector ---
  useEffect(() => {
    if (!product) return;

    // 1. Meta Title
    document.title = product.seo?.metaTitle || `${product.name} - Buy Online | WellMeds`;

    // 2. Meta Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", product.seo?.metaDescription || `Order ${product.name} online from WellMeds. Licensed pharmacist verification, 100% genuine medicines, and fast delivery.`);

    // 3. Meta Keywords
    let metaKeywords = document.querySelector("meta[name='keywords']");
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", product.seo?.keywords || `${product.name}, ${product.brand}, buy ${product.name} online, WellMeds`);

    // 4. Canonical Link
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", product.seo?.canonicalUrl || window.location.href);

    // 5. OpenGraph & Twitter Tags
    const ogTags = {
      "og:title": product.seo?.metaTitle || product.name,
      "og:description": product.seo?.metaDescription || `Order ${product.name} online from WellMeds.`,
      "og:image": product.seo?.ogImage || product.image,
      "og:url": window.location.href,
      "og:type": "product",
      "twitter:card": "summary_large_image",
      "twitter:title": product.seo?.metaTitle || product.name,
      "twitter:description": product.seo?.metaDescription || `Order ${product.name} online from WellMeds.`
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property='${property}']`) || document.querySelector(`meta[name='${property}']`);
      if (!tag) {
        tag = document.createElement("meta");
        if (property.startsWith("og:")) {
          tag.setAttribute("property", property);
        } else {
          tag.setAttribute("name", property);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // 6. Schema.org JSON-LD Structured Data
    const faqSchemaList = (product.faqs || []).map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": `${window.location.origin}/products/${product.slug}#product`,
          "name": product.name,
          "image": product.images && product.images.length > 0 ? product.images : [product.image],
          "description": product.seo?.metaDescription || product.description,
          "sku": product.sku,
          "brand": {
            "@type": "Brand",
            "name": product.brand
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": window.location.href,
            "seller": {
              "@type": "Organization",
              "name": "WellMeds"
            }
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${window.location.origin}/products/${product.slug}#breadcrumb`,
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
              "name": "Products",
              "item": `${window.location.origin}/products`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": product.category?.name || product.category,
              "item": `${window.location.origin}/category/${product.category?.slug || product.category}`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": product.name,
              "item": window.location.href
            }
          ]
        }
      ]
    };

    if (faqSchemaList.length > 0) {
      jsonLd["@graph"].push({
        "@type": "FAQPage",
        "@id": `${window.location.origin}/products/${product.slug}#faq`,
        "mainEntity": faqSchemaList
      });
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    script.id = "wellmeds-jsonld";
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById("wellmeds-jsonld");
      if (existingScript) existingScript.remove();
    };
  }, [product]);

  // --- Scroll Spy for Sticky Sidebar ---
  useEffect(() => {
    if (loading || !product) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let active = "";

      Object.entries(sectionRefs.current).forEach(([id, ref]) => {
        if (ref && ref.offsetTop <= scrollPosition) {
          active = id;
        }
      });

      if (active) setActiveSection(active);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, product]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    if (product.requiresRx && !localRxFile) {
      setRxUploadOpen(true);
      return;
    }
    addToCart({ ...product, rxUploaded: !!localRxFile, rxFile: localRxFile }, quantity);
    toast.success(`${quantity} item(s) added to cart.`);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    if (product.requiresRx && !localRxFile) {
      setRxUploadOpen(true);
      return;
    }
    addToCart({ ...product, rxUploaded: !!localRxFile, rxFile: localRxFile }, quantity);
    navigate("/cart");
  };

  const handleRxSuccess = (data) => {
    setLocalRxFile(data.fileName);
    setRxUploadOpen(false);
    addToCart({ ...product, rxUploaded: true, rxFile: data.fileName }, quantity);
    toast.success(`${quantity} prescription item(s) added to cart.`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  // Image Zoom Handlers
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${imagesList[activeImageIdx]})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  // Swipe gesture handlers for mobile image gallery
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && activeImageIdx < imagesList.length - 1) {
      setActiveImageIdx(prev => prev + 1);
    }
    if (isRightSwipe && activeImageIdx > 0) {
      setActiveImageIdx(prev => prev - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Compile Dynamic Content Sections
  const computedSections = useMemo(() => {
    if (!product) return [];
    
    const sections = product.medicalSections && product.medicalSections.length > 0
      ? [...product.medicalSections]
      : (product.description ? [{ title: "Overview", content: product.description }] : []);

    if (product.composition && product.composition.length > 0) {
      sections.push({ id: "composition", title: "Composition", type: "composition" });
    }
    if (product.benefits && product.benefits.length > 0) {
      sections.push({ id: "benefits", title: "Key Benefits", type: "benefits" });
    }
    if (product.usageInstructions && product.usageInstructions.length > 0) {
      sections.push({ id: "usage", title: "Usage Instructions", type: "usage" });
    }
    if (product.warnings && product.warnings.length > 0) {
      sections.push({ id: "warnings", title: "Warnings & Precautions", type: "warnings" });
    }
    if (product.sideEffects && product.sideEffects.length > 0) {
      sections.push({ id: "sideeffects", title: "Side Effects", type: "sideeffects" });
    }
    if (product.safetyCards && product.safetyCards.length > 0) {
      sections.push({ id: "safety", title: "Safety Information", type: "safety" });
    }
    if (product.faqs && product.faqs.length > 0) {
      sections.push({ id: "faqs", title: "FAQs", type: "faqs" });
    }
    if (product.specifications && product.specifications.length > 0) {
      sections.push({ id: "specifications", title: "Specifications", type: "specifications" });
    }
    if (product.references && product.references.length > 0) {
      sections.push({ id: "references", title: "Citations & References", type: "references" });
    }

    return sections.map((sec, idx) => ({
      ...sec,
      id: sec.id || `section-${idx}`,
    }));
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!product) return null;

  const favorited = isInWishlist(product.id || product._id);
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Render generic name or active ingredient
  const genericName = product.composition?.[0]?.ingredient || "N/A";

  return (
    <div className="max-w-[1550px] mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs */}
      <nav className="mb-lg text-xs font-semibold text-slate-400 dark:text-zinc-500 flex items-center gap-xs flex-wrap select-none">
        <Link to="/" className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">Products</Link>
        <span>/</span>
        <Link to={`/category/${product.category?.slug || product.category}`} className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">{product.category?.name || product.category}</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-zinc-300 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* SECTION 1: HERO */}
      <div className="flex flex-col lg:flex-row gap-xl mb-xl items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="w-full lg:w-[48%] space-y-md">
          <div 
            className="w-full aspect-square rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden border border-outline-variant/30 dark:border-outline/20 relative cursor-zoom-in flex items-center justify-center p-md shadow-md group/gallery"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => setIsFullscreenOpen(true)}
          >
            {isImageLoading && (
              <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950 animate-pulse flex items-center justify-center rounded-3xl z-10">
                <Loader size="sm" />
              </div>
            )}
            <img 
              alt={product.imagesData?.[activeImageIdx]?.alt || product.name} 
              title={product.imagesData?.[activeImageIdx]?.title || product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/gallery:scale-[1.03]" 
              src={imagesList[activeImageIdx]}
              onLoad={() => setIsImageLoading(false)}
            />
            {/* Image Counter */}
            <span className="absolute bottom-4 right-4 bg-slate-950/75 backdrop-blur-xs text-white font-bold text-[10px] px-3 py-1.5 rounded-full select-none">
              {activeImageIdx + 1} / {imagesList.length}
            </span>
            {/* Fullscreen Button */}
            <button
              type="button"
              className="absolute top-4 right-4 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black p-2 rounded-full shadow-md text-slate-700 dark:text-slate-300 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreenOpen(true);
              }}
            >
              <Maximize2 size={16} />
            </button>
            {/* Magnifier zoom portal (hidden on mobile touch) */}
            <div 
              className="absolute inset-0 pointer-events-none bg-no-repeat bg-white dark:bg-zinc-900 hidden md:block opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-350" 
              style={{
                ...zoomStyle,
                backgroundSize: "220%"
              }}
            />
          </div>

          {/* Thumbnail strip */}
          {imagesList.length > 1 && (
            <div className="flex gap-sm overflow-x-auto pb-xs scrollbar-none snap-x snap-mandatory">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border-2 p-sm flex items-center justify-center shrink-0 transition-all snap-start ${
                    activeImageIdx === idx 
                      ? "border-[#004782] dark:border-primary-fixed-dim scale-[1.03] shadow-xs" 
                      : "border-outline-variant/30 dark:border-outline/20 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column: Key Specifications & Clinical Badges */}
        <div className="flex-grow w-full lg:w-[28%] space-y-md">
          <div className="space-y-sm">
            {/* Badges */}
            <div className="flex flex-wrap gap-xs items-center">
              <span className="bg-[#004782]/10 text-primary dark:text-[#a4c9ff] text-[10px] font-black uppercase tracking-wider px-md py-[5px] rounded-full border border-primary/10 shadow-xs">
                {product.category?.name || product.category}
              </span>
              {product.requiresRx ? (
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-black uppercase tracking-wider px-md py-[5px] rounded-full flex items-center gap-1 shadow-xs select-none">
                  <ShieldCheck size={13} /> Rx Required
                </span>
              ) : (
                <span className="bg-[#086b53]/10 text-secondary dark:text-[#84d6b9] text-[10px] font-black uppercase tracking-wider px-md py-[5px] rounded-full flex items-center gap-1 shadow-xs select-none border border-[#086b53]/10">
                  OTC Medicine
                </span>
              )}
            </div>

            {/* Brand & Name */}
            <div>
              <p className="text-body-md text-[#004782] dark:text-[#a4c9ff] font-extrabold uppercase tracking-widest text-xs">
                {product.brand}
              </p>
              <h1 className="font-headline-md text-2xl md:text-3xl text-on-surface font-black leading-tight mt-1">
                {product.name}
              </h1>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold mt-1">
                Generic Name: <span className="text-slate-600 dark:text-zinc-300 italic">{genericName}</span>
              </p>
            </div>
          </div>

          {/* Compact Info Rows with Icons */}
          <div className="pt-md border-t border-outline-variant/30 dark:border-outline/20 space-y-xs text-xs">
            {[
              { label: "Brand", value: product.brand, icon: Tag },
              { label: "Manufacturer", value: product.specifications?.find(s => s.label.toLowerCase().includes("manufacturer") || s.label.toLowerCase().includes("mfg"))?.value || "Bayer Healthcare Ltd.", icon: Building },
              { label: "Generic Name", value: genericName, icon: Dna },
              { label: "SKU Code", value: product.sku || "N/A", icon: Barcode, isMono: true },
              { label: "Batch Info", value: "BY-0943A", icon: Hash, isMono: true },
              { label: "Expiry Date", value: "12/2028", icon: Calendar },
              { label: "Availability", value: product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} Left` : "Out of Stock", icon: Activity, isStock: true }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-850 last:border-b-0">
                  <span className="font-bold text-slate-400 flex items-center gap-xs">
                    <Icon size={14} className="text-slate-400" />
                    {item.label}
                  </span>
                  <span className={`font-bold text-right pl-sm ${
                    item.isStock 
                      ? (product.stock > 10 ? "text-[#086b53] dark:text-emerald-400" : "text-red-500") 
                      : (item.isMono ? "font-mono text-slate-700 dark:text-zinc-200" : "text-slate-700 dark:text-zinc-200")
                  }`}>
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Rx upload warning box if required */}
          {product.requiresRx && (
            <div className="bg-amber-500/[0.04] border border-amber-500/20 rounded-2xl p-md space-y-xs text-left">
              <div className="flex items-center gap-sm">
                <FileText size={18} className="text-amber-600" />
                <h4 className="font-bold text-xs text-amber-800 dark:text-amber-450">Prescription Verification Required</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal pl-7">
                A registered pharmacist will verify your prescription before this item is shipped.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Purchase Card (Desktop) */}
        <div className="w-full lg:w-[24%] lg:sticky lg:top-24 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 p-lg rounded-3xl shadow-lg space-y-lg text-xs">
          
          {/* Price Panel */}
          <div className="bg-slate-50/50 dark:bg-zinc-950/20 p-md rounded-2xl border border-slate-100 dark:border-zinc-850/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Price</span>
            <div className="flex items-baseline gap-xs mt-xs flex-wrap">
              <span className="text-3xl font-black text-[#004782] dark:text-primary-fixed-dim">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-slate-400 line-through text-xs font-semibold">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex flex-wrap gap-xs items-center mt-sm">
                <span className="bg-emerald-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  {discountPercent}% OFF
                </span>
                <span className="text-[10px] font-bold text-[#086b53] dark:text-emerald-400">
                  Save {formatCurrency(product.originalPrice - product.price)}
                </span>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-sm font-medium">Inclusive of all taxes & GST</p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-sm">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Quantity</span>
              <div className="flex items-center border border-outline-variant/50 dark:border-outline rounded-2xl bg-slate-50/50 dark:bg-zinc-905 h-11 w-full justify-between p-1">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 outline-none rounded-xl cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-extrabold text-sm text-on-surface">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 outline-none rounded-xl cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
          )}

          {/* Checkout / ATC Buttons */}
          <div className="space-y-sm pt-xs">
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full bg-[#086b53] hover:bg-[#055746] text-white font-bold h-11 rounded-2xl transition-all hover:shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm outline-none cursor-pointer text-xs shadow-sm"
            >
              Buy Now
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full border-2 border-[#004782] text-[#004782] dark:text-[#a4c9ff] dark:border-[#a4c9ff]/50 hover:bg-[#004782]/5 font-bold h-11 rounded-2xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm outline-none cursor-pointer text-xs"
            >
              Add to Cart
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-sm border-t border-slate-100 dark:border-zinc-850 pt-md">
            <button
              onClick={() => toggleWishlist(product)}
              className="flex-1 border border-outline-variant/50 dark:border-outline rounded-xl py-2 flex items-center justify-center gap-xs hover:bg-slate-50 dark:hover:bg-zinc-900 active:scale-95 transition-all outline-none cursor-pointer text-[10px] font-bold"
            >
              <Heart size={14} className={favorited ? "text-red-500 fill-red-500" : "text-slate-400"} />
              {favorited ? "Wishlisted" : "Wishlist"}
            </button>

            <button
              onClick={handleShare}
              className="flex-1 border border-outline-variant/50 dark:border-outline rounded-xl py-2 flex items-center justify-center gap-xs hover:bg-slate-50 dark:hover:bg-zinc-900 active:scale-95 transition-all outline-none cursor-pointer text-[10px] font-bold text-slate-500"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>

          {/* Delivery estimate */}
          <div className="text-left bg-slate-50 dark:bg-zinc-950/20 p-md rounded-2xl border border-slate-100 dark:border-zinc-850 space-y-xs">
            <p className="font-bold text-[10px] text-slate-500 flex items-center gap-xs">
              <Truck size={12} className="text-[#086b53]" /> Delivery Estimate
            </p>
            <p className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Free delivery by Tomorrow, 2:00 PM</p>
          </div>

          {/* Trust badges */}
          <div className="space-y-sm pt-md border-t border-slate-150 dark:border-zinc-850">
            <div className="flex items-center gap-sm text-[10px] font-bold text-slate-400">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Check size={12} className="text-emerald-500" />
              </div>
              <span>100% Genuine Product</span>
            </div>
            <div className="flex items-center gap-sm text-[10px] font-bold text-slate-400">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Lock size={12} className="text-[#004782]" />
              </div>
              <span>Secure Encrypted Payment</span>
            </div>
            <div className="flex items-center gap-sm text-[10px] font-bold text-slate-400">
              <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck size={12} className="text-[#086b53]" />
              </div>
              <span>Pharmacist Verified</span>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 1.5: QUICK HIGHLIGHTS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-sm mb-xl">
        {[
          { label: "Prescription", value: product.requiresRx ? "Rx Required" : "OTC Item", icon: FileText, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30" },
          { label: "Delivery", value: "Next-Day", icon: Truck, color: "text-[#086b53] bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" },
          { label: "Storage", value: product.specifications?.find(s => s.label.toLowerCase().includes("store") || s.label.toLowerCase().includes("temp"))?.value || "Below 30°C", icon: Thermometer, color: "text-[#004782] bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30" },
          { label: "Category", value: product.category?.name || product.category, icon: Tag, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30" },
          { label: "Shelf Life", value: "24 Months", icon: Hourglass, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30" },
          { label: "Manufacturer", value: product.brand, icon: Building, color: "text-slate-600 bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-800" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`p-md rounded-2xl border flex flex-col items-start justify-between min-h-[90px] shadow-xs hover:shadow-md transition-shadow ${item.color}`}>
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{item.label}</span>
                <Icon size={16} className="opacity-90" />
              </div>
              <p className="font-extrabold text-xs mt-sm leading-tight">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: QUICK INFORMATION CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-sm mb-xl">
        {[
          { label: "100% Genuine", icon: ShieldCheck, desc: "Direct manufacturer supply", color: "text-[#086b53] bg-[#086b53]/10" },
          { label: "Express Shipping", icon: Truck, desc: "Next day delivery guaranteed", color: "text-[#004782] bg-[#004782]/10" },
          { label: product.requiresRx ? "Rx Verified" : "No Rx Required", icon: FileText, desc: "Clinical safety verified", color: "text-amber-600 bg-amber-500/10" },
          { label: "Expert Support", icon: HelpCircle, desc: "Licensed pharmacist assistance", color: "text-[#086b53] bg-[#086b53]/10" },
          { label: "Tamper Proof", icon: Package, desc: "Sealed clinical packaging", color: "text-[#004782] bg-[#004782]/10" },
          { label: "Hassle Free Returns", icon: RotateCcw, desc: "Easy 7-day return policy", color: "text-slate-600 bg-slate-500/10" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center text-center justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center mb-sm`}>
                <Icon size={18} />
              </div>
              <p className="font-bold text-xs text-on-surface">{card.label}</p>
              <p className="text-[9px] text-slate-400 mt-xs">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* SECTION 3: STICKY MEDICAL NAVIGATION & CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start pt-lg border-t border-outline-variant/30 dark:border-outline/20">
        
        {/* Left: Sticky Navigation */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-md space-y-sm select-none border-r border-slate-100 dark:border-zinc-900 scrollbar-none">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-md px-sm">Clinical Index</p>
          <div className="space-y-xs relative pl-sm border-l-2 border-slate-100 dark:border-zinc-800">
            {computedSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    const target = sectionRefs.current[sec.id];
                    if (target) {
                      window.scrollTo({
                        top: target.offsetTop - 120,
                        behavior: "smooth"
                      });
                    }
                  }}
                  className={`w-full text-left py-2.5 px-md rounded-xl text-xs font-bold transition-all relative block ${
                    isActive
                      ? "bg-[#004782]/5 text-primary dark:text-[#a4c9ff]"
                      : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50/30 dark:hover:bg-zinc-900/30"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#004782] dark:bg-primary-fixed-dim rounded-r-full" />
                  )}
                  {sec.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right: Medical Content Sections */}
        <div className="col-span-1 lg:col-span-9 space-y-lg text-left">
          
          {computedSections.map((sec) => {
            return (
              <div
                key={sec.id}
                ref={el => sectionRefs.current[sec.id] = el}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-lg rounded-3xl shadow-sm space-y-md scroll-mt-28 transition-all hover:shadow-md"
              >
                <h2 className="font-bold text-sm md:text-base text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800">
                  {sec.title}
                </h2>

                {/* Composition Table */}
                {sec.type === "composition" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-xs">
                    <table className="w-full text-xs text-left text-slate-600 dark:text-zinc-300">
                      <thead className="bg-slate-50 dark:bg-zinc-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-lg py-md">Ingredient</th>
                          <th className="px-lg py-md">Strength</th>
                          <th className="px-lg py-md">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                        {product.composition.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="px-lg py-md font-bold text-slate-700 dark:text-zinc-200">{row.ingredient}</td>
                            <td className="px-lg py-md font-mono text-slate-500">{row.strength}</td>
                            <td className="px-lg py-md text-slate-500">{row.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Key Benefits Icon Grid */}
                {sec.type === "benefits" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {product.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="p-md bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] rounded-2xl border border-emerald-500/10 flex gap-sm items-start hover:shadow-xs transition-all">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <CheckCircle className="text-[#086b53]" size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-zinc-200">{benefit.title}</p>
                          {benefit.description && <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{benefit.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dosage Checklist */}
                {sec.type === "usage" && (
                  <ul className="space-y-sm text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    {product.usageInstructions.map((inst, idx) => (
                      <li key={idx} className="flex gap-sm items-start leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-[#004782]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="text-[#004782]" size={10} />
                        </div>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Warnings Alert Panels */}
                {sec.type === "warnings" && (
                  <div className="space-y-sm">
                    {product.warnings.map((warn, idx) => (
                      <div key={idx} className="p-md bg-red-500/[0.03] border border-red-500/10 rounded-2xl flex gap-sm items-start">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{warn}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Side Effects List */}
                {sec.type === "sideeffects" && (
                  <ul className="space-y-sm text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    {product.sideEffects.map((side, idx) => (
                      <li key={idx} className="flex gap-sm items-start leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                        <span>{side}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Storage Checklist */}
                {sec.type === "storage" && (
                  <ul className="space-y-sm text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    {product.storageInstructions.map((store, idx) => (
                      <li key={idx} className="flex gap-sm items-start leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#086b53] shrink-0 mt-2" />
                        <span>{store}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Safety Cards Grid */}
                {sec.type === "safety" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    {product.safetyCards.map((card, idx) => {
                      const status = card.status.toLowerCase();
                      
                      let badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400";
                      if (status.includes("avoid") || status.includes("unsafe") || status.includes("dangerous")) {
                        badgeStyle = "bg-red-100 text-red-800 border-red-200/50 dark:bg-red-950/20 dark:text-red-400";
                      } else if (status.includes("caution") || status.includes("moderate")) {
                        badgeStyle = "bg-yellow-100 text-yellow-800 border-yellow-200/50 dark:bg-yellow-950/20 dark:text-yellow-400";
                      } else if (status.includes("consult") || status.includes("doctor") || status.includes("physician")) {
                        badgeStyle = "bg-orange-100 text-orange-800 border-orange-200/50 dark:bg-orange-950/20 dark:text-orange-455";
                      }
                      
                      return (
                        <div key={idx} className="p-md bg-slate-50/30 dark:bg-zinc-950/10 rounded-2xl border border-slate-100 dark:border-zinc-850/80 space-y-sm text-xs transition-all hover:shadow-xs">
                          <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-850/80">
                            <span className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
                              <Info size={14} className="text-[#004782]" />
                              {card.title}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider ${badgeStyle}`}>
                              {card.status}
                            </span>
                          </div>
                          {card.description && <p className="text-[11px] text-slate-400 leading-relaxed text-left">{card.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* FAQs Accordion */}
                {sec.type === "faqs" && (
                  <div className="space-y-sm">
                    {product.faqs.map((faq, idx) => {
                      const isOpen = openFaqIdx === idx;
                      return (
                        <div key={idx} className="border border-slate-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden transition-all bg-slate-50/30 dark:bg-zinc-950/5">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                            className="w-full flex justify-between items-center p-md font-bold text-slate-700 dark:text-zinc-200 text-xs text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors"
                          >
                            <span className="flex items-center gap-sm">
                              <HelpCircle size={14} className="text-[#004782] shrink-0" />
                              {faq.question}
                            </span>
                            <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                              <ChevronDown size={14} />
                            </span>
                          </button>
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? "max-h-60 border-t border-slate-100 dark:border-zinc-800/80 p-md opacity-100" : "max-h-0 p-0 opacity-0 pointer-events-none"
                          }`}>
                            <p className="text-[11px] text-slate-450 dark:text-zinc-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Specifications List */}
                {sec.type === "specifications" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    {product.specifications.map((spec, idx) => (
                      <div key={idx} className="flex justify-between items-center p-sm bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-slate-100 dark:border-zinc-850 text-xs">
                        <span className="font-bold text-slate-400">{spec.label}</span>
                        <span className="font-bold text-slate-700 dark:text-zinc-200">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* References */}
                {sec.type === "references" && (
                  <ul className="space-y-xs text-[11px] text-slate-450 italic">
                    {product.references.map((ref, idx) => (
                      <li key={idx} className="flex gap-sm items-start">
                        <span>[{idx + 1}]</span>
                        <span className="text-left">{ref}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Default Text Content for Custom Sections */}
                {!sec.type && (
                  <p className="text-xs text-slate-650 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-left font-medium">
                    {sec.content}
                  </p>
                )}

              </div>
            );
          })}

          {/* Manufacturer Information Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-lg rounded-3xl shadow-sm space-y-md">
            <h2 className="font-bold text-sm md:text-base text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800">
              <Building size={16} className="text-[#004782]" />
              Manufacturer Information
            </h2>
            <div className="flex flex-col sm:flex-row gap-lg items-start text-xs text-left">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center shrink-0 border border-slate-100 dark:border-zinc-850">
                <Building className="text-[#004782]" size={32} />
              </div>
              <div className="space-y-sm flex-1">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">{product.brand} Healthcare Ltd.</h3>
                <p className="text-slate-400 font-medium">Country of Origin: Germany | Manufacturing License: DL-329/2026</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-450 leading-relaxed">
                  {product.brand} is a global enterprise with core competencies in the life science fields of health care and agriculture. Its products and services are designed to benefit people and improve their quality of life.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Banner Card */}
          <div className="bg-gradient-to-br from-[#004782] to-[#086b53] text-white p-lg rounded-3xl shadow-md text-left flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="space-y-xs z-10">
              <h3 className="text-lg font-black flex items-center gap-xs">
                <ShieldCheck size={20} /> WellMeds Quality Assurance
              </h3>
              <p className="text-xs text-white/85 leading-relaxed max-w-xl">
                We employ strict cold-chain logistics, licensed pharmacists validation, and clinical batch tracking to guarantee that every single medicine delivered is 100% authentic and authentic.
              </p>
            </div>
            <div className="flex gap-sm z-10 shrink-0 select-none">
              <span className="bg-white/10 border border-white/10 px-md py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">Licensed Hub</span>
              <span className="bg-white/10 border border-white/10 px-md py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">Cold Chain</span>
            </div>
          </div>

        </div>

      </div>

      {/* Similar Products Grid */}
      {similarProducts.length > 0 && (
        <section className="pt-xxl border-t border-outline-variant/30 dark:border-outline/20 mt-xxl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xl font-black text-left">Similar Products (Same Category)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[10px] md:gap-lg">
            {similarProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="pt-xxl border-t border-outline-variant/30 dark:border-outline/20 mt-xl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xl font-black text-left">Related Products (Same Brand)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[10px] md:gap-lg">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Products Horizontal Scroll Carousel */}
      {recentlyViewed.length > 0 && (
        <section className="pt-xxl border-t border-outline-variant/30 dark:border-outline/20 mt-xl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xl font-black text-left">Recently Viewed Products</h2>
          <div className="flex gap-sm md:gap-lg overflow-x-auto pb-md scroll-smooth snap-x snap-mandatory scrollbar-none">
            {recentlyViewed.map((p) => (
              <div key={p.id || p._id} className="snap-start shrink-0 w-[calc(50%-6px)] md:w-[calc(33.33%-8px)] lg:w-[calc(25%-18px)]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Bar (Mobile/Tablet only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/80 p-sm shadow-2xl z-40 flex items-center justify-between gap-md animate-[slide-up_0.2s_ease-out]">
        <div className="text-left pl-sm">
          <p className="text-[9px] text-slate-450 font-black uppercase tracking-wider">Total Price</p>
          <p className="text-base font-black text-[#004782] dark:text-primary-fixed-dim">
            {formatCurrency(product.price * quantity)}
          </p>
        </div>
        <div className="flex gap-xs flex-1 max-w-[240px]">
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 bg-[#086b53] hover:bg-[#055746] text-white font-black h-11 rounded-xl text-xs outline-none cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-[#004782] hover:bg-[#003c6e] text-white font-black h-11 rounded-xl text-xs outline-none cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Prescription Verification Modal */}
      <Modal
        isOpen={rxUploadOpen}
        onClose={() => setRxUploadOpen(false)}
        title="Upload Prescription (Rx Required)"
        maxWidth="max-w-md"
      >
        <div className="space-y-md mb-lg text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            You are adding a regulated prescription drug: <strong className="text-on-surface">{product.name}</strong>.
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            To proceed, upload a valid medical prescription signed by a certified practitioner.
          </p>
        </div>
        <PrescriptionUpload
          onUploadSuccess={handleRxSuccess}
          onClose={() => setRxUploadOpen(false)}
        />
      </Modal>

      {/* Fullscreen Preview Modal */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-md animate-[fade-in_0.2s_ease-out]">
          <button 
            type="button"
            onClick={() => setIsFullscreenOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full outline-none transition-colors"
          >
            <X size={28} />
          </button>
          <img 
            src={imagesList[activeImageIdx]} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
