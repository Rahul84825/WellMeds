import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { 
  ChevronDown, 
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  X
} from "lucide-react";
import SEO from "../components/common/SEO";

const MoleculeDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [molecule, setMolecule] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showAllBrandsModal, setShowAllBrandsModal] = useState(false);

  useEffect(() => {
    const fetchMoleculeDetails = async () => {
      setLoading(true);
      try {
        const data = await api.getMolecule(slug);
        setMolecule(data);
        if (data) {
          const seoTitle = data.seo?.metaTitle || data.name;
          const seoDescription = data.seo?.metaDescription || data.shortDescription || `Learn about ${data.name} active pharmaceutical ingredient, dosage, uses, benefits, and side effects.`;
          const ogTitle = data.seo?.openGraphTitle || seoTitle;
          const ogDescription = data.seo?.openGraphDescription || seoDescription;
          const canonicalUrl = data.seo?.canonicalUrl || `https://wellmeds.com/molecules/${data.slug}`;
          const ogImage = data.seo?.ogImage || "/og-default.jpg";

          document.title = `${seoTitle} | Active Ingredient | WellMeds`;
          
          let metaDesc = document.querySelector("meta[name='description']");
          if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute("content", seoDescription);
          
          // Keywords Meta Tag
          if (data.seo?.seoKeywords && data.seo.seoKeywords.length > 0) {
            let metaKeywords = document.querySelector("meta[name='keywords']");
            if (!metaKeywords) {
              metaKeywords = document.createElement("meta");
              metaKeywords.setAttribute("name", "keywords");
              document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute("content", data.seo.seoKeywords.join(", "));
          }
          
          // Canonical Link
          let canonical = document.querySelector("link[rel='canonical']");
          if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
          }
          canonical.setAttribute("href", canonicalUrl);

          // OpenGraph & Twitter Tags
          const ogTags = {
            "og:title": ogTitle,
            "og:description": ogDescription,
            "og:image": ogImage,
            "og:url": `https://wellmeds.com/molecules/${data.slug}`,
            "og:type": "website",
            "twitter:card": "summary_large_image",
            "twitter:title": ogTitle,
            "twitter:description": ogDescription,
            "twitter:image": ogImage
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

          // Fetch products dynamically containing this molecule
          fetchProducts(data._id || data.id);
        }
      } catch (err) {
        console.error("Failed to fetch molecule details", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProducts = async (molId) => {
      setProductsLoading(true);
      try {
        const data = await api.getProducts({
          molecule: molId,
          limit: 24
        });
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load products containing molecule", err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchMoleculeDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!molecule) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-md space-y-4">
          <AlertTriangle className="mx-auto text-amber-500" size={48} />
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-zinc-100">Molecule Not Found</h2>
          <p className="text-xs text-slate-400">The chemical molecule details you are looking for do not exist or are inactive.</p>
          <button 
            onClick={() => navigate("/molecules")} 
            className="bg-[#038076] text-white font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#02675f] transition-all cursor-pointer"
          >
            Browse All Molecules
          </button>
        </div>
      </div>
    );
  }

  const toggleFaq = (idx) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  const scrollToProducts = () => {
    navigate(`/products?search=${encodeURIComponent(molecule.name)}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen animate-[fade-in_0.3s_ease-out] text-left">
      <SEO
        title={`${molecule.name} Uses, Dosage, Side Effects`}
        description={molecule.description || `Explore ${molecule.name} active pharmaceutical ingredient formulations, brand options, and safety guidelines on WellMeds.`}
        keywords={`${molecule.name}, ${molecule.name} medicines, ${molecule.name} formulations, WellMeds`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Molecules", url: "/molecules" },
          { name: molecule.name, url: `/molecule/${slug}` }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs text-slate-400 gap-1.5 mb-6 font-medium select-none">
          <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>
            Home
          </span>
          <ChevronRight size={12} className="text-slate-300 dark:text-zinc-600" />
          <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/molecules")}>
            Molecule
          </span>
          <ChevronRight size={12} className="text-slate-300 dark:text-zinc-600" />
          <span className="text-[#038076] dark:text-[#a4c9ff] font-semibold capitalize">{molecule.name}</span>
        </nav>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Available Brands Card (Sticky Sidebar / Clinical Index) */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-[#f6f7fa] dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs sticky top-20 max-w-[355px] w-full mx-auto lg:mx-0">
              <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-base sm:text-lg mb-5 sm:mb-6">
                Available Brands
              </h3>

              {productsLoading ? (
                <div className="py-6 flex justify-center">
                  <Loader size="sm" />
                </div>
              ) : products.length > 0 ? (
                <div className="divide-y divide-slate-150 dark:divide-zinc-800">
                  {products.slice(0, 4).map((prod, idx) => {
                    const price = prod.salePrice || prod.price || 0;
                    const dosageUnit = prod.dosageForm || (prod.name?.toLowerCase().includes('capsule') ? 'Capsule' : prod.name?.toLowerCase().includes('tablet') ? 'Tablet' : 'Unit');
                    const unitPrice = prod.unitPrice 
                      ? `₹${prod.unitPrice}/${dosageUnit}` 
                      : prod.packSize 
                      ? `₹${Math.round(price / (parseInt(prod.packSize) || 10))}/${dosageUnit}`
                      : null;

                    return (
                      <div
                        key={prod.id || prod._id || idx}
                        onClick={() => navigate(`/products/${prod.slug}`)}
                        className="py-3 first:pt-1 last:pb-1 group cursor-pointer transition-all"
                      >
                        {/* Top Row: Title & Price (+18% larger typography) */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-[13px] sm:text-sm text-slate-800 dark:text-zinc-100 group-hover:text-[#038076] dark:group-hover:text-[#84d6b9] transition-colors leading-snug">
                            {prod.name}
                          </h4>
                          <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-zinc-50 shrink-0 text-right">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Second Row: Rx Badge & Per-Capsule/Unit Price (+18% larger typography) */}
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          {prod.requiresPrescription ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#038076] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold select-none shadow-2xs">
                              <span className="w-3.5 h-3.5 rounded-full bg-[#038076] text-white text-[8.5px] font-black flex items-center justify-center leading-none">
                                Rx
                              </span>
                              <span>Prescription Required</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
                              OTC Product
                            </span>
                          )}

                          {unitPrice && (
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold shrink-0">
                              {unitPrice}
                            </span>
                          )}
                        </div>

                        {/* Third Row: Manufacturer (+18% larger typography) */}
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal truncate mt-0.5">
                          by {prod.manufacturer || prod.brand || "NATCO PHARMA LTD..."}
                        </p>
                      </div>
                    );
                  })}

                  {/* Bottom Full-Width Action Button */}
                  <div className="pt-3.5 mt-1.5 border-t border-slate-150 dark:border-zinc-800">
                    <button
                      onClick={() => setShowAllBrandsModal(true)}
                      className="w-full py-2.5 px-3.5 rounded-xl sm:rounded-2xl bg-[#038076] hover:bg-[#02675f] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99]"
                    >
                      <span>View All Brands({products.length})</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-5 text-center">
                  No products currently available for this molecule.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Molecule Title & Detailed Information Card */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            
            {/* Main Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#038076] dark:text-[#84d6b9] uppercase tracking-tight">
                {molecule.name}
              </h1>
              {molecule.aliases && molecule.aliases.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Aliases: {molecule.aliases.join(", ")}
                </p>
              )}
            </div>

            {/* Medical Information Content Container */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">

              {/* 1. Background and Date of approval */}
              {(molecule.description || molecule.shortDescription) && (
                <section className="space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Background and Date of approval {molecule.name.toUpperCase()}
                  </h2>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                    {molecule.description || molecule.shortDescription}
                  </div>
                </section>
              )}

              {/* 2. Uses of Molecule */}
              {(molecule.uses || molecule.benefits) && (
                <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Uses of {molecule.name.toUpperCase()}
                  </h2>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                    {molecule.uses || molecule.benefits}
                  </div>
                </section>
              )}

              {/* 3. Administration / How it works */}
              {(molecule.howItWorks || molecule.dosage) && (
                <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    How is {molecule.name.toUpperCase()} administered?
                  </h2>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                    {molecule.howItWorks || molecule.dosage}
                  </div>
                </section>
              )}

              {/* 4. Side Effects */}
              {molecule.sideEffects && (
                <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Side Effects of {molecule.name.toUpperCase()}
                  </h2>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                    {molecule.sideEffects}
                  </div>
                </section>
              )}

              {/* 5. Precautions and Warnings */}
              {(molecule.warnings || molecule.precautions) && (
                <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Precautions and Warnings for {molecule.name.toUpperCase()}
                  </h2>
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                    {molecule.warnings || molecule.precautions}
                  </div>
                </section>
              )}

              {/* 6. Frequently Asked Questions (FAQs) */}
              {molecule.faqs && molecule.faqs.length > 0 && (
                <section className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Frequently Asked Questions (FAQs)
                  </h2>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {molecule.faqs.map((faq, idx) => {
                      const isOpen = openFaqIdx === idx;
                      return (
                        <div key={idx} className="py-3">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full flex items-center justify-between text-left font-semibold text-slate-800 dark:text-zinc-200 hover:text-[#038076] transition-colors focus:outline-none"
                          >
                            <span className="text-xs sm:text-sm">{faq.question}</span>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isOpen && (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed pt-2 animate-[fade-in_0.2s_ease-out]">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 7. Related Molecules (if applicable) */}
              {molecule.relatedMolecules && molecule.relatedMolecules.length > 0 && (
                <section className="space-y-3 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
                    Related Molecules
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {molecule.relatedMolecules.map((rel, idx) => {
                      const relName = typeof rel === "object" ? rel.name : rel;
                      const relSlug = typeof rel === "object" ? rel.slug : rel;
                      return (
                        <button
                          key={idx}
                          onClick={() => navigate(`/molecule/${relSlug}`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-[#038076] hover:text-white dark:hover:bg-[#038076] transition-colors cursor-pointer"
                        >
                          {relName}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* FLOATING MODAL: ALL AVAILABLE BRANDS */}
      {showAllBrandsModal && (
        <div 
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 animate-[fade-in_0.2s_ease-out]"
          onClick={() => setShowAllBrandsModal(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col relative z-[100000] animate-[scale-up_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-150 dark:border-zinc-800 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-xl sm:text-2xl">
                Available Brands
              </h3>
              <button
                onClick={() => setShowAllBrandsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Product List */}
            <div className="overflow-y-auto pr-1 space-y-0.5 divide-y divide-slate-150 dark:divide-zinc-800">
              {products.map((prod, idx) => {
                const price = prod.salePrice || prod.price || 0;
                const dosageUnit = prod.dosageForm || (prod.name?.toLowerCase().includes('capsule') ? 'Capsule' : prod.name?.toLowerCase().includes('tablet') ? 'Tablet' : 'Unit');
                const unitPrice = prod.unitPrice 
                  ? `₹${prod.unitPrice}/${dosageUnit}` 
                  : prod.packSize 
                  ? `₹${Math.round(price / (parseInt(prod.packSize) || 10))}/${dosageUnit}`
                  : null;

                return (
                  <div
                    key={prod.id || prod._id || idx}
                    onClick={() => {
                      setShowAllBrandsModal(false);
                      navigate(`/products/${prod.slug}`);
                    }}
                    className="py-3.5 first:pt-1 last:pb-1 group cursor-pointer transition-colors"
                  >
                    {/* Top Row: Title & Price */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-sm sm:text-base text-slate-800 dark:text-zinc-100 group-hover:text-[#038076] dark:group-hover:text-[#84d6b9] transition-colors leading-snug">
                        {prod.name}
                      </h4>
                      <span className="font-semibold text-base sm:text-lg text-slate-900 dark:text-zinc-50 shrink-0 text-right">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Second Row: Rx Badge & Per-Capsule/Unit Price */}
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      {prod.requiresPrescription ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#038076] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold select-none">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#038076] text-white text-[8.5px] font-black flex items-center justify-center leading-none">
                            Rx
                          </span>
                          <span>Prescription Required</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[11px] font-medium">
                          OTC Product
                        </span>
                      )}

                      {unitPrice && (
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold shrink-0">
                          {unitPrice}
                        </span>
                      )}
                    </div>

                    {/* Third Row: Manufacturer */}
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-normal truncate mt-0.5">
                      by {prod.manufacturer || prod.brand || "NATCO PHARMA LTD..."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoleculeDetailPage;

