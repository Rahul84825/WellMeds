import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { 
  FlaskConical, 
  ChevronDown, 
  HelpCircle, 
  Bookmark, 
  FileText,
  AlertTriangle, 
  Sparkles,
  BookOpen
} from "lucide-react";

const MoleculeDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [molecule, setMolecule] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  useEffect(() => {
    const fetchMoleculeDetails = async () => {
      setLoading(true);
      try {
        const data = await api.getMolecule(slug);
        setMolecule(data);
        if (data) {
          document.title = `${data.seo?.metaTitle || data.name} | Active Ingredient | WellMeds`;
          
          let metaDesc = document.querySelector("meta[name='description']");
          if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute("content", data.seo?.metaDescription || data.shortDescription || `Learn about ${data.name} active pharmaceutical ingredient, dosage, uses, benefits, and side effects.`);
          
          // 4. Canonical Link (Dynamic from slug)
          let canonical = document.querySelector("link[rel='canonical']");
          if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
          }
          canonical.setAttribute("href", `https://wellmeds.com/molecules/${data.slug}`);

          // 5. OpenGraph & Twitter Tags (Using default og-default.jpg)
          const ogTags = {
            "og:title": data.seo?.metaTitle || data.name,
            "og:description": data.seo?.metaDescription || data.shortDescription || `Learn about ${data.name} active pharmaceutical ingredient, dosage, uses, benefits, and side effects.`,
            "og:image": "/og-default.jpg",
            "og:url": `https://wellmeds.com/molecules/${data.slug}`,
            "og:type": "website",
            "twitter:card": "summary_large_image",
            "twitter:title": data.seo?.metaTitle || data.name,
            "twitter:description": data.seo?.metaDescription || data.shortDescription || `Learn about ${data.name} active pharmaceutical ingredient, dosage, uses, benefits, and side effects.`,
            "twitter:image": "/og-default.jpg"
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
          limit: 12
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
      <div className="max-w-7xl mx-auto px-margin-desktop py-xxl flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!molecule) {
    return (
      <div className="max-w-7xl mx-auto px-margin-desktop py-xxl text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-xl shadow-md space-y-md">
          <AlertTriangle className="mx-auto text-red-500" size={48} />
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-zinc-100">Molecule Not Found</h2>
          <p className="text-xs text-slate-400">The chemical molecule details you are looking for do not exist or are inactive.</p>
          <button onClick={() => navigate("/molecules")} className="bg-[#004782] text-white font-bold text-xs px-lg py-sm rounded-xl hover:opacity-90 transition-all select-none">
            Browse All Molecules
          </button>
        </div>
      </div>
    );
  }

  const toggleFaq = (idx) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  return (
    <div className="max-w-7xl mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/molecules")}>Molecules</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#038076] dark:text-[#a4c9ff] truncate">{molecule.name}</span>
      </nav>

      {/* HERO HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c5948] via-[#038076] to-[#40a390] text-white p-lg sm:p-xl md:p-xxl shadow-lg border border-[#038076]/20 mb-xl select-none">
        <div className="relative z-10 max-w-3xl space-y-md">
          <div className="inline-flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-md py-1 rounded-full border border-white/15">
            <FlaskConical size={12} className="text-white animate-pulse" />
            Active Ingredient
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {molecule.name}
          </h1>
          {molecule.aliases && molecule.aliases.length > 0 && (
            <p className="text-xs font-bold text-slate-100 tracking-wide">
              Chemical Aliases: {molecule.aliases.join(", ")}
            </p>
          )}
          <p className="text-sm text-slate-100 font-medium leading-relaxed max-w-2xl">
            {molecule.shortDescription || `Clinical overview and dynamic brand alternative mappings for active molecule ${molecule.name}.`}
          </p>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_60%)] pointer-events-none" />
      </div>

      {/* TWO-COLUMN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
        {/* LEFT COLUMN: Deep Clinical Information Stack */}
        <div className="lg:col-span-3 space-y-lg">
          
          {/* Card 1: Overview */}
          {molecule.description && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                About {molecule.name}
              </h3>
              <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed">
                {molecule.description}
              </p>
            </div>
          )}

          {/* Card 2: Uses & Benefits */}
          {(molecule.uses || molecule.benefits) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {molecule.uses && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
                  <h4 className="font-bold text-slate-850 dark:text-zinc-150 text-sm tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                    Clinical Uses
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {molecule.uses}
                  </p>
                </div>
              )}
              {molecule.benefits && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
                  <h4 className="font-bold text-slate-850 dark:text-zinc-150 text-sm tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                    Key Benefits
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {molecule.benefits}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Mechanism of Action (How it works) */}
          {molecule.howItWorks && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                How It Works (Mechanism of Action)
              </h3>
              <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {molecule.howItWorks}
              </p>
            </div>
          )}

          {/* Card 4: Dosage & Storage */}
          {(molecule.dosage || molecule.storage) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              {molecule.dosage && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
                  <h4 className="font-bold text-slate-850 dark:text-zinc-150 text-sm tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                    Dosage Guidelines
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {molecule.dosage}
                  </p>
                </div>
              )}
              {molecule.storage && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
                  <h4 className="font-bold text-slate-850 dark:text-zinc-150 text-sm tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                    Storage &amp; Disposal
                  </h4>
                  <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {molecule.storage}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Card 5: Side Effects & Warnings */}
          {(molecule.sideEffects || molecule.warnings || molecule.precautions) && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                Clinical Safety &amp; Side Effects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-xs">
                {molecule.sideEffects && (
                  <div className="space-y-xs">
                    <h4 className="font-semibold text-slate-700 dark:text-zinc-200 text-xs uppercase tracking-wider">Possible Side Effects</h4>
                    <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                      {molecule.sideEffects}
                    </p>
                  </div>
                )}
                {(molecule.warnings || molecule.precautions) && (
                  <div className="space-y-xs">
                    <h4 className="font-semibold text-slate-700 dark:text-zinc-200 text-xs uppercase tracking-wider">Precautions &amp; Alerts</h4>
                    <p className="text-xs text-slate-450 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                      {molecule.warnings || molecule.precautions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQs Accordion */}
          {molecule.faqs && molecule.faqs.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
              <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs">
                Frequently Asked Questions
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {molecule.faqs.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="py-sm first:pt-0 last:pb-0">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between text-left font-bold text-slate-700 dark:text-zinc-200 hover:text-[#038076] transition-colors focus:outline-none py-xs select-none"
                      >
                        <span className="flex items-center gap-sm text-xs md:text-sm">
                          <HelpCircle size={16} className="text-[#038076]" />
                          {faq.question}
                        </span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <p className="text-xs text-slate-450 leading-relaxed pt-sm pl-7 animate-[fade-in_0.2s_ease-out]">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* References */}
          {molecule.references && molecule.references.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-xs">
              <h4 className="font-bold text-slate-850 dark:text-zinc-150 text-xs uppercase tracking-wider flex items-center gap-xs">
                <Bookmark size={14} className="text-slate-400" />
                References &amp; Clinical Sources
              </h4>
              <ul className="list-disc pl-md text-[11px] text-slate-400 space-y-1">
                {molecule.references.map((ref, idx) => (
                  <li key={idx}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Medical Disclaimer */}
          <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-900/30 rounded-2xl p-md flex gap-sm items-start">
            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={16} />
            <div className="space-y-xs text-[11px] leading-relaxed text-orange-700 dark:text-orange-300">
              <p className="font-bold uppercase tracking-wider">WellMeds Medical Disclaimer</p>
              <p>
                The clinical details provided on this page are compiled from authenticated medical registries and peer-reviewed studies for educational purposes only. This information should not replace licensed medical advice, diagnosis, or professional clinical treatment. Always consult a physician or certified pharmacist before starting or altering any drug treatment.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar (Metadata & Related Molecules) */}
        <div className="space-y-lg">
          
          {/* Box 1: Highlights */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
            <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-sm tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs flex items-center gap-xs select-none">
              <BookOpen size={15} className="text-[#038076]" />
              Quick Specs
            </h4>
            <div className="space-y-xs text-xs">
              <div className="flex justify-between border-b border-slate-50 dark:border-zinc-850/50 py-1">
                <span className="text-slate-400 font-medium">Categorized Under</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">Alphabet '{molecule.letter}'</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-zinc-850/50 py-1">
                <span className="text-slate-400 font-medium">Status</span>
                <span className="font-bold text-emerald-500">Active API</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 dark:border-zinc-850/50 py-1">
                <span className="text-slate-400 font-medium">Clinical Aliases</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">{molecule.aliases?.length || 0} Registered</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Generics in Catalog</span>
                <span className="font-bold text-[#038076]">{products.length} Products</span>
              </div>
            </div>
          </div>

          {/* Box 2: Related Molecules */}
          {molecule.relatedMolecules && molecule.relatedMolecules.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-sm">
              <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-sm tracking-tight border-b border-slate-100 dark:border-zinc-800 pb-xs flex items-center gap-xs select-none">
                <Sparkles size={15} className="text-[#038076]" />
                Related Molecules
              </h4>
              <div className="flex flex-wrap gap-xs pt-xs">
                {molecule.relatedMolecules.map((relatedMol) => (
                  <Link
                    key={relatedMol.id || relatedMol._id}
                    to={`/molecule/${relatedMol.slug}`}
                    className="inline-flex items-center gap-xs px-sm py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-[#038076]/5 hover:text-[#038076] hover:border-[#038076]/20 transition-all font-semibold text-[10px]"
                  >
                    <FlaskConical size={10} />
                    {relatedMol.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* PRODUCTS SECTION (GRID OF PRODUCT CARDS) */}
      <section className="mt-xl pt-lg border-t border-slate-200 dark:border-zinc-800">
        <div className="mb-lg">
          <h2 className="font-extrabold text-xl md:text-2xl text-slate-800 dark:text-zinc-100 tracking-tight">
            Products Containing {molecule.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Browse commercial brand medicines formulated with this active ingredient.</p>
        </div>

        {productsLoading ? (
          <div className="min-h-[20vh] flex items-center justify-center">
            <Loader size="md" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
            {products.map((prod) => (
              <ProductCard key={prod.id || prod._id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-150 dark:border-zinc-850 rounded-2xl">
            <FileText className="mx-auto text-slate-300 dark:text-zinc-700 mb-sm" size={36} />
            <h3 className="font-bold text-xs text-slate-600 dark:text-zinc-300">No Brands Available</h3>
            <p className="text-[10px] text-slate-400 mt-xs">We currently do not have any brand catalog products mapped to this active ingredient.</p>
          </div>
        )}
      </section>

    </div>
  );
};

export default MoleculeDetailPage;
