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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Pharmaceutical Manufacturers & Brands | WellMeds"
        description="Browse authentic prescription formulations by top pharmaceutical manufacturers including Cipla, Sun Pharma, Dr. Reddy's, Abbott, and Pfizer at WellMeds."
        canonical="/brands"
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            Pharmaceutical Brands
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── BRANDS GRID ── */}
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-300 dark:border-zinc-800 p-6 space-y-3 animate-pulse">
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
                    className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] p-6 shadow-xs flex items-start gap-4 hover:shadow-md hover:-translate-y-1 transition-all group text-left"
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
