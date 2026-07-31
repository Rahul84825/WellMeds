import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import { api } from "../services/api";
import { Building2, Search, ArrowRight, ShieldCheck, Pill } from "lucide-react";

// Curated list of premier pharmaceutical brands
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
                description: `Browse authentic medical formulations and prescription products manufactured by ${bName}.`
              }));
            }
          }
        });

        const list = Array.from(brandSet).map(s => JSON.parse(s));
        setDynamicBrands(list);
      } catch (err) {
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
    { name: "Pharmaceutical Brands", url: "/brands" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      <SEO
        title="Pharmaceutical Brands Index | Authentic Medicines & Manufacturers"
        description="Browse India's top pharmaceutical manufacturers and global healthcare brands at WellMeds. Buy authentic medicines from Cipla, Sun Pharma, Dr. Reddy's, Lupin, Abbott, Mankind, and more."
        canonical="/brands"
        breadcrumbs={breadcrumbs}
      />

      {/* Hero */}
      <section className="bg-[#172b26] text-white py-16 px-4 border-b border-[#26453d]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#203a34] text-[#84d6b9] text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-[#2e5249]">
            <Building2 className="w-3.5 h-3.5" />
            <span>100% Genuine Direct Brand Sourcing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
            Trusted Pharmaceutical Manufacturers & Brands
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Explore authentic medications, specialized biologicals, and medical formulations sourced directly from WHO-GMP certified pharmaceutical leaders.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pharmaceutical brands (e.g. Cipla, Sun Pharma, Abbott)..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-[#84d6b9]"
            />
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#157a6d]" />
            <span>All Partner Brands ({filteredBrands.length})</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">WHO-GMP Certified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <Link
              key={brand.slug}
              to={`/brands/${brand.slug}`}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#157a6d] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold uppercase text-[#157a6d] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {brand.origin}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#157a6d] transition-colors">
                  {brand.name}
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {brand.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#157a6d] group-hover:translate-x-1 transition-transform">
                <span>View All Medicines</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrandsPage;
