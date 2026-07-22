import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";
import { X, ChevronLeft, ChevronRight, Share2, Snowflake, ShoppingCart, Star, Info, HelpCircle, CheckCircle, AlertTriangle, Check } from "lucide-react";
import { formatCurrency } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";

// V2 Modular Components
import StickySidebar from "../components/ProductDetail/StickySidebar";
import ProductInfo from "../components/ProductDetail/ProductInfo";
import ProductGallery from "../components/ProductDetail/ProductGallery";
import PurchaseCard from "../components/ProductDetail/PurchaseCard";
import DispatchCard from "../components/ProductDetail/DispatchCard";
import DeliveryCard from "../components/ProductDetail/DeliveryCard";
import RXCard from "../components/ProductDetail/RXCard";
import ColdChainCard from "../components/ProductDetail/ColdChainCard";
import ProductTabs from "../components/ProductDetail/ProductTabs";
import SubstituteProducts from "../components/ProductDetail/SubstituteProducts";
import ProductDetailSkeleton from "../components/ProductDetail/ProductDetailSkeleton";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [substituteProducts, setSubstituteProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const productId = (product?._id || product?.id)?.toString();
  const cartItem = cartItems?.find((item) => item.id === productId);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem ? cartItem.quantity : 0;

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

  const [isMobile, setIsMobile] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25649); // 7h 7m 29s
  const [activeMobileTab, setActiveMobileTab] = useState("overview");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 25649));
    }, 1000);
    return () => clearInterval(interval);
  }, [isMobile]);

  const formatTimeLeft = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getDeliveryDateRange = () => {
    const today = new Date();
    const date1 = new Date(today);
    date1.setDate(today.getDate() + 3);
    const date2 = new Date(today);
    date2.setDate(today.getDate() + 4);
    
    const options1 = { day: "numeric", month: "short" };
    const options2 = { day: "numeric", month: "short" };
    
    return `${date1.toLocaleDateString("en-IN", options1)} - ${date2.toLocaleDateString("en-IN", options2)}`;
  };

  const getUnitPrice = () => {
    if (!product) return 0;
    const pack = product.packSize || product.productSpecifications?.packSize || "";
    const match = pack.match(/(\d+(\.\d+)?)/);
    const qty = match ? parseFloat(match[1]) : 1;
    return qty > 0 ? (product.price / qty) : product.price;
  };

  const imagesList = useMemo(() => {
    if (!product) return [DEFAULT_PRODUCT_IMAGE];
    const validImages = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    if (validImages.length > 0) return validImages;
    if (product.image) return [product.image];
    return [DEFAULT_PRODUCT_IMAGE];
  }, [product]);

  useEffect(() => {
    let isMounted = true;
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const prod = await api.getProduct(slug);
        if (!isMounted) return;
        setProduct(prod);
        setActiveImageIdx(0);
        setQuantity(1);
        
        // Fetch remaining data in parallel
        const [substitutes, allProds] = await Promise.all([
          api.getSimilarProducts(prod._id || prod.id).catch(() => []),
          api.getProductsList().catch(() => [])
        ]);

        if (!isMounted) return;

        // Related products: from product.relatedProducts or fallback to same manufacturer
        if (prod.relatedProducts && prod.relatedProducts.length > 0) {
          setRelatedProducts(prod.relatedProducts);
        } else {
          const related = allProds.filter(p => (p.manufacturer || p.brand) === (prod.manufacturer || prod.brand) && p.slug !== prod.slug).slice(0, 4);
          setRelatedProducts(related);
        }

        // Substitute products: fetch dynamically using matching molecules sorted by priority
        if (substitutes && substitutes.length > 0) {
          setSubstituteProducts(substitutes);
        } else {
          // Fallback: same category
          const prodCatId = prod.category?._id || prod.category;
          const fallback = allProds.filter(p => {
            const pCatId = p.category?._id || p.category;
            return pCatId && prodCatId && pCatId.toString() === prodCatId.toString() && p.slug !== prod.slug;
          }).slice(0, 4);
          setSubstituteProducts(fallback);
        }

        // Update recently viewed in localStorage
        try {
          const recent = JSON.parse(localStorage.getItem("wellmeds_recently_viewed") || "[]");
          const filtered = recent.filter(p => p.slug !== prod.slug);
          filtered.unshift({
            id: prod.id || prod._id,
            _id: prod.id || prod._id,
            name: prod.name,
            brand: prod.manufacturer || prod.brand,
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
        if (isMounted) navigate("/products");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  }, [slug, navigate]);

  // Preload the primary product image once product data is loaded to optimize loading speed
  useEffect(() => {
    if (!product || !product.image) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = product.image;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [product]);

  // Reset image loading state on image change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsImageLoading(true);
  }, [activeImageIdx, slug]);

  // Keyboard Navigation for Fullscreen Preview
  useEffect(() => {
    if (!isFullscreenOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsFullscreenOpen(false);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length);
      } else if (e.key === "ArrowRight") {
        setActiveImageIdx((prev) => (prev + 1) % imagesList.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenOpen, imagesList.length]);

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
            "name": product.manufacturer || product.brand
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": product.price,
            "itemCondition": "https://schema.org/NewCondition",
            "availability": (product.inStock !== false && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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

  const handleIncrement = useCallback(() => {
    setQuantity(prev => (prev < 30 ? prev + 1 : prev));
  }, []);

  const handleDecrement = useCallback(() => {
    setQuantity(prev => (prev > 1 ? prev - 1 : prev));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product || product.inStock === false || product.stock === 0) return;
    addToCart(product, quantity);
    toast.success(`${quantity} item(s) added to cart.`);
  }, [product, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!product || product.inStock === false || product.stock === 0) return;
    addToCart(product, quantity);
    navigate("/cart");
  }, [product, quantity, addToCart, navigate]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  }, []);



  // Swipe gesture handlers for mobile image gallery
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
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
  }, [touchStart, touchEnd, activeImageIdx, imagesList.length]);

  // Compile Dynamic Content Sections
  const computedSections = useMemo(() => {
    if (!product) return [];
    
    const sections = [];
    
    // Normalize standard medical sections to match standard IDs
    const medicalSecs = product.medicalSections && product.medicalSections.length > 0
      ? JSON.parse(JSON.stringify(product.medicalSections))
      : [];

    const findAndRemoveMedSec = (titles) => {
      const idx = medicalSecs.findIndex(s => titles.some(t => s.title.toLowerCase() === t.toLowerCase()));
      if (idx !== -1) {
        return medicalSecs.splice(idx, 1)[0];
      }
      return null;
    };

    // 1. Uses
    const usesSec = findAndRemoveMedSec(["uses", "use"]);
    if (usesSec) {
      sections.push({ id: "Uses", title: "Uses", content: usesSec.content });
    }


    // 3. Benefits
    const benefitsSec = findAndRemoveMedSec(["benefits", "key benefits"]);
    if (product.benefits && product.benefits.length > 0) {
      sections.push({ id: "Benefits", title: "Key Benefits", type: "benefits" });
    } else if (benefitsSec) {
      sections.push({ id: "Benefits", title: "Key Benefits", content: benefitsSec.content });
    }

    // 4. Dosage / Usage Instructions
    const usageSec = findAndRemoveMedSec(["dosage", "how to use", "usage instructions", "dosage instructions"]);
    if (product.usageInstructions && product.usageInstructions.length > 0) {
      sections.push({ id: "Dosage", title: "Usage & Dosage Instructions", type: "usage" });
    } else if (usageSec) {
      sections.push({ id: "Dosage", title: "Usage & Dosage Instructions", content: usageSec.content });
    }

    // 5. Warnings & Precautions
    const warningsSec = findAndRemoveMedSec(["warnings", "warnings & precautions", "warnings and precautions"]);
    if (product.warnings && product.warnings.length > 0) {
      sections.push({ id: "Warnings", title: "Warnings & Precautions", type: "warnings" });
    } else if (warningsSec) {
      sections.push({ id: "Warnings", title: "Warnings & Precautions", content: warningsSec.content });
    }

    // 6. Side Effects
    const sideEffectsSec = findAndRemoveMedSec(["side effects", "sideeffects"]);
    if (product.sideEffects && product.sideEffects.length > 0) {
      sections.push({ id: "SideEffects", title: "Side Effects", type: "sideeffects" });
    } else if (sideEffectsSec) {
      sections.push({ id: "SideEffects", title: "Side Effects", content: sideEffectsSec.content });
    }

    // 7. Precautions / Safety Information
    const safetySec = findAndRemoveMedSec(["precautions", "safety information", "safety advice", "safety cards"]);
    if (product.safetyCards && product.safetyCards.length > 0) {
      sections.push({ id: "Precautions", title: "Safety Information", type: "safety" });
    } else if (safetySec) {
      sections.push({ id: "Precautions", title: "Safety Information", content: safetySec.content });
    }

    // 8. Storage
    const storageSec = findAndRemoveMedSec(["storage", "storage conditions", "storage instructions"]);
    if (product.storageInstructions && product.storageInstructions.length > 0) {
      sections.push({ id: "Storage", title: "Storage Instructions", type: "storage" });
    } else if (storageSec) {
      sections.push({ id: "Storage", title: "Storage Instructions", content: storageSec.content });
    }

    // 9. FAQs
    const faqsSec = findAndRemoveMedSec(["faqs", "faq", "frequently asked questions"]);
    if (product.faqs && product.faqs.length > 0) {
      sections.push({ id: "FAQs", title: "FAQs", type: "faqs" });
    } else if (faqsSec) {
      sections.push({ id: "FAQs", title: "FAQs", content: faqsSec.content });
    }


    // 11. References
    const referencesSec = findAndRemoveMedSec(["references", "citations & references", "citations and references", "sources"]);
    if (product.references && product.references.length > 0) {
      sections.push({ id: "References", title: "Citations & References", type: "references" });
    } else if (referencesSec) {
      sections.push({ id: "References", title: "Citations & References", content: referencesSec.content });
    }

    // Add remaining custom sections
    medicalSecs.forEach((sec, idx) => {
      sections.push({
        ...sec,
        id: sec.id || `custom-section-${idx}`,
      });
    });

    return sections;
  }, [product]);

  const discountPercent = product?.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Memoize sub-components to prevent rendering of large DOM trees on scroll
  const memoizedStickySidebar = useMemo(() => {
    if (!product) return null;
    return (
      <StickySidebar
        substituteProducts={substituteProducts}
        product={product}
        computedSections={computedSections}
        activeSection={activeSection}
      />
    );
  }, [substituteProducts, product, computedSections, activeSection]);

  const memoizedProductInfo = useMemo(() => {
    if (!product) return null;
    return <ProductInfo product={product} handleShare={handleShare} />;
  }, [product, handleShare]);

  const memoizedProductGallery = useMemo(() => {
    if (!product) return null;
    return (
      <ProductGallery
        imagesList={imagesList}
        activeImageIdx={activeImageIdx}
        setActiveImageIdx={setActiveImageIdx}
        isImageLoading={isImageLoading}
        setIsImageLoading={setIsImageLoading}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        setIsFullscreenOpen={setIsFullscreenOpen}
        discountPercent={discountPercent}
        productName={product.name}
      />
    );
  }, [
    imagesList,
    activeImageIdx,
    isImageLoading,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setIsFullscreenOpen,
    discountPercent,
    product
  ]);

  const memoizedDispatchDelivery = useMemo(() => {
    if (!product) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
        <DispatchCard />
        <DeliveryCard />
      </div>
    );
  }, [product]);

  const memoizedRxColdChain = useMemo(() => {
    if (!product) return null;
    return (
      <div className="space-y-sm">
        <RXCard requiresRx={product.requiresRx} />
        <ColdChainCard isColdChain={product.isColdChain} />
      </div>
    );
  }, [product]);

  const memoizedSpecifications = useMemo(() => {
    if (!product || !product.productSpecifications || !Object.values(product.productSpecifications).some(v => v !== undefined && v !== "")) return null;
    return (
      <div 
        id="Specifications"
        ref={el => sectionRefs.current["Specifications"] = el}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xs text-left space-y-md scroll-mt-28"
      >
        <h2 className="font-headline-sm text-sm text-[#004782] dark:text-primary-fixed-dim font-extrabold pb-sm border-b border-slate-100 dark:border-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] leading-none">list_alt</span> Product Specifications
        </h2>
        <div className="flex flex-col w-full text-xs">
          {[
            { label: "Generic Name", key: "genericName" },
            { label: "Strength", key: "strength" },
            { label: "Dosage Form", key: "dosageForm" },
            { label: "Route", key: "route" },
            { label: "Prescription", key: "prescription" },
            { label: "Manufacturer", key: "manufacturer" },
            { label: "Cold Chain", key: "coldChain" },
            { label: "Storage", key: "storage" }
          ].map((spec) => {
            const val = product.productSpecifications[spec.key];
            if (!val || !val.trim()) return null;
            return (
              <div 
                key={spec.key} 
                className="flex flex-col sm:flex-row py-3 border-b border-slate-100 dark:border-zinc-800/40 last:border-b-0 items-start sm:items-center text-left"
              >
                <div className="w-full sm:w-[30%] font-semibold text-slate-550 dark:text-zinc-400">
                  {spec.label}
                </div>
                <div className="w-full sm:w-[70%] font-extrabold text-slate-800 dark:text-zinc-150 mt-1 sm:mt-0">
                  {val}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [product]);

  const memoizedIntroduction = useMemo(() => {
    if (!product || !product.description || !product.description.trim()) return null;
    return (
      <div 
        id="Introduction"
        ref={el => sectionRefs.current["Introduction"] = el}
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-lg shadow-xs text-left space-y-sm scroll-mt-28"
      >
        <h2 className="font-headline-sm text-sm text-slate-800 dark:text-zinc-100 font-extrabold pb-xs border-b border-slate-100 dark:border-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] leading-none">info</span> Introduction
        </h2>
        <p className="text-slate-655 dark:text-zinc-300 text-xs leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>
    );
  }, [product]);

  const memoizedProductTabs = useMemo(() => {
    if (!product) return null;
    return (
      <ProductTabs
        computedSections={computedSections}
        openFaqIdx={openFaqIdx}
        setOpenFaqIdx={setOpenFaqIdx}
        product={product}
        sectionRefs={sectionRefs}
      />
    );
  }, [computedSections, openFaqIdx, product]);

  const memoizedPurchaseCard = useMemo(() => {
    if (!product) return null;
    return (
      <PurchaseCard
        product={product}
        quantity={quantity}
        handleDecrement={handleDecrement}
        handleIncrement={handleIncrement}
        handleBuyNow={handleBuyNow}
        handleAddToCart={handleAddToCart}
        discountPercent={discountPercent}
      />
    );
  }, [product, quantity, handleDecrement, handleIncrement, handleBuyNow, handleAddToCart, discountPercent]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) return null;

  if (isMobile) {
    return (
      <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen pb-24 text-left animate-[fade-in_0.3s_ease-out] relative">
        {/* Mobile Header / Breadcrumbs */}
        <div className="pt-4 px-4 flex justify-between items-center select-none">
          <nav className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-primary dark:hover:text-[#a4c9ff] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary dark:hover:text-[#a4c9ff] transition-colors">Products</Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-zinc-305 truncate max-w-[120px]">{product.name}</span>
          </nav>
          <button
            onClick={handleShare}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 border border-slate-100 dark:border-zinc-800 rounded-full bg-white dark:bg-zinc-900 shadow-2xs cursor-pointer animate-[fade-in_0.2s_ease-out]"
          >
            <Share2 size={14} />
          </button>
        </div>

        {/* Product Title Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm mx-4 mt-3 mb-4 text-left overflow-hidden max-w-[calc(100vw-2rem)]">
          <h1 className="font-headline-sm text-lg font-extrabold text-slate-905 dark:text-zinc-100 leading-tight break-words">
            {product.name}
          </h1>
          {product.molecules && product.molecules.length > 0 && (
            <div className="text-xs font-semibold text-[#004782] dark:text-[#a4c9ff] underline mt-1.5 uppercase break-words max-w-full leading-relaxed">
              {product.molecules.map((mol) => mol.name).join(", ")}
            </div>
          )}

        </div>

        {/* Product Image Gallery Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm mx-4 mb-4 relative flex flex-col items-center justify-center">
          <div className="relative w-full aspect-square flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-955 p-4 border border-slate-105 dark:border-zinc-850">
            {/* Discount Percentage Tag */}
            {discountPercent > 0 && (
              <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full z-10 select-none">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={imagesList[activeImageIdx]}
              alt={product.name}
              className="max-h-[90%] max-w-[90%] object-contain select-none"
            />
            {/* WhatsApp Icon */}
            <a
              href="https://wa.me/911234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 w-10 h-10 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.37 5.054L2 22l5.077-1.331a9.92 9.92 0 0 0 4.933 1.314h.005c5.505 0 9.988-4.478 9.99-9.985A9.972 9.972 0 0 0 12.012 2zm5.723 14.12c-.25.706-1.442 1.341-1.986 1.424-.492.077-1.134.14-3.328-.769-2.805-1.162-4.59-4.004-4.73-4.188-.14-.186-1.137-1.513-1.137-2.887 0-1.373.72-2.049.977-2.321.257-.272.565-.34.753-.34H9.5c.189 0 .443-.072.695.529.251.604.858 2.088.932 2.239.076.151.127.327.026.529-.101.202-.152.327-.303.504-.152.176-.32.392-.457.525-.152.151-.31.317-.133.621.176.303.784 1.29 1.684 2.093.9 1.006 1.658 1.318 1.96 1.469.303.151.48.127.656-.076.176-.202.753-.876.953-1.178.201-.302.402-.252.68-.151.278.101 1.764.832 2.067.983.303.151.504.227.58.353.076.126.076.731-.174 1.437z"/>
              </svg>
            </a>
          </div>

          {/* Star Rating below image */}
          <div className="flex items-center justify-between w-full px-2 mt-3 select-none">
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star size={15} fill="currentColor" stroke="none" />
              <Star size={15} fill="currentColor" stroke="none" />
              <Star size={15} fill="currentColor" stroke="none" />
              <Star size={15} fill="currentColor" stroke="none" />
              <Star size={15} fill="currentColor" stroke="none" />
            </div>
            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <span className="font-extrabold">4.8</span>
              <span className="text-amber-400 text-[10px]">★</span>
              <span>On</span>
              <span>
                <span className="font-black text-[#4285F4]">G</span>
                <span className="font-black text-[#EA4335]">o</span>
                <span className="font-black text-[#FBBC05]">o</span>
                <span className="font-black text-[#4285F4]">g</span>
                <span className="font-black text-[#34A853]">l</span>
                <span className="font-black text-[#EA4335]">e</span>
              </span>
            </div>
          </div>

          {/* Thumbnails below rating */}
          {imagesList.length > 1 && (
            <div className="flex gap-2 justify-start w-full mt-3 overflow-x-auto no-scrollbar pb-1 px-2 select-none">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-11 h-11 rounded-xl bg-white dark:bg-zinc-900 border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer overflow-hidden ${
                    activeImageIdx === idx
                      ? "border-[#038076] scale-[1.02]"
                      : "border-slate-100 dark:border-zinc-800"
                  }`}
                  aria-label={`Select image ${idx + 1}`}
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Packaging Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-105 dark:border-zinc-800 rounded-3xl p-4 shadow-sm mx-4 mb-4 text-left">
          {/* Price & Discount Row */}
          <div className="flex justify-between items-start mb-2 select-none">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  MRP: <span className="line-through">{formatCurrency(product.originalPrice)}</span>
                </p>
              )}
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                Inclusive of all taxes
              </p>
            </div>
            {discountPercent > 0 && (
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Selected Packaging Capsule */}
          {(product.packSize || product.productSpecifications?.packSize) && (
            <div className="mt-3 bg-blue-500/[0.03] border border-blue-500/20 rounded-2xl p-3 flex justify-between items-center relative select-none">
              <div>
                <p className="text-xs font-black text-slate-805 dark:text-zinc-150">
                  {product.packSize || product.productSpecifications?.packSize}
                </p>
                <p className="text-[10px] text-slate-455 dark:text-zinc-400 mt-1 font-semibold">
                  {formatCurrency(getUnitPrice())}/Unit
                </p>
              </div>
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                ✓
              </span>
            </div>
          )}
        </div>

        {/* Badges inline row */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl px-4 py-3 shadow-sm mx-4 mb-4 flex items-center justify-between text-left select-none">
          <div className="flex gap-4 items-center flex-wrap">
            {product.requiresRx && (
              <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-250 flex items-center gap-1.5">
                <span className="text-[#845ec2] font-black text-xs border border-[#845ec2]/40 rounded-full w-5 h-5 flex items-center justify-center">Rₓ</span> Prescription Required
              </span>
            )}
            {product.isColdChain && (
              <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-250 flex items-center gap-1.5">
                <span className="text-sky-500">❄️</span> Cold Chain
              </span>
            )}
          </div>
          <button className="text-slate-400 hover:text-slate-655 dark:hover:text-zinc-200">
            <Info size={16} />
          </button>
        </div>

        {/* Salt Composition & Marketer Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-105 dark:border-zinc-800 rounded-3xl p-4 shadow-sm mx-4 mb-4 text-left space-y-3.5 overflow-hidden max-w-[calc(100vw-2rem)]">
          {/* Salt Composition */}
          {product.molecules && product.molecules.length > 0 && (
            <div className="max-w-full overflow-hidden">
              <h4 className="text-[10.5px] font-black text-slate-455 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Salt Composition
              </h4>
              <div className="text-xs font-bold text-[#004782] dark:text-[#a4c9ff] uppercase leading-relaxed flex flex-wrap gap-x-2 gap-y-1 break-words max-w-full">
                {product.molecules.map((mol, idx) => (
                  <Link key={mol.slug || idx} to={`/molecules/${mol.slug}`} className="underline hover:opacity-85 break-words max-w-full inline-block">
                    {mol.name}{idx < product.molecules.length - 1 ? "," : ""}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Marketer */}
          {(product.manufacturer || product.brand) && (
            <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800/80">
              <h4 className="text-[10.5px] font-black text-slate-455 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Marketer
              </h4>
              <p className="text-xs font-extrabold text-slate-805 dark:text-zinc-150 uppercase">
                {product.manufacturer || product.brand}
              </p>
            </div>
          )}

          {/* Prepaid / Returns */}
          <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400 select-none">
            <span>Prepaid Only. Non-Returnable.</span>
            <HelpCircle size={15} className="text-slate-400 cursor-pointer" />
          </div>
        </div>

        {/* Dual Delivery Cards */}
        <div className="grid grid-cols-2 gap-3 mx-4 mb-3 text-left">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex justify-between items-center shadow-2xs">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Get it by</p>
              <p className="text-xs font-black text-slate-805 dark:text-zinc-200 mt-0.5">{getDeliveryDateRange()}</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex justify-between items-center shadow-2xs">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Delivering To</p>
              <p className="text-xs font-black text-[#004782] dark:text-[#a4c9ff] truncate max-w-[100px] mt-0.5">Pune, 411035</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px] cursor-pointer">edit</span>
          </div>
        </div>

        {/* Cold Chain Ticking Banner */}
        {product.isColdChain && (
          <div className="mx-4 mb-3 bg-sky-500/[0.03] border border-sky-500/10 rounded-2xl p-3.5 flex items-start gap-3.5 text-left">
            <div className="bg-sky-500/10 p-2.5 rounded-2xl text-sky-600 shrink-0">
              <span className="material-symbols-outlined text-[20px] leading-none animate-bounce">local_shipping</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-sky-700 dark:text-sky-400 uppercase tracking-wider">{formatTimeLeft(timeLeft)}</span>
                <span className="text-[10px] text-slate-405 font-bold">• Cold Chain Guaranteed</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal">
                Your medicine's temperature matters — we pause cold-chain delivery if temperature goes out of range. <span className="text-sky-600 dark:text-sky-400 font-bold underline cursor-pointer">Learn More</span>
              </p>
            </div>
          </div>
        )}

        {/* Prescription Verification Warning */}
        {product.requiresRx && (
          <div className="mx-4 mb-3 bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-3.5 flex items-start gap-3.5 text-left">
            <div className="bg-red-500/10 p-2.5 rounded-2xl text-red-650 shrink-0">
              <span className="material-symbols-outlined text-[20px] leading-none">description</span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-[11px] text-red-650 dark:text-red-400 uppercase tracking-wider">Prescription Verification Required</h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal">
                A registered pharmacist will verify your prescription before shipment. Upload during checkout.
              </p>
            </div>
          </div>
        )}

        {/* Substitutes Section */}
        {substituteProducts.length > 0 && (
          <div className="mx-4 mb-4">
            <SubstituteProducts substituteProducts={substituteProducts} product={product} />
          </div>
        )}

        {/* Doctor Care Offer Banner */}
        <div className="mx-4 mb-4 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-50 to-[#e0f2fe] dark:from-zinc-800/40 dark:to-zinc-850/40 border border-blue-500/10 flex items-center justify-between p-4 relative shadow-2xs text-left">
          <div className="space-y-1.5 max-w-[65%]">
            <p className="text-[9px] text-[#004782] dark:text-[#a4c9ff] font-extrabold uppercase tracking-wider">Every GLP-1 order</p>
            <h4 className="text-xs font-black text-slate-800 dark:text-zinc-150 leading-tight">Comes with extra care</h4>
            <div className="bg-[#482b8f] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full inline-block">
              Get Free
            </div>
            <p className="text-[9px] text-slate-500 dark:text-zinc-405 font-bold leading-relaxed">
              5X Sterile Needles & 6X Alcohol Swabs <span className="text-slate-400 text-[8px] font-medium block mt-0.5">(Imported from Ireland)</span>
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150"
            alt="Professional Doctor"
            className="w-20 h-20 object-cover rounded-full border-2 border-white dark:border-zinc-700 shadow-md shrink-0 self-end"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="mx-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: "overview", label: "Medicine Overview" },
            { id: "concerns", label: "Patient Concerns" },
            { id: "info", label: "In Depth Info" },
            { id: "disclaimer", label: "Disclaimer" }
          ].map((tab) => {
            const isActive = activeMobileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMobileTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                    : "bg-white text-slate-655 border-slate-205 hover:bg-slate-50 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tabs Content rendering */}
        <div className="mx-4 mb-4 text-left">
          {activeMobileTab === "overview" && (
            <div className="space-y-4">
              {/* Introduction Card */}
              {product.description && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wider mb-2">
                    Introduction
                  </h3>
                  <p className="text-slate-600 dark:text-zinc-305 text-xs leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
              {/* All Clinical Index Sections */}
              {computedSections.map((sec) => (
                <div key={sec.id} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm text-left">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                    {sec.title}
                  </h3>

                  {/* Key Benefits */}
                  {sec.type === "benefits" && product.benefits && (
                    <div className="grid grid-cols-1 gap-2.5 mt-2">
                      {product.benefits.map((b, i) => (
                        <div key={i} className="p-2.5 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] rounded-2xl border border-emerald-500/10 flex gap-2 items-start">
                          <CheckCircle className="text-[#086b53] shrink-0 mt-0.5" size={14} />
                          <div>
                            <p className="font-bold text-xs text-slate-800 dark:text-zinc-200">{b.title}</p>
                            {b.description && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{b.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dosage & Usage */}
                  {sec.type === "usage" && product.usageInstructions && (
                    <ul className="space-y-2 text-xs text-slate-650 dark:text-zinc-300 font-medium mt-2">
                      {product.usageInstructions.map((inst, idx) => (
                        <li key={idx} className="flex gap-2 items-start leading-relaxed">
                          <Check className="text-[#004782] shrink-0 mt-0.5" size={12} />
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Side Effects */}
                  {sec.type === "sideeffects" && product.sideEffects && (
                    <ul className="space-y-2 text-xs text-slate-650 dark:text-zinc-300 font-medium mt-2">
                      {product.sideEffects.map((side, idx) => (
                        <li key={idx} className="flex gap-2 items-start leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-550 shrink-0 mt-1.5" />
                          <span>{side}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Storage */}
                  {sec.type === "storage" && product.storageInstructions && (
                    <ul className="space-y-2 text-xs text-slate-650 dark:text-zinc-300 font-medium mt-2">
                      {product.storageInstructions.map((store, idx) => (
                        <li key={idx} className="flex gap-2 items-start leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#086b53] shrink-0 mt-1.5" />
                          <span>{store}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Warnings */}
                  {sec.type === "warnings" && product.warnings && (
                    <div className="space-y-2 mt-2">
                      {product.warnings.map((warn, idx) => (
                        <div key={idx} className="p-2.5 bg-red-500/[0.02] border border-red-500/10 rounded-2xl flex gap-2 items-start">
                          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={14} />
                          <p className="text-xs text-slate-650 dark:text-zinc-300 leading-relaxed">{warn}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Safety */}
                  {sec.type === "safety" && product.safetyCards && (
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {product.safetyCards.map((card, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50/50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800 dark:text-zinc-100">{card.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">{card.status}</span>
                          </div>
                          {card.description && <p className="text-[10px] text-slate-500 dark:text-zinc-400">{card.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Plain / Custom Content */}
                  {sec.content && !sec.type && (
                    <div className="text-slate-600 dark:text-zinc-305 text-xs leading-relaxed whitespace-pre-line mt-2">
                      {sec.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeMobileTab === "concerns" && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wider mb-3">
                  Warnings & Precautions
                </h3>
                {product.warnings && product.warnings.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-2 text-slate-605 dark:text-zinc-305 text-xs leading-relaxed">
                    {product.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-455 text-xs">No specific precaution warnings registered.</p>
                )}
              </div>
              {computedSections.find(s => s.id === "Precautions")?.content && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wider mb-2">
                    Safety Advice
                  </h3>
                  <div className="text-slate-605 dark:text-zinc-305 text-xs leading-relaxed whitespace-pre-line">
                    {computedSections.find(s => s.id === "Precautions").content}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMobileTab === "info" && (
            <div className="space-y-4">
              {/* Product Specifications */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wider mb-3">
                  Specifications
                </h3>
                <div className="flex flex-col text-xs divide-y divide-slate-100 dark:divide-zinc-800/40">
                  {product.productSpecifications && Object.entries(product.productSpecifications).map(([key, val]) => {
                    if (!val || typeof val !== "string" || !val.trim()) return null;
                    const label = key.replace(/([A-Z])/g, " $1").trim().replace(/^\w/, c => c.toUpperCase());
                    return (
                      <div key={key} className="flex py-2.5 items-center">
                        <span className="w-1/3 font-semibold text-slate-500 dark:text-zinc-400">{label}</span>
                        <span className="w-2/3 font-bold text-slate-805 dark:text-zinc-150 pl-2">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* References / Citations */}
              {product.references && product.references.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wider mb-3">
                    Citations & References
                  </h3>
                  <ul className="list-decimal pl-4 space-y-2 text-slate-500 dark:text-zinc-400 text-xs break-all">
                    {product.references.map((refLink, i) => (
                      <li key={i}>
                        <a href={refLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#004782] dark:text-[#a4c9ff]">
                          {refLink}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeMobileTab === "disclaimer" && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 uppercase tracking-wider mb-2">
                Disclaimer
              </h3>
              <p className="text-slate-455 dark:text-zinc-500 text-[11px] leading-relaxed">
                The information provided here is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Do not disregard professional medical advice or delay in seeking it because of something you have read on this website.
              </p>
            </div>
          )}
        </div>

        {/* Related Products Section (Mobile Responsive) */}
        {relatedProducts.length > 0 && (
          <div className="mx-4 mb-6 text-left">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-100 mb-3">
              Related Products
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-3">
              {relatedProducts.map((p) => (
                <div key={p.id || p._id} className="snap-start shrink-0 w-[180px] sm:w-[210px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products (Mobile Responsive) */}
        {recentlyViewed.length > 0 && (
          <div className="mx-4 mb-6 text-left">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-100 mb-3">
              Recently Viewed Products
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-3">
              {recentlyViewed.map((p) => (
                <div key={p.id || p._id} className="snap-start shrink-0 w-[180px] sm:w-[210px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sticky Bottom Bar (Mobile/Tablet only) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-105 dark:border-zinc-800/80 p-sm shadow-2xl z-40 flex items-center justify-between gap-md animate-[slide-up_0.2s_ease-out]">
          <div className="text-left pl-sm">
            <p className="text-[9px] text-slate-455 font-black uppercase tracking-wider">Total Price</p>
            <p className="text-base font-black text-[#02665e] dark:text-[#52d6c9]">
              {formatCurrency(product.price * (isInCart ? cartQuantity : quantity))}
            </p>
          </div>
          <div className="flex gap-xs flex-1 max-w-[240px] items-center">
            {isInCart ? (
              <>
                <button
                  onClick={() => navigate("/cart")}
                  className="flex-1 bg-[#02665e] hover:bg-[#014d47] text-white font-black h-11 rounded-xl text-[10.5px] outline-none cursor-pointer transition-all active:scale-95 shadow-sm flex items-center justify-center gap-0.5 select-none"
                >
                  Go To Cart <span className="text-xs font-semibold">↗</span>
                </button>
                <div className="flex-1 flex items-center justify-between p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl h-11">
                  <button
                    type="button"
                    onClick={() => updateQuantity(productId, cartQuantity - 1)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-700 dark:text-zinc-200 font-extrabold text-sm select-none cursor-pointer hover:bg-slate-50 shadow-xs"
                  >
                    -
                  </button>
                  <span className="w-8 h-8 rounded-full bg-[#02665e] text-white flex items-center justify-center font-extrabold text-xs select-none shadow-xs">
                    {cartQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(productId, cartQuantity + 1)}
                    disabled={cartQuantity >= (product.stock || 30)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-700 dark:text-zinc-200 font-extrabold text-sm select-none cursor-pointer hover:bg-slate-50 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={handleBuyNow}
                  disabled={product.inStock === false || product.stock === 0}
                  className="flex-1 bg-[#02665e] hover:bg-[#014d47] text-white font-black h-11 rounded-xl text-xs outline-none cursor-pointer transition-all active:scale-95 shadow-sm"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.inStock === false || product.stock === 0}
                  className="flex-1 bg-white hover:bg-slate-50 dark:bg-zinc-900 border border-[#02665e] text-[#02665e] font-black h-11 rounded-xl text-xs outline-none cursor-pointer transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1"
                >
                  Add <ShoppingCart size={13} />
                  Add <ShoppingCart size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="max-w-[1550px] mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Breadcrumbs */}
      <nav className="mb-lg text-xs font-semibold text-slate-400 dark:text-zinc-500 flex items-center gap-xs flex-wrap select-none">
        <Link to="/" className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">Products</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">{product.category?.name || product.category}</Link>
        <span>/</span>
        <span className="text-slate-655 dark:text-zinc-300 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2-COLUMN ROOT LAYOUT: LEFT SIDEBAR & RIGHT CONTAINER */}
      <div className="flex flex-col md:flex-row gap-lg mb-xl items-start w-full">
        
        {/* LEFT SIDEBAR (22% on desktop, 30% on tablet, 100% on mobile) */}
        {memoizedStickySidebar}

        {/* RIGHT CONTAINER (78% on desktop, 70% on tablet, 100% on mobile) */}
        <div className="w-full md:w-[68%] lg:w-[78%] flex flex-col gap-md order-1 md:order-2 lg:order-2">
          
          {/* Top Row: Center Content & Purchase Card */}
          <div className="flex flex-col lg:flex-row gap-lg items-start w-full">
            {/* Center Content Column (Product Info, Gallery, Dispatch/Delivery, Rx/Cold Chain) */}
            <div className="w-full lg:w-[66.6%] space-y-md">
              {/* Combined Product Info & Image Gallery Card */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-xs p-lg flex flex-col lg:flex-row gap-lg items-stretch">
                {/* Left: Product Information (60%) */}
                <div className="w-full lg:w-[60%] flex flex-col justify-between">
                  {memoizedProductInfo}
                </div>

                {/* Right: Product Image Gallery (40%) */}
                <div className="w-full lg:w-[40%] flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-zinc-800 pt-lg lg:pt-0 lg:pl-lg">
                  {memoizedProductGallery}
                </div>
              </div>

              {/* Dispatch Banner / Cards */}
              {memoizedDispatchDelivery}

              {/* Prescription and Cold Chain Cards */}
              {memoizedRxColdChain}
            </div>

            {/* Right Column: Purchase Panel */}
            <div className="w-full lg:w-[33.4%]">
              {memoizedPurchaseCard}
            </div>
          </div>

          {/* Bottom Area: Combined Center + Right Column space */}
          <div className="w-full space-y-md mt-md">
            {/* Product Specifications Section */}
            {memoizedSpecifications}

            {/* Introduction Card */}
            {memoizedIntroduction}

            {/* Clinical Info sections */}
            {memoizedProductTabs}
          </div>

        </div>

      </div>

      {/* Bottom carousels */}
      {substituteProducts.length > 0 && (
        <section className="pt-xxl border-t border-outline-variant/30 dark:border-outline/20 mt-xxl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xl font-black text-left">Substitute Products (Same Category)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[10px] md:gap-lg">
            {substituteProducts.map((p) => (
              <ProductCard key={p.id || p._id} product={p} />
            ))}
          </div>
        </section>
      )}

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

      {recentlyViewed.length > 0 && (
        <section className="pt-xxl border-t border-outline-variant/30 dark:border-outline/20 mt-xl">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-xl font-black text-left">Recently Viewed Products</h2>
          <div className="flex gap-sm md:gap-lg overflow-x-auto pb-md scroll-smooth snap-x snap-mandatory scrollbar-none">
            {recentlyViewed.map((p) => (
              <div key={p.id || p._id} className="snap-start shrink-0 w-[calc((100%-8px)/1.45)] md:w-[calc(33.33%-8px)] lg:w-[calc(25%-18px)]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Bar (Mobile/Tablet only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/80 p-sm shadow-2xl z-40 flex items-center justify-between gap-md animate-[slide-up_0.2s_ease-out]">
        <div className="text-left pl-sm">
          <p className="text-[9px] text-slate-455 font-black uppercase tracking-wider">Total Price</p>
          <p className="text-base font-black text-[#004782] dark:text-primary-fixed-dim">
            {formatCurrency(product.price * quantity)}
          </p>
        </div>
        <div className="flex gap-xs flex-1 max-w-[240px]">
          <button
            onClick={handleBuyNow}
            disabled={product.inStock === false || product.stock === 0}
            className="flex-1 bg-[#086b53] hover:bg-[#055746] text-white font-black h-11 rounded-xl text-xs outline-none cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.inStock === false || product.stock === 0}
            className="flex-1 bg-[#004782] hover:bg-[#003c6e] text-white font-black h-11 rounded-xl text-xs outline-none cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            Add
          </button>
        </div>
      </div>

      {/* Premium Floating Image Viewer Modal */}
      {isFullscreenOpen && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsFullscreenOpen(false);
            }
          }}
          className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-md animate-[fade-in_0.25s_ease-out] select-none cursor-default"
        >
          {/* Modal Container Card */}
          <div 
            className="bg-white dark:bg-zinc-900 w-[95vw] md:w-[70vw] max-w-[900px] h-auto max-h-[80vh] md:max-h-[85vh] rounded-3xl shadow-2xl relative flex flex-col items-center justify-center p-lg animate-[scale-up_0.25s_ease-out] border border-slate-100 dark:border-zinc-800/40"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-slate-800 dark:text-zinc-200 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-20"
              aria-label="Close image viewer"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>

            {/* Left navigation arrow */}
            {imagesList.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIdx((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-100/90 hover:bg-slate-200/95 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/95 text-slate-850 dark:text-zinc-200 w-11 h-11 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} className="stroke-[2.5]" />
              </button>
            )}

            {/* Image Viewer */}
            <div className="w-full flex items-center justify-center p-md md:p-lg overflow-hidden h-[65vh] md:h-[70vh]">
              <img 
                src={imagesList[activeImageIdx]} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain rounded-2xl transition-all duration-200 ease-in-out select-none"
              />
            </div>

            {/* Right navigation arrow */}
            {imagesList.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIdx((prev) => (prev + 1) % imagesList.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-100/90 hover:bg-slate-200/95 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/95 text-slate-850 dark:text-zinc-200 w-11 h-11 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-10"
                aria-label="Next image"
              >
                <ChevronRight size={24} className="stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProductDetails;
