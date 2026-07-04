import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
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
  Plus, 
  Minus,
  CheckCircle,
  Truck,
  Award,
  ShieldCheck
} from "lucide-react";

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
          api.getProducts({ isSurgical: "true", limit: 4 })
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

  return (
    <div className="bg-slate-50/30 dark:bg-zinc-950/20 text-left">
      
      {/* Hero Banner Section */}
      <section className="relative bg-gradient-to-br from-[#001f3f] via-[#004782] to-[#086b53] text-white py-16 md:py-24 overflow-hidden border-b border-slate-100 dark:border-zinc-800">
        <div className="absolute inset-0 medical-pattern opacity-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-margin-desktop relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 md:space-y-8 animate-[fade-in_0.4s_ease-out]">
            <span className="inline-block bg-white/10 text-white text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider border border-white/20">
              Institutional &amp; Home Care Solutions
            </span>
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
              Surgical &amp; Clinical <br />
              <span className="text-[#84d6b9]">Equipment Catalog</span>
            </h1>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-xl font-medium">
              Equip your hospital, clinic, or private nursing setup with premium surgical tools, disposable sterile syringes, clinical thermometers, hospital beds, and advanced health monitors.
            </p>
            
            <div className="flex flex-wrap gap-md">
              <Link
                to="/surgical/all"
                className="bg-[#086b53] hover:bg-emerald-700 text-white font-bold h-[48px] px-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 shadow-md shadow-emerald-950/20 select-none cursor-pointer"
              >
                Browse All Surgical Products
              </Link>
              <a
                href="#categories-section"
                className="border border-white/30 hover:border-white hover:bg-white/5 text-white font-bold h-[48px] px-8 rounded-xl flex items-center justify-center transition-all duration-200 select-none"
              >
                Explore Categories
              </a>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-3 gap-md pt-6 border-t border-white/10 text-xs text-slate-300">
              <div>
                <div className="font-extrabold text-lg text-white">100%</div>
                <div className="mt-1 font-semibold">Clinically Certified</div>
              </div>
              <div>
                <div className="font-extrabold text-lg text-white">50+</div>
                <div className="mt-1 font-semibold">Hospital Brands</div>
              </div>
              <div>
                <div className="font-extrabold text-lg text-white">24/7</div>
                <div className="mt-1 font-semibold">Support Helpline</div>
              </div>
            </div>

          </div>

          {/* Graphic Banner */}
          <div className="hidden lg:block relative h-[400px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-lg flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#84d6b9]/10 rounded-full blur-3xl"></div>
            <div className="relative z-20 space-y-xs max-w-sm text-left">
              <h3 className="font-black text-lg text-white">WellMeds Care Shield</h3>
              <p className="text-slate-300 font-medium text-xs leading-relaxed">
                Hospital diagnostics, sterile operating consumables, and home care beds delivered under strict cold chain packaging and quality control audits.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Categories Grid Section */}
      <section id="categories-section" className="py-16 max-w-7xl mx-auto px-margin-desktop">
        <div className="text-center space-y-xs mb-12">
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-zinc-100">
            Shop Surgical Categories
          </h2>
          <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto">
            Dynamic, admin-managed clinical categories providing specialized equipment and instruments.
          </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
            {categories.map((cat) => {
              const IconComponent = getSurgicalIcon(cat.icon);
              return (
                <div
                  key={cat.id || cat._id}
                  onClick={() => navigate(`/surgical/${cat.slug}`)}
                  className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-850 rounded-2xl p-md shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#004782]/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group h-full"
                >
                  <div className="space-y-sm">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-950 rounded-xl p-2.5 flex items-center justify-center border border-slate-100 dark:border-zinc-800 shrink-0 transition-colors group-hover:bg-[#004782]/5">
                        {cat.image ? (
                          <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={cat.name} />
                        ) : (
                          <IconComponent size={20} className="text-slate-400 group-hover:text-[#004782] transition-colors" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-sm py-0.5 rounded-lg border bg-slate-50 dark:bg-zinc-950 border-slate-250/30 dark:border-zinc-800 text-slate-400 group-hover:border-[#004782]/20 group-hover:bg-[#004782]/5 group-hover:text-[#004782] transition-colors">
                        {cat.productCount || 0} items
                      </span>
                    </div>
                    <div className="space-y-xs pt-1">
                      <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-sm group-hover:text-[#004782] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {cat.description || `Browse quality ${cat.name} equipment and tools.`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-[#004782] dark:text-[#a4c9ff] font-bold text-[11px] gap-xs pt-md mt-auto group-hover:underline">
                    <span>View Category Products</span>
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Surgical Products Section */}
      <section className="bg-slate-100/50 dark:bg-zinc-900/20 py-16 border-y border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-margin-desktop">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-12">
            <div>
              <h2 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-zinc-100">
                Featured Surgical Products
              </h2>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Top-rated clinical instruments and diagnostic devices in stock.
              </p>
            </div>
            <Link
              to="/surgical/all"
              className="text-[#004782] dark:text-[#a4c9ff] hover:text-[#003c70] font-bold text-xs flex items-center gap-xs"
            >
              View All Products
              <ChevronRight size={14} />
            </Link>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Buy Surgical Products from WellMeds */}
      <section className="py-16 max-w-7xl mx-auto px-margin-desktop space-y-12">
        <div className="text-center space-y-xs">
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-zinc-100">
            Why Buy Surgical Supplies From WellMeds
          </h2>
          <p className="text-slate-400 text-xs font-semibold max-w-md mx-auto">
            We partner with accredited medical manufacturers to ensure sterile shipments reach you safely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl space-y-sm text-left shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#086b53] flex items-center justify-center">
              <Award size={20} />
            </div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">ISO &amp; CE Certified</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Every medical oximeter, thermometer, and sterile consumable package holds international medical ISO standard stamps.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl space-y-sm text-left shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#004782]/10 text-[#004782] dark:text-[#a4c9ff] flex items-center justify-center">
              <Truck size={20} />
            </div>
            <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">Prioritized Dispatch</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              We ship oxygen devices and clinic setups using insulated, prioritized distribution processes to secure instrument integrity.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl space-y-sm text-left shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-[#086b53] flex items-center justify-center">
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
      <section className="bg-slate-100/30 dark:bg-zinc-900/10 py-12 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-margin-desktop text-center space-y-8">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest">
            Partnered Medical Manufacturers
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-xl opacity-50 dark:opacity-40">
            <span className="font-black text-xl text-slate-600 dark:text-zinc-300">BIOCARE</span>
            <span className="font-black text-xl text-slate-600 dark:text-zinc-300">CLINICA</span>
            <span className="font-black text-xl text-slate-600 dark:text-zinc-300">MEDILIFE</span>
            <span className="font-black text-xl text-slate-600 dark:text-zinc-300">HEALTHGUARD</span>
            <span className="font-black text-xl text-slate-600 dark:text-zinc-300">SYNERGY</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-margin-desktop space-y-12">
        <div className="text-center space-y-xs">
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-zinc-100">
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
      <section className="bg-gradient-to-br from-[#004782] to-[#002b55] py-16 text-white border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-4xl mx-auto px-margin-desktop text-center space-y-6">
          <h2 className="font-extrabold text-3xl">Professional Grade Medical Catalog</h2>
          <p className="text-slate-200 text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Order certified hospital consumables, dressings, syringes, and clinical equipment. Fast shipping directly to your facility or home.
          </p>
          <div className="pt-xs">
            <Link
              to="/surgical/all"
              className="bg-white hover:bg-slate-100 text-[#004782] font-extrabold h-[48px] px-8 rounded-xl inline-flex items-center justify-center transition-all shadow-md select-none cursor-pointer text-sm"
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
