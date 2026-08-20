import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import SEO from "../components/common/SEO";
import {
  ChevronDown,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  X,
  FlaskConical,
  BookOpen,
  ShieldCheck,
  Pill,
  Thermometer,
  HelpCircle,
  BookMarked,
  Atom,
} from "lucide-react";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const PAGE_BG = {
  background: `
    repeating-linear-gradient(0deg, rgba(15,59,52,0.045) 0px, rgba(15,59,52,0.045) 1px, transparent 1px, transparent 40px),
    repeating-linear-gradient(90deg, rgba(15,59,52,0.045) 0px, rgba(15,59,52,0.045) 1px, transparent 1px, transparent 40px),
    radial-gradient(ellipse at 70% 0%, #eef5f0 0%, #dce9e2 100%)
  `,
};

/* ─── Clinical sections definition ─────────────────────────────────────── */
const SECTIONS = [
  { id: "background", label: "Background", icon: BookOpen, field: (m) => m.description || m.shortDescription },
  { id: "mechanism", label: "Mechanism of Action", icon: Atom, field: (m) => m.howItWorks },
  { id: "uses", label: "Clinical Uses", icon: FlaskConical, field: (m) => m.uses || m.benefits },
  { id: "dosage", label: "Dosage", icon: Pill, field: (m) => m.dosage },
  { id: "sideeffects", label: "Side Effects", icon: Thermometer, field: (m) => m.sideEffects },
  { id: "warnings", label: "Warnings & Precautions", icon: ShieldCheck, field: (m) => m.warnings || m.precautions },
  { id: "storage", label: "Storage", icon: BookMarked, field: (m) => m.storage },
  { id: "faqs", label: "FAQs", icon: HelpCircle, field: (m) => m.faqs?.length > 0 },
  { id: "references", label: "References", icon: BookMarked, field: (m) => m.references?.length > 0 },
];

/* ─── Main Component ────────────────────────────────────────────────────── */
const MoleculeDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [molecule, setMolecule] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [showAllBrandsModal, setShowAllBrandsModal] = useState(false);
  const [activeSection, setActiveSection] = useState("background");

  useEffect(() => {
    const fetchMoleculeDetails = async () => {
      setLoading(true);
      try {
        const data = await api.getMolecule(slug);
        setMolecule(data);
        if (data) {
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
        const data = await api.getProducts({ molecule: molId, limit: 24 });
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchMoleculeDetails();
  }, [slug]);

  /* ── Intersection observer for active nav section ── */
  useEffect(() => {
    if (!molecule) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetId = entry.target.id;
            setActiveSection((prev) => (prev !== targetId ? targetId : prev));
          }
        });
      },
      { rootMargin: "-15% 0px -65% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [molecule]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleFaq = (idx) => setOpenFaqIdx(openFaqIdx === idx ? null : idx);

  /* ── Available sections that have data ── */
  const populatedSections = SECTIONS.filter((s) => s.field(molecule || {}));

  if (loading) {
    return (
      <div style={PAGE_BG} className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!molecule) {
    return (
      <div style={PAGE_BG} className="min-h-screen flex items-center justify-center px-4">
        <SEO title="Molecule Not Found" noindex={true} />
        <div className="bg-white border border-[#dde8e3] rounded-lg p-10 text-center max-w-sm shadow-lg">
          <AlertTriangle className="mx-auto mb-4 text-[#b08d3e]" size={40} />
          <h2
            className="text-2xl text-black mb-2 font-sans font-bold"
          >Molecule Not Found</h2>
          <p className="text-sm font-sans text-black mb-6">
            The molecule you requested does not exist in our reference index.
          </p>
          <button
            onClick={() => navigate("/molecules")}
            className="bg-[#157a6d] text-white text-sm font-sans font-bold tracking-widest uppercase px-6 py-2.5 rounded-full hover:bg-[#0f6157] transition-all cursor-pointer"
          >
            BROWSE INDEX
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={PAGE_BG} className="min-h-screen text-black font-sans">
      <SEO
        title={molecule.seo?.metaTitle || `${molecule.name} Uses, Dosage, Side Effects`}
        description={molecule.seo?.metaDescription || molecule.shortDescription || `Explore ${molecule.name} clinical information, indications, and available formulations on WellMeds.`}
        keywords={molecule.seo?.keywords || `${molecule.name}, ${molecule.name} uses, ${molecule.name} dosage, WellMeds`}
        canonical={`/molecule/${molecule.slug || slug}`}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Molecules", url: "/molecules" },
          { name: molecule.name, url: `/molecule/${molecule.slug || slug}` },
        ]}
      />

      {/* ── MOLECULE HERO (Aligned with Navbar max-w-[1400px] & px-6 lg:px-10) ── */}
      <div className="border-b border-[#c3d4cc]">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-5 select-none" aria-label="Breadcrumb">
            <span onClick={() => navigate("/")} className="text-xs font-sans uppercase tracking-widest text-black font-semibold cursor-pointer hover:text-[#157a6d] transition-colors">Home</span>
            <ChevronRight size={11} className="text-[#888888]" />
            <span onClick={() => navigate("/molecules")} className="text-xs font-sans uppercase tracking-widest text-black font-semibold cursor-pointer hover:text-[#157a6d] transition-colors">Molecule Index</span>
            <ChevronRight size={11} className="text-[#888888]" />
            <span className="text-xs font-sans uppercase tracking-widest text-[#157a6d] font-bold">{molecule.name}</span>
          </nav>

          {/* Category + Rx badge row */}
          <div className="flex flex-wrap items-center gap-3.5 mb-4">
            {molecule.category && (
              <span className="text-xs font-sans font-bold uppercase tracking-[2.5px] text-[#b08d3e]">
                {molecule.category}
              </span>
            )}
            <span className="text-[#888888] text-sm">·</span>
            <span className="inline-flex items-center gap-2 border border-[#157a6d] rounded-sm px-3 py-1 text-xs font-sans font-bold uppercase tracking-widest text-[#157a6d]">
              <span className="font-sans font-black">℞</span> Prescription
            </span>
          </div>

          {/* Molecule Name */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold text-black leading-tight mb-3"
          >
            {molecule.name}
          </h1>
          {molecule.aliases?.length > 0 && (
            <p className="text-xs sm:text-sm font-sans text-black font-medium mb-4">
              Also known as: {molecule.aliases.join(" · ")}
            </p>
          )}

          {/* Short description */}
          {molecule.shortDescription && (
            <p className="text-base sm:text-lg text-black leading-relaxed max-w-4xl font-sans mb-2 border-l-4 border-[#157a6d] pl-5 font-normal">
              {molecule.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* ── BODY: SIDEBAR + MAIN (Aligned with Navbar max-w-[1400px] & px-6 lg:px-10) ── */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-9">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-9 items-start">

          {/* ── LEFT SIDEBAR (Sticky Below Header) ───────────────────── */}
          <aside className="lg:col-span-3 space-y-6 order-2 lg:order-1 lg:sticky lg:top-[84px] self-start z-20">

            {/* Clinical Index Card */}
            <div className="bg-white border border-[#dde8e3] rounded-sm overflow-hidden shadow-sm">
              {/* Header */}
              <div className="px-4 py-3.5 border-b border-dashed border-[#c3d4cc] bg-[#f4f9f7]">
                <p className="text-xs font-sans font-bold uppercase tracking-[2px] text-black">
                  Clinical Index
                </p>
              </div>
              {/* Nav links */}
              <nav aria-label="Clinical sections">
                {populatedSections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-xs font-sans border-b border-[#dde8e3]/60 last:border-0 group cursor-pointer ${activeSection === s.id
                          ? "bg-[#157a6d] text-white font-bold"
                          : "text-black hover:bg-[#f4f9f7] hover:text-[#157a6d] font-medium"
                        }`}
                    >
                      <Icon size={14} className={activeSection === s.id ? "text-white" : "text-[#157a6d] group-hover:text-[#157a6d]"} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Available Brands card */}
            <div className="bg-white border border-[#dde8e3] rounded-sm overflow-hidden shadow-sm">
              <div className="px-4 py-3.5 border-b border-dashed border-[#c3d4cc] bg-[#f4f9f7] flex items-center justify-between">
                <p className="text-xs font-sans font-bold uppercase tracking-[2px] text-black">
                  Available Brands
                </p>
                {!productsLoading && products.length > 0 && (
                  <span className="text-xs font-sans font-bold text-[#157a6d]">{products.length} found</span>
                )}
              </div>

              {productsLoading ? (
                <div className="py-6 flex justify-center"><Loader size="sm" /></div>
              ) : products.length > 0 ? (
                <>
                  <div className="divide-y divide-[#dde8e3]/60">
                    {products.slice(0, 3).map((prod, idx) => {
                      const price = prod.salePrice || prod.price || 0;
                      return (
                        <div
                          key={prod.id || prod._id || idx}
                          onClick={() => navigate(`/products/${prod.slug}`)}
                          className="px-4 py-3 cursor-pointer group hover:bg-[#f4f9f7] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-sans font-bold text-black group-hover:text-[#157a6d] transition-colors leading-snug line-clamp-2">
                              {prod.name}
                            </p>
                            <span className="text-xs font-sans font-bold text-black shrink-0">
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                          </div>
                          {(prod.manufacturer || prod.marketer) && (
                            <p className="text-[10px] font-sans text-[#444444] mt-0.5 truncate font-medium">
                              {prod.manufacturer || prod.marketer}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3.5 border-t border-dashed border-[#c3d4cc] bg-[#f8faf9]">
                    <button
                      onClick={() => setShowAllBrandsModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-sans font-bold uppercase tracking-widest text-[#157a6d] hover:bg-[#157a6d] hover:text-white border border-[#157a6d] bg-white rounded-md transition-all cursor-pointer shadow-2xs"
                    >
                      VIEW ALL ({products.length}) <ArrowRight size={12} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-xs font-sans text-black font-semibold">No brands listed.</p>
                </div>
              )}
            </div>

          </aside>

          {/* ── MAIN CONTENT (Clean Editorial Reading Layout) ─────────── */}
          <main ref={contentRef} className="lg:col-span-9 space-y-0 order-1 lg:order-2" aria-label="Molecule clinical information">
            <div className="bg-white border border-[#dde8e3] rounded-sm overflow-hidden shadow-sm">

              {/* ── 1. Background ── */}
              {(molecule.description || molecule.shortDescription) && (
                <ClinicalSection id="background" title={`Background — ${molecule.name}`} icon={BookOpen}>
                  <EditorialText>{molecule.description || molecule.shortDescription}</EditorialText>
                </ClinicalSection>
              )}

              {/* ── 2. Mechanism of Action ── */}
              {molecule.howItWorks && (
                <ClinicalSection id="mechanism" title="Mechanism of Action" icon={Atom}>
                  <EditorialText>{molecule.howItWorks}</EditorialText>
                </ClinicalSection>
              )}

              {/* ── 3. Clinical Uses / Benefits ── */}
              {(molecule.uses || molecule.benefits) && (
                <ClinicalSection id="uses" title={`Clinical Uses of ${molecule.name}`} icon={FlaskConical}>
                  <EditorialText>{molecule.uses || molecule.benefits}</EditorialText>
                  {molecule.uses && molecule.benefits && molecule.uses !== molecule.benefits && (
                    <>
                      <div className="mt-6 pt-6 border-t border-dashed border-[#c3d4cc]">
                        <p className="text-base sm:text-lg font-mono font-bold uppercase tracking-[2px] text-black mb-3">Key Benefits</p>
                        <EditorialText>{molecule.benefits}</EditorialText>
                      </div>
                    </>
                  )}
                </ClinicalSection>
              )}

              {/* ── 4. Dosage Guidelines ── */}
              {molecule.dosage && (
                <ClinicalSection id="dosage" title={`Dosage Guidelines — ${molecule.name}`} icon={Pill}>
                  <EditorialText>{molecule.dosage}</EditorialText>
                </ClinicalSection>
              )}

              {/* ── 5. Side Effects ── */}
              {molecule.sideEffects && (
                <ClinicalSection id="sideeffects" title="Common Side Effects" icon={Thermometer}>
                  <EditorialText>{molecule.sideEffects}</EditorialText>
                </ClinicalSection>
              )}

              {/* ── 6. Warnings & Precautions ── */}
              {(molecule.warnings || molecule.precautions) && (
                <ClinicalSection id="warnings" title="Warnings & Precautions" icon={ShieldCheck} accent>
                  {molecule.warnings && (
                    <>
                      <p className="text-base sm:text-lg font-mono font-bold uppercase tracking-[2px] text-[#b08d3e] mb-3">Warnings</p>
                      <EditorialText>{molecule.warnings}</EditorialText>
                    </>
                  )}
                  {molecule.precautions && (
                    <div className={molecule.warnings ? "mt-6 pt-6 border-t border-dashed border-[#c3d4cc]" : ""}>
                      {molecule.warnings && <p className="text-base sm:text-lg font-mono font-bold uppercase tracking-[2px] text-[#b08d3e] mb-3">Precautions</p>}
                      <EditorialText>{molecule.precautions}</EditorialText>
                    </div>
                  )}
                </ClinicalSection>
              )}

              {/* ── 7. Storage Instructions ── */}
              {molecule.storage && (
                <ClinicalSection id="storage" title="Storage Instructions" icon={BookMarked}>
                  <EditorialText>{molecule.storage}</EditorialText>
                </ClinicalSection>
              )}

              {/* ── 8. FAQs ── */}
              {molecule.faqs?.length > 0 && (
                <ClinicalSection id="faqs" title="Frequently Asked Questions" icon={HelpCircle}>
                  <div className="divide-y divide-[#dde8e3]/70">
                    {molecule.faqs.map((faq, idx) => {
                      const isOpen = openFaqIdx === idx;
                      return (
                        <div key={idx}>
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full flex items-start justify-between gap-5 py-5 text-left hover:text-[#157a6d] transition-colors group focus:outline-none cursor-pointer"
                            aria-expanded={isOpen}
                          >
                            <span
                              className="text-lg sm:text-xl text-black group-hover:text-[#157a6d] transition-colors font-sans font-bold leading-snug"
                            >
                              {faq.question}
                            </span>
                            <ChevronDown
                              size={18}
                              className={`shrink-0 text-black transition-transform mt-1 ${isOpen ? "rotate-180 text-[#157a6d]" : ""}`}
                            />
                          </button>
                          {isOpen && (
                            <div className="pb-5 animate-[fade-in_0.2s_ease-out]">
                              <p className="text-base text-black leading-relaxed font-sans font-normal">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ClinicalSection>
              )}

              {/* ── 9. Clinical References ── */}
              {molecule.references?.length > 0 && (
                <ClinicalSection id="references" title="Clinical References" icon={BookMarked}>
                  <ol className="space-y-3">
                    {molecule.references.map((ref, idx) => (
                      <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base font-mono text-black leading-relaxed font-semibold">
                        <span className="text-[#157a6d] shrink-0 select-none font-bold w-6 text-right">
                          {idx + 1}.
                        </span>
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ol>
                </ClinicalSection>
              )}

              {/* ── 10. Related Molecules ── */}
              {(molecule.relatedMoleculesText || molecule.relatedMolecules?.length > 0) && (
                <ClinicalSection id="related" title="Related Molecules" icon={FlaskConical}>
                  <div className="flex flex-wrap gap-2.5">
                    {molecule.relatedMolecules?.length > 0
                      ? molecule.relatedMolecules.map((rel, idx) => {
                        const relName = typeof rel === "object" ? rel.name : rel;
                        const relSlug = typeof rel === "object" ? rel.slug : rel;
                        return (
                          <button
                            key={idx}
                            onClick={() => navigate(`/molecules/${relSlug}`)}
                            className="text-xs sm:text-sm font-mono font-bold px-3.5 py-2 border border-[#157a6d] text-black hover:bg-[#157a6d] hover:text-white rounded-sm transition-all cursor-pointer"
                          >
                            {relName}
                          </button>
                        );
                      })
                      : molecule.relatedMoleculesText
                        .split(/\n/)
                        .map((line) => line.replace(/^[•\-\*\s]+/, "").trim())
                        .filter(Boolean)
                        .map((relName, idx) => (
                          <button
                            key={idx}
                            onClick={() => navigate(`/molecules/${relName.toLowerCase().replace(/\s+/g, "-")}`)}
                            className="text-xs sm:text-sm font-mono font-bold px-3.5 py-2 border border-[#157a6d] text-black hover:bg-[#157a6d] hover:text-white rounded-sm transition-all cursor-pointer"
                          >
                            {relName}
                          </button>
                        ))}
                  </div>
                </ClinicalSection>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── ALL BRANDS MODAL ──────────────────────────────────────────── */}
      {showAllBrandsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          onClick={() => setShowAllBrandsModal(false)}
        >
          <div
            className="bg-white border border-[#dde8e3] rounded-sm p-0 max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dashed border-[#c3d4cc] bg-[#f4f9f7] shrink-0">
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-[2.5px] text-black">Available Brands</p>
                <p className="text-lg font-sans font-bold text-black mt-0.5">{molecule.name}</p>
              </div>
              <button
                onClick={() => setShowAllBrandsModal(false)}
                className="w-8 h-8 rounded-sm border border-[#dde8e3] flex items-center justify-center text-black hover:bg-[#f4f9f7] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {/* List */}
            <div className="overflow-y-auto divide-y divide-[#dde8e3]/60">
              {products.map((prod, idx) => {
                const price = prod.salePrice || prod.price || 0;
                return (
                  <div
                    key={prod.id || prod._id || idx}
                    onClick={() => { setShowAllBrandsModal(false); navigate(`/products/${prod.slug}`); }}
                    className="px-6 py-4 cursor-pointer hover:bg-[#f4f9f7] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-base font-sans font-bold text-black group-hover:text-[#157a6d] transition-colors leading-snug">
                          {prod.name}
                        </p>
                        {(prod.manufacturer || prod.marketer) && (
                          <p className="text-xs font-mono text-black mt-1 font-medium">{prod.manufacturer || prod.marketer}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {prod.requiresPrescription ? (
                            <span className="text-xs font-mono font-bold uppercase tracking-wide border border-[#157a6d] text-[#157a6d] px-2.5 py-0.5 rounded-sm">Rx Required</span>
                          ) : (
                            <span className="text-xs font-mono font-bold text-black border border-[#c3d4cc] px-2.5 py-0.5 rounded-sm">OTC</span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-black shrink-0 text-base">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                    </div>
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

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const ClinicalSection = ({ id, title, icon: Icon, children, accent }) => (
  <section
    id={id}
    className="scroll-mt-24 border-b border-[#dde8e3] last:border-0"
    aria-labelledby={`heading-${id}`}
  >
    {/* Section header */}
    <div className={`px-6 sm:px-9 pt-8 pb-4 border-b border-dashed border-[#c3d4cc] flex items-center gap-3.5 ${accent ? "bg-[#fffbf4]" : ""}`}>
      <Icon size={18} className={accent ? "text-[#b08d3e]" : "text-[#157a6d]"} />
      <h2
        id={`heading-${id}`}
        className="text-lg sm:text-xl font-sans font-bold uppercase tracking-[2px] text-black"
      >
        {title}
      </h2>
    </div>
    {/* Section body */}
    <div className={`px-6 sm:px-9 py-7 ${accent ? "bg-[#fffbf4]/40" : ""}`}>
      {children}
    </div>
  </section>
);

const EditorialText = ({ children }) => (
  <div className="text-base text-black leading-relaxed whitespace-pre-line font-sans font-normal">
    {children}
  </div>
);

export default MoleculeDetailPage;
