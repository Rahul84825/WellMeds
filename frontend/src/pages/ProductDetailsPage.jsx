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
  Award
} from "lucide-react";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prod = await api.getProduct(slug);
        setProduct(prod);
        setActiveImageIdx(0);
        setQuantity(1);
        setLocalRxFile(null);
        
        // Use pre-populated related products or fallback to same category
        if (prod.relatedProducts && prod.relatedProducts.length > 0) {
          setRelatedProducts(prod.relatedProducts);
        } else {
          const allProds = await api.getProductsList();
          const related = allProds.filter(p => p.category === prod.category && p.slug !== prod.slug).slice(0, 4);
          setRelatedProducts(related);
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
              "name": product.category,
              "item": `${window.location.origin}/products?category=${encodeURIComponent(product.category)}`
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
      // Clean up injected tags & schemas
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
      backgroundImage: `url(${product?.images?.[activeImageIdx] || product?.image})`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  // Compile Dynamic Content Sections
  const computedSections = useMemo(() => {
    if (!product) return [];
    
    // If no custom medical sections are configured, convert description into Overview
    const sections = product.medicalSections && product.medicalSections.length > 0
      ? [...product.medicalSections]
      : (product.description ? [{ title: "Overview", content: product.description }] : []);

    // Inject other structured arrays dynamically if populated
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

    // Add unique IDs for section navigation anchor matching
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
  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs */}
      <nav className="mb-lg text-xs font-semibold text-slate-400 dark:text-zinc-500 flex items-center gap-xs flex-wrap select-none">
        <Link to="/" className="hover:text-primary dark:hover:text-primary-fixed-dim">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary dark:hover:text-primary-fixed-dim">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary dark:hover:text-primary-fixed-dim">{product.category}</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-zinc-300 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-xl mb-xxl">
        
        {/* Left Column: Image Gallery */}
        <div className="w-full lg:w-1/2 space-y-md">
          <div 
            className="w-full aspect-square rounded-3xl bg-white dark:bg-zinc-900 overflow-hidden border border-outline-variant/30 dark:border-outline/20 relative cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              alt={product.imagesData?.[activeImageIdx]?.alt || product.name} 
              title={product.imagesData?.[activeImageIdx]?.title || product.name}
              className="w-full h-full object-contain p-md transition-transform duration-300" 
              src={imagesList[activeImageIdx]} 
            />
            {/* Magnifier zoom portal */}
            <div 
              className="absolute inset-0 pointer-events-none bg-no-repeat bg-white dark:bg-zinc-900" 
              style={{
                ...zoomStyle,
                backgroundSize: "200%"
              }}
            />
          </div>

          {/* Thumbnail strip */}
          {imagesList.length > 1 && (
            <div className="flex gap-sm overflow-x-auto pb-xs scrollbar-none">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 border-2 p-sm flex items-center justify-center shrink-0 transition-all ${
                    activeImageIdx === idx 
                      ? "border-[#004782] scale-[1.03]" 
                      : "border-outline-variant/30 dark:border-outline/20 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Details & ATC */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-md">
          <div className="space-y-md">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-xs items-center">
              <span className="bg-[#004782]/10 text-primary dark:text-[#a4c9ff] text-label-sm font-bold uppercase tracking-wider px-sm py-[4px] rounded-full">
                {product.category}
              </span>
              {product.requiresRx && (
                <span className="bg-secondary-container text-on-secondary-container border border-secondary text-label-sm font-bold uppercase tracking-wider px-sm py-[4px] rounded-full flex items-center gap-0.5">
                  <ShieldCheck size={12} /> Rx Required
                </span>
              )}
              {product.badge && product.badge !== "Rx Required" && (
                <span className="bg-[#086b53]/10 text-secondary dark:text-[#84d6b9] text-label-sm font-bold uppercase tracking-wider px-sm py-[4px] rounded-full">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Brand & Name */}
            <div>
              <p className="text-body-md text-on-surface-variant dark:text-surface-variant font-bold uppercase tracking-widest text-xs">
                {product.brand}
              </p>
              <h1 className="font-headline-md lg:font-headline-lg text-headline-md lg:text-headline-lg text-on-surface font-black leading-tight mt-1">
                {product.name}
              </h1>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-md flex-wrap">
              <span className="text-3xl font-black text-[#004782] dark:text-primary-fixed-dim">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-on-surface-variant dark:text-surface-variant line-through text-body-md font-medium">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="bg-secondary text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-xs">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Fast info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm pt-sm border-t border-outline-variant/30 dark:border-outline/20">
              <div className="p-md bg-slate-50/50 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-zinc-850 flex items-center gap-sm">
                <div className="w-10 h-10 rounded-xl bg-[#004782]/10 dark:bg-[#004782]/20 flex items-center justify-center shrink-0">
                  <Award className="text-[#004782]" size={18} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-xs text-on-surface">100% Genuine</p>
                  <p className="text-[10px] text-slate-400">Directly from Cipla/Abbott</p>
                </div>
              </div>
              <div className="p-md bg-slate-50/50 dark:bg-zinc-900/40 rounded-2xl border border-slate-100 dark:border-zinc-850 flex items-center gap-sm">
                <div className="w-10 h-10 rounded-xl bg-[#086b53]/10 dark:bg-[#086b53]/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-[#086b53]" size={18} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-xs text-on-surface">Pharmacist Verified</p>
                  <p className="text-[10px] text-slate-400">Prescription clinical review</p>
                </div>
              </div>
            </div>

            {/* SKU and Stock */}
            <div className="pt-sm space-y-xs text-xs text-on-surface-variant dark:text-surface-variant font-semibold">
              <p>SKU Code: <span className="font-mono text-on-surface font-bold">{product.sku}</span></p>
              <p>Stock Status: 
                <span className={`font-bold ml-xs ${product.stock > 10 ? "text-[#086b53]" : product.stock > 0 ? "text-red-500" : "text-red-600"}`}>
                  {product.stock > 10 ? "Available in Stock" : product.stock > 0 ? `Only ${product.stock} Units Left` : "Out of Stock"}
                </span>
              </p>
            </div>

            {/* Rx Required Border Box */}
            {product.requiresRx && (
              <div className="bg-secondary-container/20 border-2 border-secondary/20 rounded-2xl p-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md">
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary text-[26px]">prescriptions</span>
                  <div className="text-left">
                    <h4 className="font-bold text-xs text-on-secondary-container">Prescription Verification Required</h4>
                    <p className="text-[11px] text-on-surface-variant leading-normal">
                      A qualified licensed pharmacist will verify your Rx before order processing.
                    </p>
                  </div>
                </div>
                {localRxFile ? (
                  <div className="flex items-center gap-xs text-secondary font-bold text-xs shrink-0 select-none">
                    <CheckCircle size={14} />
                    <span>Rx Sheet Attached</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setRxUploadOpen(true)}
                    className="bg-secondary text-white px-md py-1.5 rounded-xl font-bold text-xs hover:bg-[#055746] transition-colors focus-visible:ring-2 focus-visible:ring-secondary outline-none shrink-0 cursor-pointer"
                  >
                    Attach Rx
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-md border-t border-outline-variant/30 dark:border-outline/20 flex flex-col sm:flex-row items-center gap-md">
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center border border-outline-variant/50 dark:border-outline rounded-xl bg-slate-50 dark:bg-zinc-900 h-12 shrink-0">
                <button
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="px-md h-full flex items-center justify-center text-on-surface hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 outline-none rounded-l-xl cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="px-lg font-bold text-on-surface min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="px-md h-full flex items-center justify-center text-on-surface hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 outline-none rounded-r-xl cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 w-full bg-[#004782] hover:bg-primary-container text-white font-bold h-12 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span>{product.stock === 0 ? "Out of Stock" : product.requiresRx && !localRxFile ? "Upload Rx & Add to Cart" : "Add to Cart"}</span>
            </button>

            {/* Wishlist and Share */}
            <div className="flex gap-sm shrink-0">
              <button
                onClick={() => toggleWishlist(product)}
                className="w-12 h-12 border border-outline-variant/50 dark:border-outline rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-900 active:scale-95 transition-all outline-none cursor-pointer"
                title={favorited ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} className={favorited ? "text-red-500 fill-red-500" : "text-slate-400"} />
              </button>

              <button
                onClick={handleShare}
                className="w-12 h-12 border border-outline-variant/50 dark:border-outline rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-900 active:scale-95 transition-all outline-none cursor-pointer"
                title="Share product link"
              >
                <Share2 size={20} className="text-slate-400" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Structured Content Grid: Sticky Nav Sidebar + Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start pt-xl border-t border-outline-variant/30 dark:border-outline/20">
        
        {/* Left: Sticky Navigation (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-md space-y-sm select-none border-r border-slate-100 dark:border-zinc-900">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-md px-sm">Table of Contents</p>
          <div className="space-y-xs">
            {computedSections.map((sec) => (
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
                className={`w-full text-left py-2 px-sm rounded-xl text-xs font-bold transition-all ${
                  activeSection === sec.id
                    ? "bg-[#004782]/10 text-primary dark:text-[#a4c9ff]"
                    : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50"
                }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Right: Content Cards */}
        <div className="col-span-1 lg:col-span-9 space-y-lg text-left">
          
          {computedSections.map((sec) => {
            return (
              <div
                key={sec.id}
                ref={el => sectionRefs.current[sec.id] = el}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-lg rounded-3xl shadow-xs space-y-md scroll-mt-28"
              >
                <h2 className="font-bold text-base text-slate-800 dark:text-zinc-100 flex items-center gap-xs pb-sm border-b border-slate-100 dark:border-zinc-800">
                  {sec.title}
                </h2>

                {/* Render Composition Table */}
                {sec.type === "composition" && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <table className="w-full text-xs text-left text-slate-600 dark:text-zinc-300">
                      <thead className="bg-slate-50 dark:bg-zinc-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="px-lg py-sm">Ingredient</th>
                          <th className="px-lg py-sm">Strength</th>
                          <th className="px-lg py-sm">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                        {product.composition.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50">
                            <td className="px-lg py-sm font-bold text-slate-700 dark:text-zinc-200">{row.ingredient}</td>
                            <td className="px-lg py-sm font-mono">{row.strength}</td>
                            <td className="px-lg py-sm">{row.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Render Key Benefits */}
                {sec.type === "benefits" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {product.benefits.map((benefit, bIdx) => (
                      <div key={bIdx} className="p-md bg-slate-50/30 dark:bg-zinc-950/10 rounded-2xl border border-slate-100 dark:border-zinc-850 flex gap-sm items-start">
                        <CheckCircle className="text-[#086b53] shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-zinc-200">{benefit.title}</p>
                          {benefit.description && <p className="text-[11px] text-slate-400 mt-xs leading-relaxed">{benefit.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Checklists (Usage / Warnings / Side Effects / Storage / References) */}
                {sec.type === "usage" && (
                  <ul className="space-y-sm text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    {product.usageInstructions.map((inst, idx) => (
                      <li key={idx} className="flex gap-sm items-start leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#004782] shrink-0 mt-2" />
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                )}

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {product.safetyCards.map((card, idx) => {
                      const isAvoid = card.status.toLowerCase().includes("avoid") || card.status.toLowerCase().includes("unsafe");
                      const isCaution = card.status.toLowerCase().includes("caution") || card.status.toLowerCase().includes("consult");
                      return (
                        <div key={idx} className="p-md bg-slate-50/50 dark:bg-zinc-950/20 rounded-2xl border border-slate-100 dark:border-zinc-850 space-y-sm text-xs">
                          <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-850">
                            <span className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
                              <Info size={14} className="text-[#004782]" />
                              {card.title}
                            </span>
                            <span className={`px-sm py-0.5 rounded-full text-[9px] font-black uppercase ${
                              isAvoid 
                                ? "bg-red-100 text-red-700" 
                                : isCaution 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
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
                  <div className="space-y-xs divide-y divide-slate-100 dark:divide-zinc-850">
                    {product.faqs.map((faq, idx) => {
                      const isOpen = openFaqIdx === idx;
                      return (
                        <div key={idx} className="pt-sm first:pt-0">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                            className="w-full flex justify-between items-center py-sm font-bold text-slate-700 dark:text-zinc-200 text-xs text-left"
                          >
                            <span className="flex items-center gap-xs">
                              <HelpCircle size={14} className="text-[#004782]" />
                              {faq.question}
                            </span>
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          {isOpen && (
                            <div className="pb-sm px-md text-[11px] text-slate-400 leading-relaxed animate-[fade-in_0.2s_ease-out]">
                              {faq.answer}
                            </div>
                          )}
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
                  <ul className="space-y-xs text-[11px] text-slate-400 italic">
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
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line text-left font-medium">
                    {sec.content}
                  </p>
                )}

              </div>
            );
          })}

        </div>

      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-xxl border-t border-outline-variant/30 dark:border-outline/20 mt-xxl">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-xl font-black text-left">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Prescription Upload Modal */}
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
    </div>
  );
};

export default ProductDetails;
