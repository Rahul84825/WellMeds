import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from "../utils/currency";

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

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [substituteProducts, setSubstituteProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });

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
        
        // Fetch all products for fallbacks
        const allProds = await api.getProductsList();
        
        // Related products: from product.relatedProducts or fallback to same manufacturer
        if (prod.relatedProducts && prod.relatedProducts.length > 0) {
          setRelatedProducts(prod.relatedProducts);
        } else {
          const related = allProds.filter(p => (p.manufacturer || p.brand) === (prod.manufacturer || prod.brand) && p.slug !== prod.slug).slice(0, 4);
          setRelatedProducts(related);
        }

        // Substitute products: fetch dynamically using matching molecules sorted by priority
        try {
          const substitutes = await api.getSimilarProducts(prod._id || prod.id);
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
        } catch (e) {
          console.warn("Failed to fetch substitute products:", e);
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
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [slug, navigate]);

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

  const handleIncrement = () => {
    if (quantity < 30) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (product.inStock === false || product.stock === 0) return;
    addToCart(product, quantity);
    toast.success(`${quantity} item(s) added to cart.`);
  };

  const handleBuyNow = () => {
    if (product.inStock === false || product.stock === 0) return;
    addToCart(product, quantity);
    navigate("/cart");
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!product) return null;

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

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

      {/* 3-COLUMN DESKTOP / 2-COLUMN TABLET / 1-COLUMN MOBILE LAYOUT */}
      <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap gap-lg mb-xl items-start w-full">
        
        {/* LEFT SIDEBAR (22% on desktop, 28% on tablet, 100% on mobile) */}
        <StickySidebar
          substituteProducts={substituteProducts}
          product={product}
          computedSections={computedSections}
          activeSection={activeSection}
        />

        {/* CENTER CONTENT (52% on desktop, 68% on tablet, 100% on mobile) */}
        <div className="w-full md:w-[68%] lg:w-[52%] space-y-md order-1 md:order-2 lg:order-2">
          {/* Combined Product Info & Image Gallery Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-xs p-lg flex flex-col lg:flex-row gap-lg items-stretch">
            {/* Left: Product Information (60%) */}
            <div className="w-full lg:w-[60%] flex flex-col justify-between">
              <ProductInfo product={product} handleShare={handleShare} />
            </div>

            {/* Right: Product Image Gallery (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-zinc-850 pt-lg lg:pt-0 lg:pl-lg">
              <ProductGallery
                imagesList={imagesList}
                activeImageIdx={activeImageIdx}
                setActiveImageIdx={setActiveImageIdx}
                isImageLoading={isImageLoading}
                setIsImageLoading={setIsImageLoading}
                handleMouseMove={handleMouseMove}
                handleMouseLeave={handleMouseLeave}
                handleTouchStart={handleTouchStart}
                handleTouchMove={handleTouchMove}
                handleTouchEnd={handleTouchEnd}
                setIsFullscreenOpen={setIsFullscreenOpen}
                discountPercent={discountPercent}
                productName={product.name}
              />
            </div>
          </div>

          {/* Dispatch Banner / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <DispatchCard />
            <DeliveryCard />
          </div>

          {/* Prescription and Cold Chain Cards */}
          <div className="space-y-sm">
            <RXCard requiresRx={product.requiresRx} />
            <ColdChainCard isColdChain={product.isColdChain} />
          </div>

          {/* Product Specifications Section */}
          {product.productSpecifications && Object.values(product.productSpecifications).some(v => v !== undefined && v !== "") && (
            <div 
              id="Specifications"
              ref={el => sectionRefs.current["Specifications"] = el}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs text-left space-y-sm scroll-mt-28"
            >
              <h2 className="font-headline-sm text-sm text-slate-800 dark:text-zinc-100 font-extrabold pb-xs border-b border-slate-100 dark:border-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] leading-none">list_alt</span> Product Specifications
              </h2>
              <div className="overflow-x-auto w-full rounded-2xl border border-slate-150 dark:border-zinc-800">
                <table className="w-full text-xs text-left border-collapse min-w-[450px] sm:min-w-0">
                  <thead>
                    <tr className="bg-[#004782] text-white">
                      <th className="px-lg py-md font-bold text-xs md:text-sm align-middle w-1/3 border-r border-[#004782]">Specification</th>
                      <th className="px-lg py-md font-bold text-xs md:text-sm align-middle">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#004782]/[0.03] dark:bg-[#004782]/[0.015]">
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
                        <tr 
                          key={spec.key} 
                          className="border-b border-slate-100 dark:border-zinc-800/40 last:border-b-0 hover:bg-[#004782]/10 dark:hover:bg-[#004782]/5"
                        >
                          <td className="px-lg py-md font-bold text-slate-505 dark:text-zinc-400 border-r border-slate-100 dark:border-zinc-800/40">{spec.label}</td>
                          <td className="px-lg py-md font-medium text-slate-750 dark:text-zinc-200">{val}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Introduction Card */}
          {product.description && product.description.trim() && (
            <div 
              id="Introduction"
              ref={el => sectionRefs.current["Introduction"] = el}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs text-left space-y-sm scroll-mt-28"
            >
              <h2 className="font-headline-sm text-sm text-slate-800 dark:text-zinc-100 font-extrabold pb-xs border-b border-slate-100 dark:border-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] leading-none">info</span> Introduction
              </h2>
              <p className="text-slate-655 dark:text-zinc-300 text-xs leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Clinical Info sections */}
          <ProductTabs
            computedSections={computedSections}
            openFaqIdx={openFaqIdx}
            setOpenFaqIdx={setOpenFaqIdx}
            product={product}
            sectionRefs={sectionRefs}
          />
        </div>

        {/* RIGHT SIDEBAR (30% on desktop, 100% on tablet/mobile) */}
        <PurchaseCard
          product={product}
          quantity={quantity}
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          handleBuyNow={handleBuyNow}
          handleAddToCart={handleAddToCart}
          discountPercent={discountPercent}
        />
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
