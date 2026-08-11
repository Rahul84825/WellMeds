import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import { X, ChevronLeft, ChevronRight, Share2, Snowflake, ShoppingCart, Star, Info, HelpCircle, CheckCircle, AlertTriangle, Check } from "lucide-react";
import { formatCurrency, calculateDiscountPercent } from "../utils/currency";
import { DEFAULT_PRODUCT_IMAGE } from "../utils/placeholder";
import { getCardImageUrl } from "../utils/image";

// Prescription Design System Stylesheet
import "../components/ProductDetail/ProductDetail.css";

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
import SafetyAdviceCards from "../components/ProductDetail/SafetyAdviceCards";
import SubstituteProducts from "../components/ProductDetail/SubstituteProducts";
import ProductDetailSkeleton from "../components/ProductDetail/ProductDetailSkeleton";
import { renderStorageContent } from "../utils/renderStorageContent";

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

  const discountPercent = useMemo(() => {
    if (product?.originalPrice && product.originalPrice > product.price) {
      return calculateDiscountPercent(product.originalPrice, product.price);
    }
    return 0;
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
          api.getSubstitutes(prod._id || prod.id).catch(() => []),
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

        // Substitute products: strictly clinically equivalent substitutes only (zero category fallback)
        setSubstituteProducts(Array.isArray(substitutes) ? substitutes : []);

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

    const canonicalUrl = `https://wellmeds.in/products/${product.slug}`;
    const brandNameStr = typeof product.brand === "object" ? (product.brand?.name || "WellMeds") : (product.brand || product.manufacturer || "WellMeds");

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "@id": `${canonicalUrl}#product`,
          "name": product.name,
          "image": product.images && product.images.length > 0 ? product.images : [product.image || "https://wellmeds.in/og-default.jpg"],
          "description": product.seo?.metaDescription || product.description || `Buy ${product.name} online from WellMeds. Genuine prescription medicines and fast delivery.`,
          "sku": product.sku || product._id,
          "brand": {
            "@type": "Brand",
            "name": brandNameStr
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": product.price || 0,
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": (product.inStock !== false && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": canonicalUrl,
            "seller": {
              "@type": "Organization",
              "name": "WellMeds",
              "url": "https://wellmeds.in"
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "IN",
              "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
              "merchantReturnDays": 7,
              "returnMethod": "https://schema.org/ReturnByMail",
              "returnFees": "https://schema.org/FreeReturn"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "INR"
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "IN"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 0,
                  "maxValue": 1,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 3,
                  "unitCode": "DAY"
                }
              }
            }
          }
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://wellmeds.in"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Products",
              "item": "https://wellmeds.in/products"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": product.name,
              "item": canonicalUrl
            }
          ]
        }
      ]
    };

    if (faqSchemaList.length > 0) {
      jsonLd["@graph"].push({
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
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

  // Compile Dynamic Content Sections
  const computedSections = useMemo(() => {
    if (!product) return [];

    const sections = [];

    // Normalize standard medical sections to match standard IDs
    const medicalSecs = product.medicalSections && product.medicalSections.length > 0
      ? JSON.parse(JSON.stringify(product.medicalSections))
      : [];

    const findAndRemoveMedSec = (titles) => {
      const idx = medicalSecs.findIndex(s => {
        if (!s?.title) return false;
        const lowerTitle = s.title.toLowerCase().trim();
        return titles.some(t => {
          const lowerT = t.toLowerCase();
          return lowerTitle === lowerT || lowerTitle.includes(lowerT) || lowerT.includes(lowerTitle);
        });
      });
      if (idx !== -1) {
        const sec = medicalSecs.splice(idx, 1)[0];
        if (sec && sec.content && typeof sec.content === "string" && sec.content.trim().length > 0) {
          return sec;
        }
      }
      return null;
    };

    // 1. Introduction
    const introSec = findAndRemoveMedSec(["introduction", "intro"]);
    if (introSec) {
      sections.push({ id: "Introduction", title: "Introduction", content: introSec.content });
    }

    // 2. About This Medicine
    const aboutSec = findAndRemoveMedSec(["about this medicine", "about medicine", "about the medicine"]);
    if (aboutSec) {
      sections.push({ id: "AboutThisMedicine", title: "About This Medicine", content: aboutSec.content });
    }

    // 3. Uses
    const usesSec = findAndRemoveMedSec(["uses", "use", "uses & clinical indications", "indications", "what it treats"]);
    if (usesSec) {
      sections.push({ id: "Uses", title: "Uses & Indications", content: usesSec.content });
    }

    // 4. Benefits
    const benefitsSec = findAndRemoveMedSec(["benefits", "key benefits"]);
    if (product.benefits && product.benefits.length > 0) {
      sections.push({ id: "Benefits", title: "Key Benefits", type: "benefits" });
    } else if (benefitsSec) {
      sections.push({ id: "Benefits", title: "Key Benefits", content: benefitsSec.content });
    }

    // 5. Dosage / Usage Instructions
    const usageSec = findAndRemoveMedSec(["dosage", "how to use", "usage instructions", "dosage instructions"]);
    if (product.usageInstructions && product.usageInstructions.length > 0) {
      sections.push({ id: "Dosage", title: "Usage & Dosage Instructions", type: "usage" });
    } else if (usageSec) {
      sections.push({ id: "Dosage", title: "Usage & Dosage Instructions", content: usageSec.content });
    }

    // 6. Warnings & Precautions
    const warningsSec = findAndRemoveMedSec(["warnings", "warnings & precautions", "warnings and precautions"]);
    if (product.warnings && product.warnings.length > 0) {
      sections.push({ id: "Warnings", title: "Warnings & Precautions", type: "warnings" });
    } else if (warningsSec) {
      sections.push({ id: "Warnings", title: "Warnings & Precautions", content: warningsSec.content });
    }

    // 7. Side Effects
    const sideEffectsSec = findAndRemoveMedSec(["side effects", "sideeffects"]);
    if (product.sideEffects && product.sideEffects.length > 0) {
      sections.push({ id: "SideEffects", title: "Side Effects", type: "sideeffects" });
    } else if (sideEffectsSec) {
      sections.push({ id: "SideEffects", title: "Side Effects", content: sideEffectsSec.content });
    }

    // 8. Precautions / Safety Information
    const safetySec = findAndRemoveMedSec(["precautions", "safety information", "safety advice", "safety cards"]);
    if (Array.isArray(product.safetyCards) && product.safetyCards.length > 0) {
      sections.push({ id: "Precautions", title: "Safety Information", type: "safety" });
    } else if (safetySec) {
      sections.push({ id: "Precautions", title: "Safety Information", content: safetySec.content });
    }

    // 9. Storage
    const storageSec = findAndRemoveMedSec(["storage", "storage conditions", "storage instructions"]);
    if (product.storageInstructions && product.storageInstructions.length > 0) {
      sections.push({ id: "Storage", title: "Storage Instructions", type: "storage" });
    } else if (storageSec) {
      sections.push({ id: "Storage", title: "Storage Instructions", content: storageSec.content });
    }

    // 10. FAQs
    const faqsSec = findAndRemoveMedSec(["faqs", "faq", "frequently asked questions"]);
    if (product.faqs && product.faqs.length > 0) {
      sections.push({ id: "FAQs", title: "FAQs", type: "faqs" });
    } else if (faqsSec) {
      sections.push({ id: "FAQs", title: "FAQs", content: faqsSec.content });
    }

    // 11. References (Must appear AFTER all medical sections)
    const referencesSec = findAndRemoveMedSec(["references", "citations & references", "citations and references", "sources"]);
    if (product.references && product.references.length > 0) {
      sections.push({ id: "References", title: "Citations & References", type: "references" });
    } else if (referencesSec) {
      sections.push({ id: "References", title: "Citations & References", content: referencesSec.content });
    }

    // 12. Remaining custom medical sections
    medicalSecs.forEach((sec, idx) => {
      if (sec && sec.content && typeof sec.content === "string" && sec.content.trim().length > 0) {
        sections.push({
          ...sec,
          id: sec.id || `custom-section-${idx}`,
        });
      }
    });

    // Guard: Only return sections that have actual content or populated arrays
    return sections.filter((sec) => {
      if (!sec) return false;
      if (sec.type === "benefits") return product.benefits && product.benefits.length > 0;
      if (sec.type === "usage") return product.usageInstructions && product.usageInstructions.length > 0;
      if (sec.type === "warnings") return product.warnings && product.warnings.length > 0;
      if (sec.type === "sideeffects") return product.sideEffects && product.sideEffects.length > 0;
      if (sec.type === "storage") return product.storageInstructions && product.storageInstructions.length > 0;
      if (sec.type === "safety") return Array.isArray(product.safetyCards);
      if (sec.type === "faqs") return product.faqs && product.faqs.length > 0;
      if (sec.type === "references") return product.references && product.references.length > 0;
      return typeof sec.content === "string" && sec.content.trim().length > 0;
    });
  }, [product]);

  // --- Intersection Observer for Sticky Sidebar Active Section Tracking ---
  useEffect(() => {
    if (loading || !product) return;

    const visibleSections = new Map();

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.set(entry.target.id, entry);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });

      if (visibleSections.size > 0) {
        const sorted = Array.from(visibleSections.values()).sort((a, b) => {
          return a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top;
        });
        if (sorted[0] && sorted[0].target.id) {
          setActiveSection(sorted[0].target.id);
        }
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -40% 0px", // Top margin accounts for fixed navbar (~96px)
      threshold: [0, 0.1, 0.3, 0.5, 0.8, 1.0]
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [loading, product, computedSections]);

  const handleIncrement = useCallback(() => {
    setQuantity(prev => (prev < 30 ? prev + 1 : prev));
  }, []);

  const handleDecrement = useCallback(() => {
    setQuantity(prev => (prev > 1 ? prev - 1 : prev));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product || product.inStock === false || product.stock === 0) return;
    addToCart(product, quantity);
  }, [product, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!product || product.inStock === false || product.stock === 0) return;
    addToCart(product, quantity);
    navigate("/cart");
  }, [product, quantity, addToCart, navigate]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
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
        className="pdp-paper-card p-6 md:p-8 space-y-4 scroll-mt-28 font-sans text-left"
      >
        <h2 className="pdp-serif-title text-xl text-[#172b26] flex items-center gap-2 pb-3 pdp-dashed-line">
          <span className="material-symbols-outlined text-[18px] text-[#157a6d]">list_alt</span> Product Specifications
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
            if (spec.key === "storage") {
              return (
                <div
                  key={spec.key}
                  className="py-3.5 border-b border-dashed border-[#dde8e3] text-left font-sans space-y-2"
                >
                  <div className="font-bold text-xs uppercase tracking-wider text-[#172b26]">
                    {spec.label}
                  </div>
                  <div className="pt-0.5">
                    {renderStorageContent(val)}
                  </div>
                </div>
              );
            }
            return (
              <div
                key={spec.key}
                className="pdp-spec-row"
              >
                <div className="pdp-spec-label">
                  {spec.label}
                </div>
                <div className="pdp-spec-value">
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
        className="pdp-paper-card p-6 md:p-8 space-y-3 scroll-mt-28 text-left"
      >
        <h2 className="pdp-serif-title text-xl text-[#172b26] flex items-center gap-2 pb-3 pdp-dashed-line">
          <span className="material-symbols-outlined text-[18px] text-[#157a6d]">info</span> Product Overview & Introduction
        </h2>
        <p className="font-sans text-xs text-[#3f544d] leading-relaxed whitespace-pre-line">
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

  const memoizedDisclaimer = useMemo(() => {
    return (
      <div
        id="Disclaimer"
        ref={el => sectionRefs.current["Disclaimer"] = el}
        className="pdp-paper-card p-6 md:p-8 space-y-3 scroll-mt-28 text-left font-sans"
      >
        <h2 className="pdp-serif-title text-xl text-[#172b26] flex items-center gap-2 pb-3 pdp-dashed-line">
          <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span> Medical Disclaimer
        </h2>
        <p className="text-xs text-[#5f776e] leading-relaxed">
          The information provided here is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Do not disregard professional medical advice or delay in seeking it because of something you have read on this website.
        </p>
      </div>
    );
  }, []);

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



  // Desktop View
  return (
    <div className="pdp-theme-container pdp-grid-bg min-h-screen py-8 text-black animate-[fade-in_0.3s_ease-out] text-left font-sans">
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 space-y-6">

        {/* Breadcrumbs */}
        <nav className="text-xs font-sans font-bold text-black flex items-center gap-2 flex-wrap select-none mb-4">
          <Link to="/" className="hover:text-[#157a6d] transition-colors">Home</Link>
          <span className="text-[#888888]">/</span>
          <Link to="/products" className="hover:text-[#157a6d] transition-colors">Products</Link>
          <span className="text-[#888888]">/</span>
          <Link to="/products" className="hover:text-[#157a6d] transition-colors">{product.category?.name || product.category}</Link>
          <span className="text-[#888888]">/</span>
          <span className="text-[#157a6d] font-extrabold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2-COLUMN ROOT LAYOUT: LEFT SIDEBAR & RIGHT CONTAINER */}
        <div className="flex flex-col md:flex-row gap-6 items-start w-full">

          {/* LEFT SIDEBAR */}
          {memoizedStickySidebar}

          {/* RIGHT CONTAINER */}
          <div className="w-full md:w-[68%] lg:w-[78%] flex flex-col gap-6 order-1 md:order-2 lg:order-2">

            {/* Top Row: Center Content & Right Purchase Column */}
            <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
              {/* Center Content Column */}
              <div className="w-full lg:w-[66.6%] space-y-5">
                {/* Combined Product Info & Image Gallery Card */}
                <div className="pdp-paper-card p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-stretch">
                  {/* Left: Product Information (60%) */}
                  <div className="w-full lg:w-[60%] flex flex-col justify-between">
                    {memoizedProductInfo}
                  </div>

                  {/* Right: Product Image Gallery (40%) */}
                  <div className="w-full lg:w-[40%] flex items-center justify-center border-t lg:border-t-0 lg:border-l border-dashed border-[#c3d4cc] pt-6 lg:pt-0 lg:pl-6">
                    {memoizedProductGallery}
                  </div>
                </div>

                {/* Mobile Purchase Card (Aligned Directly Under Image Card on Mobile Only) */}
                <div className="lg:hidden">
                  {memoizedPurchaseCard}
                </div>

                {/* Dispatch Banner / Cards */}
                {memoizedDispatchDelivery}

                {/* Prescription and Cold Chain Cards */}
                {memoizedRxColdChain}

                {/* Mobile Substitute Products Card (Aligned Directly Under Delivery Card on Mobile Only) */}
                <div className="lg:hidden">
                  <SubstituteProducts substituteProducts={substituteProducts} product={product} />
                </div>
              </div>

              {/* Right Column: Sticky Purchase Panel (Desktop Only) */}
              <div className="hidden lg:block lg:w-[33.4%] lg:sticky lg:top-24">
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

              {/* Disclaimer Section */}
              {memoizedDisclaimer}
            </div>

          </div>

        </div>

        {/* Bottom carousels */}
        {relatedProducts.length > 0 && (
          <section className="pt-8 border-t border-[#c8dad3] mt-8 text-left font-sans">
            <h2 className="pdp-serif-title text-xl font-bold text-[#0f172a] mb-4">Related Products (Same Brand)</h2>

            {/* Mobile horizontal touch carousel / Desktop grid */}
            <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
              {relatedProducts.map((p) => (
                <div key={p.id || p._id} className="min-w-[220px] w-[220px] sm:min-w-[240px] sm:w-[240px] md:min-w-0 md:w-auto shrink-0 md:shrink snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Bottom Bar (Mobile/Tablet only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-200/80 dark:border-zinc-800/80 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 flex items-center justify-between gap-3 animate-[slide-up_0.2s_ease-out]">
        <div className="text-left shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Price</p>
          <p className="text-base sm:text-lg font-extrabold text-[#038076] dark:text-[#84d6b9] leading-tight">
            {formatCurrency(product.price * (isInCart ? cartQuantity : quantity))}
          </p>
        </div>
        <div className="flex gap-2 flex-1 max-w-[260px] items-center">
          {isInCart ? (
            <>
              <button
                onClick={() => navigate("/cart")}
                className="flex-1 bg-[#038076] hover:bg-[#02665e] active:scale-95 text-white font-bold h-11 rounded-full text-xs sm:text-sm outline-none cursor-pointer transition-all shadow-md flex items-center justify-center select-none"
              >
                Go To Cart
              </button>
              <div className="flex-1 flex items-center justify-between p-1 bg-slate-100 dark:bg-zinc-800 rounded-full h-11 shadow-inner">
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartQuantity - 1)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-700 dark:text-zinc-200 font-extrabold text-sm select-none cursor-pointer hover:bg-slate-50 active:scale-95 shadow-xs"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 h-8 rounded-full bg-[#038076] text-white flex items-center justify-center font-extrabold text-xs select-none shadow-xs">
                  {cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(productId, cartQuantity + 1)}
                  disabled={cartQuantity >= (product.stock || 30)}
                  className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-slate-700 dark:text-zinc-200 font-extrabold text-sm select-none cursor-pointer hover:bg-slate-50 active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
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
                className="flex-1 bg-[#038076] hover:bg-[#02665e] active:scale-95 text-white font-bold h-11 rounded-full text-xs sm:text-sm outline-none cursor-pointer transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false || product.stock === 0}
                className="flex-1 bg-white hover:bg-slate-50 dark:bg-zinc-900 border-2 border-[#038076] text-[#038076] dark:text-[#84d6b9] dark:border-[#84d6b9] font-bold h-11 rounded-full text-xs sm:text-sm outline-none cursor-pointer transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Add</span>
                <ShoppingCart size={15} className="shrink-0" />
              </button>
            </>
          )}
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
            className="bg-white dark:bg-zinc-900 w-[95vw] md:w-[65vw] max-w-[850px] h-auto max-h-[80vh] md:max-h-[80vh] rounded-3xl shadow-2xl relative flex flex-col items-center justify-center p-lg animate-[scale-up_0.25s_ease-out] border border-slate-100 dark:border-zinc-800/40"
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
            <div className="w-full flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden h-[65vh] md:h-[75vh]">
              <img
                src={getCardImageUrl(imagesList[activeImageIdx], { width: 1200 }) || DEFAULT_PRODUCT_IMAGE}
                alt={product.name}
                className="w-full h-full max-w-full max-h-full object-contain rounded-2xl transition-all duration-200 ease-in-out select-none"
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
