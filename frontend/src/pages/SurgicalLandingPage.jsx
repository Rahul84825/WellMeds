import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import SurgicalHeroSection, { SURGICAL_BRAND_LOGOS } from "../components/SurgicalHeroSection";
import { 
  Scissors, 
  Shield, 
  Bandage, 
  Syringe, 
  Bed, 
  Stethoscope, 
  Activity, 
  Heart, 
  Thermometer, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Minus,
  CheckCircle,
  Truck,
  Award,
  ShieldCheck
} from "lucide-react";
import SEO from "../components/common/SEO";

// Helper icon mapping utility
const getSurgicalIcon = (iconName) => {
  const mapping = {
    scissors: Scissors,
    shield: Shield,
    bandage: Bandage,
    syringe: Syringe,
    bed: Bed,
    stethoscope: Stethoscope,
    activity: Activity,
    heart: Heart,
    thermometer: Thermometer,
    layers: Layers,
    wheelchair: Activity, // Fallbacks
    walking: Activity,
    lungs: Activity,
    bone: Activity,
    band_aid: Bandage,
  };
  return mapping[String(iconName).toLowerCase()] || Activity;
};

const SurgicalLandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState({});

  // ── Carousel Controls ──────────────────────────────────────────────────
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(
      Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 4
    );
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [categories, updateArrows]);

  const SCROLL_AMOUNT = 560; // ~3-4 card widths

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.pageX - sliderRef.current.offsetLeft;
    dragScrollLeft.current = sliderRef.current.scrollLeft;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grabbing";
      sliderRef.current.style.userSelect = "none";
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const delta = (x - dragStartX.current) * 1.4;
    sliderRef.current.scrollLeft = dragScrollLeft.current - delta;
  };

  const stopDragging = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
      sliderRef.current.style.userSelect = "";
    }
  };

  // ── Product Carousel Controls ──────────────────────────────────────────
  const prodSliderRef = useRef(null);
  const isProdDragging = useRef(false);
  const prodDragStartX = useRef(0);
  const prodDragScrollLeft = useRef(0);

  const [canScrollProdLeft, setCanScrollProdLeft] = useState(false);
  const [canScrollProdRight, setCanScrollProdRight] = useState(false);

  const updateProdArrows = useCallback(() => {
    const el = prodSliderRef.current;
    if (!el) return;
    setCanScrollProdLeft(el.scrollLeft > 4);
    setCanScrollProdRight(
      Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 4
    );
  }, []);

  useEffect(() => {
    const el = prodSliderRef.current;
    if (!el) return;
    updateProdArrows();
    el.addEventListener("scroll", updateProdArrows, { passive: true });
    const ro = new ResizeObserver(updateProdArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateProdArrows);
      ro.disconnect();
    };
  }, [featuredProducts, updateProdArrows]);

  const PROD_SCROLL_AMOUNT = 600; // ~2-3 product card widths

  const scrollProdLeft = () => {
    prodSliderRef.current?.scrollBy({ left: -PROD_SCROLL_AMOUNT, behavior: "smooth" });
  };

  const scrollProdRight = () => {
    prodSliderRef.current?.scrollBy({ left: PROD_SCROLL_AMOUNT, behavior: "smooth" });
  };

  const handleProdMouseDown = (e) => {
    isProdDragging.current = true;
    prodDragStartX.current = e.pageX - prodSliderRef.current.offsetLeft;
    prodDragScrollLeft.current = prodSliderRef.current.scrollLeft;
    if (prodSliderRef.current) {
      prodSliderRef.current.style.cursor = "grabbing";
      prodSliderRef.current.style.userSelect = "none";
    }
  };

  const handleProdMouseMove = (e) => {
    if (!isProdDragging.current || !prodSliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - prodSliderRef.current.offsetLeft;
    const delta = (x - prodDragStartX.current) * 1.4;
    prodSliderRef.current.scrollLeft = prodDragScrollLeft.current - delta;
  };

  const stopProdDragging = () => {
    if (!isProdDragging.current) return;
    isProdDragging.current = false;
    if (prodSliderRef.current) {
      prodSliderRef.current.style.cursor = "grab";
      prodSliderRef.current.style.userSelect = "";
    }
  };

  useEffect(() => {
    // SEO Optimization
    document.title = "Surgical Products & Clinical Supplies | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Purchase premium clinical-grade surgical instruments, sterile dressings, diagnostics, and patient care equipment online at WellMeds.");

    // Canonical link
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;

    const fetchData = async () => {
      try {
        const [cats, prodsData] = await Promise.all([
          api.getSurgicalCategories(),
          api.getProducts({ isSurgical: "true", limit: 12 })
        ]);
        setCategories(cats || []);
        setFeaturedProducts(prodsData.products || []);
      } catch (err) {
        console.error("Failed to load surgical landing page data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const faqsList = [
    {
      q: "Are the surgical products certified and sterile?",
      a: "Yes. All our clinical surgical instruments and dressings are FDA-approved, CE-certified, and sourced from certified global manufacturers. Sterile items are individually packed with validation indicator stamps."
    },
    {
      q: "Can I place bulk orders for hospitals or clinics?",
      a: "Absolutely. WellMeds offers customized healthcare corporate accounts with bulk volume discount models. Feel free to contact our institutional sales helpdesk for customized quotes."
    },
    {
      q: "What is your return policy on medical equipment?",
      a: "Unopened consumable sterile packs can be returned within 10 days. Diagnostic devices hold standard manufacturer warranties (typically 1 to 5 years). We also run double-checking inspection processes prior to dispatches."
    },
    {
      q: "How fast is the clinical delivery dispatch?",
      a: "Standard dispatches take 24-48 hours. Emergency oxygen support or urgent clinic setup items are qualified for prioritised same-day clinical express logistics in metro regions."
    }
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Surgical Equipment", url: "/surgical" },
  ];

  return (
    <div className="min-h-screen text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-950 font-sans text-left">
      <SEO
        title="Surgical Products & Clinical Supplies | WellMeds"
        description="Purchase premium clinical-grade surgical instruments, sterile dressings, diagnostics, and patient care equipment online at WellMeds."
        canonical="/surgical"
        breadcrumbs={breadcrumbs}
      />
      
      {/* Hero Section: Banner Carousel & Featured Brands */}
      <SurgicalHeroSection />

      {/* Categories Carousel Section */}
      <section id="categories-section" className="py-12 md:py-16 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-row items-center justify-between sm:items-end gap-4 mb-8">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
              Shop Surgical Categories
            </h2>
            <p className="text-slate-400 text-xs font-semibold max-w-md mt-1">
              Dynamic, admin-managed clinical categories providing specialized equipment and instruments.
            </p>
          </div>

          {/* Navigation Controls: ( ← ) [ View all ] ( → ) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label="Scroll surgical categories left"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] active:scale-95 shadow-2xs"
                  : "opacity-30 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* View All Link */}
            <Link
              to="/surgical/categories"
              className="inline-flex items-center justify-center px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-medium text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] transition-all duration-200 shrink-0"
              aria-label="View all categories"
            >
              <span>View all</span>
            </Link>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label="Scroll surgical categories right"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] active:scale-95 shadow-2xs"
                  : "opacity-30 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[20vh] flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl">
            <p className="text-slate-400 font-semibold text-xs">No categories configured yet. Add them in the Admin Panel.</p>
          </div>
        ) : (
          <div
            ref={sliderRef}
            role="list"
            aria-label="Surgical categories carousel"
            className="no-scrollbar flex flex-row gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pt-2 pb-5 select-none cursor-grab active:cursor-grabbing"
            style={{
              WebkitOverflowScrolling: "touch",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            {categories.map((cat, idx) => (
              <div
                key={(cat.id || cat._id)?.toString()}
                role="listitem"
                className="shrink-0 snap-start"
              >
                <CategoryCard category={cat} isSurgical={true} index={idx} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Surgical Products Section */}
      <section className="bg-slate-100/50 dark:bg-zinc-900/20 py-16 border-y border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-row items-center justify-between sm:items-end gap-4 mb-8">
            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight m-0">
                Featured Surgical Products
              </h2>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Top-rated clinical instruments and diagnostic devices in stock.
              </p>
            </div>

            {/* Navigation Controls: ( ← ) [ View all ] ( → ) */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Left Arrow Button */}
              <button
                type="button"
                onClick={scrollProdLeft}
                disabled={!canScrollProdLeft}
                aria-label="Scroll surgical products left"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                  canScrollProdLeft
                    ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] active:scale-95 shadow-2xs"
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              {/* View All Link */}
              <Link
                to="/surgical/all"
                className="inline-flex items-center justify-center px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-medium text-[#157a6d] dark:text-emerald-400 hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] transition-all duration-200 shrink-0"
                aria-label="View all surgical products"
              >
                <span>View all</span>
              </Link>

              {/* Right Arrow Button */}
              <button
                type="button"
                onClick={scrollProdRight}
                disabled={!canScrollProdRight}
                aria-label="Scroll surgical products right"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center transition-all duration-200 ${
                  canScrollProdRight
                    ? "opacity-100 cursor-pointer hover:bg-[#157a6d] hover:text-white hover:border-[#157a6d] active:scale-95 shadow-2xs"
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="min-h-[20vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl">
              <p className="text-slate-400 font-semibold text-xs">No featured products available. Mark products as surgical in Admin.</p>
            </div>
          ) : (
            <div
              ref={prodSliderRef}
              role="list"
              aria-label="Featured surgical products carousel"
              className="no-scrollbar flex flex-row gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pt-2 pb-6 select-none cursor-grab active:cursor-grabbing"
              style={{
                WebkitOverflowScrolling: "touch",
              }}
              onMouseDown={handleProdMouseDown}
              onMouseMove={handleProdMouseMove}
              onMouseUp={stopProdDragging}
              onMouseLeave={stopProdDragging}
            >
              {featuredProducts.map((prod) => (
                <div
                  key={(prod.id || prod._id)?.toString()}
                  role="listitem"
                  className="shrink-0 w-[210px] sm:w-[230px] md:w-[250px] lg:w-[270px] snap-start"
                >
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Buy Surgical Products from WellMeds */}
      <section className="py-16 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
        <div className="text-center space-y-xs">
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight">
            Why Buy Surgical Supplies From WellMeds
          </h2>
          <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto">
            We partner with accredited medical manufacturers to ensure sterile shipments reach you safely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl space-y-sm text-left shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Award size={20} />
            </div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">ISO &amp; CE Certified</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Every medical oximeter, thermometer, and sterile consumable package holds international medical ISO standard stamps.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl space-y-sm text-left shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <Truck size={20} />
            </div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">Prioritized Dispatch</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              We ship oxygen devices and clinic setups using insulated, prioritized distribution processes to secure instrument integrity.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl space-y-sm text-left shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#157a6d] dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">Sterile Guarantee</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Packaged sutures, bandages, and surgical masks are verified and delivered in sealed, moisture-proof protective covers.
            </p>
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="bg-slate-50/50 dark:bg-zinc-900/20 py-12 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop text-center space-y-8">
          <div>
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">
              Authorized Surgical Manufacturers & Brands
            </h3>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Directly sourcing 100% authentic medical grade equipment & consumables
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10">
            {SURGICAL_BRAND_LOGOS.map((brand) => (
              <div 
                key={brand.id}
                className="w-[135px] sm:w-[172px] h-[66px] sm:h-[79px] p-1 flex items-center justify-center select-none cursor-pointer group"
                title={brand.name}
              >
                <img 
                  src={brand.logoUrl} 
                  alt={brand.name} 
                  className="max-h-full max-w-full object-contain filter group-hover:scale-110 transition-transform duration-200" 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
        <div className="text-center space-y-xs">
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#172b26] dark:text-zinc-100 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto">
            Got queries? Find responses to common questions about our surgical equipment lines.
          </p>
        </div>

        <div className="space-y-md">
          {faqsList.map((faq, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl p-md shadow-xs select-none"
              >
                <div 
                  onClick={() => toggleFaq(idx)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100">{faq.q}</h3>
                  <button className="text-slate-400">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                </div>
                {isOpen && (
                  <p className="mt-sm text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium transition-all duration-200">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-br from-[#0f3b34] via-[#157a6d] to-[#0a2e28] py-16 text-white border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop text-center space-y-6">
          <h2 className="font-editorial text-3xl font-semibold">Professional Grade Medical Catalog</h2>
          <p className="text-emerald-100/90 text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Order certified hospital consumables, dressings, syringes, and clinical equipment. Fast shipping directly to your facility or home.
          </p>
          <div className="pt-xs">
            <Link
              to="/surgical/all"
              className="bg-white hover:bg-emerald-50 text-[#157a6d] font-bold h-[48px] px-8 rounded-full inline-flex items-center justify-center transition-all shadow-md select-none cursor-pointer text-sm"
            >
              Shop All Surgical Supplies
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default SurgicalLandingPage;
