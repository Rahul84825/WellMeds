import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { FlaskConical, ChevronRight, ArrowRight } from "lucide-react";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const BG_STYLE = {
  background: `
    repeating-linear-gradient(0deg, rgba(15,59,52,0.045) 0px, rgba(15,59,52,0.045) 1px, transparent 1px, transparent 40px),
    repeating-linear-gradient(90deg, rgba(15,59,52,0.045) 0px, rgba(15,59,52,0.045) 1px, transparent 1px, transparent 40px),
    radial-gradient(ellipse at 60% 0%, #eef5f0 0%, #dce9e2 100%)
  `,
};

const MoleculesPage = () => {
  const navigate = useNavigate();
  const [molecules, setMolecules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLetter, setActiveLetter] = useState("ALL");

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    document.title = "Molecule Reference Index | WellMeds Specialty Pharmacy";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Browse WellMeds complete molecule reference library. Active pharmaceutical ingredients, mechanisms of action, clinical uses, and available brands.");

    const fetchMolecules = async () => {
      try {
        const list = await api.getMolecules();
        setMolecules(list || []);
      } catch (err) {
        console.error("Failed to load molecules", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMolecules();
  }, []);

  const groupedMolecules = {};
  molecules.forEach((m) => {
    const firstChar = m.letter ? m.letter.toUpperCase() : m.name ? m.name.charAt(0).toUpperCase() : "#";
    const groupKey = letters.includes(firstChar) ? firstChar : "#";
    if (!groupedMolecules[groupKey]) groupedMolecules[groupKey] = [];
    groupedMolecules[groupKey].push(m);
  });

  const availableLetters = letters.filter((l) => groupedMolecules[l]?.length > 0);

  const handleLetterClick = (letter) => {
    setActiveLetter(letter);
    if (letter === "ALL") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(`mol-section-${letter}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const displayLetters = activeLetter === "ALL" ? availableLetters : availableLetters.filter((l) => l === activeLetter);

  return (
    <div className="min-h-screen text-black" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>

      {/* ── HERO HEADER (Aligned with Navbar max-w-[1400px] & px-6 lg:px-10) ── */}
      <div
        style={BG_STYLE}
        className="border-b border-[#c3d4cc]"
      >
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-9">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-5 select-none" aria-label="Breadcrumb">
            <span
              onClick={() => navigate("/")}
              className="text-xs font-mono uppercase tracking-widest text-black font-semibold cursor-pointer hover:text-[#157a6d] transition-colors"
            >Home</span>
            <ChevronRight size={11} className="text-[#888888]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#157a6d] font-bold">
              Molecule Index
            </span>
          </nav>

          {/* Eyebrow */}
          <p className="text-xs font-mono font-bold uppercase tracking-[2.5px] text-[#b08d3e] mb-3">
            <span className="font-serif font-black">℞</span> WellMeds Clinical Reference
          </p>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-3 leading-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Molecule <em style={{ fontStyle: "italic", color: "#157a6d" }}>Reference</em> Index
          </h1>
          <p className="text-base sm:text-lg text-black font-mono font-semibold max-w-2xl">
            {loading ? "Loading active monograph library..." : `${molecules.length.toLocaleString()} active pharmaceutical ingredients documented`}
          </p>
        </div>
      </div>

      {/* ── ALPHABET INDEX NAV (sticky & enlarged by 23%) ─────────────────────────────────── */}
      <div
        className="sticky top-16 z-30 border-b border-[#c3d4cc] backdrop-blur-md"
        style={{ background: "rgba(231,240,234,0.95)" }}
      >
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-3.5 flex flex-wrap items-center gap-1.5 select-none">
          <button
            onClick={() => handleLetterClick("ALL")}
            className={`px-4 py-2 text-xs sm:text-sm font-mono font-bold tracking-widest uppercase rounded-sm transition-all cursor-pointer ${
              activeLetter === "ALL"
                ? "bg-[#157a6d] text-white shadow-sm"
                : "text-black hover:text-[#157a6d] hover:bg-[#157a6d]/10 font-bold"
            }`}
          >
            ALL
          </button>
          <div className="w-px h-6 bg-[#c3d4cc] mx-2" />
          {letters.map((letter) => {
            const hasItems = !!groupedMolecules[letter]?.length;
            const isActive = activeLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => hasItems && handleLetterClick(letter)}
                disabled={!hasItems}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-mono rounded-sm transition-all ${
                  !hasItems
                    ? "text-[#c3d4cc] cursor-default"
                    : isActive
                    ? "bg-[#157a6d] text-white font-extrabold cursor-pointer shadow-sm"
                    : "text-black hover:text-[#157a6d] hover:bg-[#157a6d]/10 cursor-pointer font-bold"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT (Aligned with Navbar max-w-[1400px] & px-6 lg:px-10) ── */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : (
          /* ── MOLECULE GRID (grouped by letter) ── */
          <div className="space-y-12">
            {displayLetters.map((letter) => (
              <section
                key={letter}
                id={`mol-section-${letter}`}
                className="scroll-mt-28"
                aria-labelledby={`mol-heading-${letter}`}
              >
                {/* Letter heading — editorial divider */}
                <div className="flex items-baseline gap-5 mb-6">
                  <h2
                    id={`mol-heading-${letter}`}
                    className="text-4xl sm:text-5xl font-bold text-[#157a6d] leading-none select-none"
                    style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                  >
                    {letter}
                  </h2>
                  <div className="flex-1 h-px bg-[#c3d4cc]" />
                  <span className="text-xs font-mono text-black font-bold uppercase tracking-widest">
                    {groupedMolecules[letter].length} molecule{groupedMolecules[letter].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Molecule list — grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#c3d4cc] border border-[#c3d4cc] rounded-sm overflow-hidden shadow-sm">
                  {groupedMolecules[letter].map((mol) => (
                    <MoleculeCard key={mol.id || mol._id} mol={mol} navigate={navigate} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Molecule Card ─────────────────────────────────────────────────────── */
const MoleculeCard = ({ mol, navigate }) => {
  const formattedName = mol.name ? mol.name.replace(/,/g, ", ") : "";

  return (
    <button
      type="button"
      onClick={() => navigate(`/molecules/${mol.slug}`)}
      className="group bg-white hover:bg-[#f4f9f7] transition-colors text-left p-6 w-full flex flex-col gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#157a6d] focus-visible:z-10 relative cursor-pointer overflow-hidden"
      aria-label={`View details for ${mol.name}`}
    >
      {/* Category eyebrow */}
      {mol.category && (
        <span
          className="text-xs font-mono font-bold uppercase tracking-[2px] text-[#b08d3e]"
        >
          {mol.category}
        </span>
      )}

      {/* Name */}
      <h3
        className="text-base sm:text-lg font-bold text-black group-hover:text-[#157a6d] transition-colors leading-snug break-words [word-break:break-word] w-full"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {formattedName}
      </h3>

      {/* Short description */}
      {mol.shortDescription && (
        <p className="text-xs font-mono text-black font-medium line-clamp-2 leading-relaxed break-words">
          {mol.shortDescription}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-[#dde8e3] w-full">
        <span className="text-xs font-mono text-black font-bold uppercase tracking-widest group-hover:text-[#157a6d] transition-colors">
          View monograph
        </span>
        <ArrowRight
          size={14}
          className="text-black group-hover:text-[#157a6d] group-hover:translate-x-1 transition-all shrink-0"
        />
      </div>
    </button>
  );
};

export default MoleculesPage;
