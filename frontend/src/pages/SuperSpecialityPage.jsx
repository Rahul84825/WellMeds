import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { ShieldAlert, HeartPulse, ChevronRight, Activity } from "lucide-react";

const SuperSpecialityPage = () => {
  const navigate = useNavigate();
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Browse By Super Speciality | WellMeds";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Explore our extensive medical specialities and find prescription medicines cataloged for specific clinical areas.");

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

  return (
    <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[11px] text-slate-400 gap-xs mb-sm font-semibold select-none">
        <span className="cursor-pointer hover:text-[#038076] transition-colors" onClick={() => navigate("/")}>Home</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#038076] dark:text-[#a4c9ff]">Super Speciality</span>
      </nav>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#002b55] via-[#004782] to-[#0062a3] text-white p-lg sm:p-xl md:p-xxl shadow-lg border border-[#004782]/20 mb-xl select-none">
        <div className="relative z-10 max-w-2xl space-y-md">
          <div className="inline-flex items-center gap-xs text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-md py-1 rounded-full border border-white/15">
            <HeartPulse size={12} className="text-white" />
            Clinical Therapeutics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Browse By Super Speciality
          </h1>
          <p className="text-sm text-slate-200 font-medium leading-relaxed max-w-xl">
            Access specialized medications and pharmaceutical formulations organized by clinical categories. Find verified therapeutics recommended by licensed practitioners.
          </p>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Specialities Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <Loader size="lg" />
        </div>
      ) : specialities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md w-full">
          {specialities.map((spec) => (
            <div
              key={spec.id || spec._id}
              onClick={() => navigate(`/speciality/${spec.slug}`)}
              className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-850 rounded-2xl p-md shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#038076]/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group text-left h-full"
            >
              <div className="space-y-sm">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-950 rounded-xl p-2.5 flex items-center justify-center border border-slate-100 dark:border-zinc-800 shrink-0 transition-colors group-hover:bg-[#038076]/5">
                    {spec.iconImage ? (
                      <img src={spec.iconImage} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" alt={spec.name} />
                    ) : (
                      <Activity size={20} className="text-slate-400 group-hover:text-[#038076] transition-colors" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-sm py-0.5 rounded-lg border bg-slate-50 dark:bg-zinc-950 border-slate-200/60 dark:border-zinc-800 text-slate-400 group-hover:border-[#038076]/20 group-hover:bg-[#038076]/5 group-hover:text-[#038076] transition-colors">
                    {spec.productCount || 0} Products
                  </span>
                </div>
                <div className="space-y-xs pt-1">
                  <h3 className="font-extrabold text-slate-800 dark:text-zinc-100 text-base group-hover:text-[#038076] transition-colors">
                    {spec.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {spec.shortDescription || `Explore clinical medicines cataloged under our ${spec.name} department.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-[#038076] dark:text-[#a4c9ff] font-bold text-xs gap-xs pt-md mt-auto group-hover:underline">
                <span>View Products</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-2xl shadow-sm">
          <ShieldAlert className="mx-auto text-slate-300 dark:text-zinc-700 mb-md" size={48} />
          <h3 className="font-extrabold text-base text-slate-800 dark:text-zinc-100">No Specialities Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
            We couldn't find any medical specialities configured. Check the Admin panel to register clinical categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default SuperSpecialityPage;
