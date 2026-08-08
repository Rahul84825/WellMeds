import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import { api } from "../services/api";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import { Building2, Search, ArrowRight, ShieldCheck, Sparkles, Phone, FileText, ChevronRight, X } from "lucide-react";

const FEATURED_BRANDS = [
  { name: "Cipla", slug: "cipla", origin: "India", description: "Global leader in respiratory, anti-infective, and specialty pharmaceutical formulations." },
  { name: "Sun Pharma", slug: "sun-pharma", origin: "India", description: "India's largest pharmaceutical manufacturer specializing in cardiology, neurology, and oncology." },
  { name: "Dr. Reddy's", slug: "dr-reddy-s", origin: "India", description: "Renowned worldwide for biosimilars, gastroenterology, and oncology medicines." },
  { name: "Lupin", slug: "lupin", origin: "India", description: "Key manufacturer in anti-tuberculosis, cardiovascular, and respiratory care." },
  { name: "Abbott", slug: "abbott", origin: "USA / India", description: "Pioneer in nutrition, diagnostics, metabolic care, and specialty pharmaceuticals." },
  { name: "Zydus Lifesciences", slug: "zydus-lifesciences", origin: "India", description: "Innovative healthcare provider delivering vaccines, biologicals, and therapeutic drugs." },
  { name: "Mankind Pharma", slug: "mankind-pharma", origin: "India", description: "Trusted consumer healthcare and prescription medicine brand across India." },
  { name: "Torrent Pharma", slug: "torrent-pharma", origin: "India", description: "Specializing in cardiovascular, central nervous system, and gastro-intestinal therapeutic areas." },
  { name: "GlaxoSmithKline (GSK)", slug: "glaxosmithkline", origin: "UK / India", description: "Global healthcare innovator in vaccines, immunology, and specialized medicines." },
  { name: "Pfizer", slug: "pfizer", origin: "USA", description: "World leader in breakthrough biopharmaceuticals, vaccines, and rare disease therapies." },
  { name: "Alkem Laboratories", slug: "alkem-laboratories", origin: "India", description: "Leading provider of anti-infective, gastrointestinal, and pain management medications." },
  { name: "Glenmark", slug: "glenmark", origin: "India", description: "Global research-led pharmaceutical company focused on dermatology, respiratory, and oncology." },
];

const BrandsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dynamicBrands, setDynamicBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await api.getProducts({ limit: 200 });
        const productsList = res?.products || res?.data || (Array.isArray(res) ? res : []);
        const brandSet = new Set();

        FEATURED_BRANDS.forEach(b => brandSet.add(JSON.stringify(b)));

        productsList.forEach((p) => {
          let bName = "";
          if (typeof p.brand === "string" && p.brand.trim()) bName = p.brand.trim();
          else if (p.brand && typeof p.brand === "object" && p.brand.name) bName = p.brand.name.trim();
          else if (typeof p.manufacturer === "string" && p.manufacturer.trim()) bName = p.manufacturer.trim();

          if (bName) {
            const bSlug = bName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const exists = FEATURED_BRANDS.some(fb => fb.slug === bSlug);
            if (!exists) {
              brandSet.add(JSON.stringify({
                name: bName,
                slug: bSlug,
                origin: "Authorized Partner",
                description: `Authorized manufacturer of prescription formulations and healthcare products available on WellMeds.`
              }));
            }
          }
        });

        const list = Array.from(brandSet).map(s => JSON.parse(s));
        setDynamicBrands(list);
      } catch (err) {
        console.error("Error building dynamic brands:", err);
        setDynamicBrands(FEATURED_BRANDS);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  const filteredBrands = dynamicBrands.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Brands", url: "/brands" },
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Pharmaceutical Manufacturers & Brands | WellMeds"
        description="Browse authentic prescription formulations by top pharmaceutical manufacturers including Cipla, Sun Pharma, Dr. Reddy's, Abbott, and Pfizer at WellMeds."
        canonical="/brands"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        {/* ── HERO HEADER ── */}
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#157a6d]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <nav className="flex items-center text-xs text-slate-400 gap-1.5 font-semibold select-none">
              <Link to="/" className="hover:text-[#157a6d]">Home</Link>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Brands</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>AUTHORIZED PHARMA PARTNERS</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                Pharmaceutical Brands
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Explore prescription formulations and specialty medicines directly sourced from globally recognized pharmaceutical manufacturers.
              </p>
            </div>

          </div>
        </div>

        {/* ── BRANDS GRID ── */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 space-y-3 animate-pulse">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                  <div className="h-5 bg-slate-100 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredBrands.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBrands.map((brand, idx) => (
                <Link
                  key={idx}
                  to={`/brands/${brand.slug}`}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm flex items-start gap-4 hover:shadow-md hover:-translate-y-1 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200 text-[#157a6d] flex items-center justify-center shrink-0 group-hover:bg-[#157a6d] group-hover:text-white transition-colors">
                    <Building2 size={22} />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-[#172b26] dark:text-white group-hover:text-[#157a6d] transition-colors truncate">
                        {brand.name}
                      </h3>
                      <span className="bg-[#f4f9f7] text-[#157a6d] font-clinical-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        {brand.origin}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {brand.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <Building2 size={36} className="mx-auto text-slate-400" />
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Brands Found</h3>
              <p className="text-xs text-slate-500 font-sans">We couldn't find any pharma brand matching "{searchTerm}".</p>
            </div>
          )}
        </div>

        {/* ── WHY WELLMEDS BAR ── */}
        <WhyWellMedsBar />
      </div>

      {/* ── CONSULTATION MODAL ── */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};

export default BrandsPage;
