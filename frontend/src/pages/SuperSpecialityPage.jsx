import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, Sparkles, Phone, FileText, Activity, Layers } from "lucide-react";
import { api } from "../services/api";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";

const SuperSpecialityPage = () => {
  const navigate = useNavigate();
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const data = await api.getSpecialities();
        setSpecialities(data || []);
      } catch (err) {
        console.error("Failed to load specialities", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialities();
  }, []);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Super Specialities", url: "/super-speciality" },
  ];

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title="Browse By Super Speciality | WellMeds Specialty Therapeutics"
        description="Explore WellMeds extensive medical specialities index and buy prescription medicines categorized by clinical treatment areas."
        canonical="/super-speciality"
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
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">Super Specialities</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>CLINICAL THERAPEUTICS INDEX</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                Browse By Super Speciality
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                Access specialized medications and pharmaceutical formulations organized by clinical categories. Find verified therapeutics recommended by licensed practitioners.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/upload-prescription"
                className="bg-[#157a6d] hover:bg-[#0f5c52] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
              >
                <FileText size={15} />
                <span>Upload Prescription</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="bg-[#f4f9f7] hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#172b26] dark:text-zinc-200 px-6 py-2.5 rounded-full text-xs font-semibold transition-all border border-slate-200 dark:border-zinc-700 flex items-center gap-2 cursor-pointer"
              >
                <Phone size={15} />
                <span>Talk to Pharmacist</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── SPECIALITIES GRID ── */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-200 dark:border-zinc-800 p-6 space-y-3 animate-pulse">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                  <div className="h-5 bg-slate-100 dark:bg-zinc-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : specialities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialities.map((spec) => (
                <Link
                  key={spec.id || spec._id}
                  to={`/speciality/${spec.slug}`}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-6 shadow-sm flex items-start gap-4 hover:shadow-md hover:-translate-y-1 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#f4f9f7] dark:bg-emerald-950/40 border border-emerald-200 text-[#157a6d] flex items-center justify-center shrink-0 group-hover:bg-[#157a6d] group-hover:text-white transition-colors">
                    <Activity size={22} />
                  </div>
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#172b26] dark:text-white group-hover:text-[#157a6d] transition-colors truncate">
                        {spec.name}
                      </h3>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {spec.description || `Browse authentic ${spec.name} prescription medicines & formulations.`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
              <Layers size={36} className="mx-auto text-slate-400" />
              <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                No Specialities Registered
              </h3>
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

export default SuperSpecialityPage;
