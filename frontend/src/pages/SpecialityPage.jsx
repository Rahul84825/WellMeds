import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import {
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Layers,
  Sparkles,
  Phone,
  FileText,
  Package,
  Activity
} from "lucide-react";

const SpecialityPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;

  const [speciality, setSpeciality] = useState(null);
  const [allSpecialities, setAllSpecialities] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Pagination
  const currentPage = pageParam;
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;

  // Load active specialities for sidebar
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const list = await api.getSpecialities();
        setAllSpecialities(list);
      } catch (err) {
        console.error("Failed to load specialities for sidebar", err);
      }
    };
    fetchSidebarData();
  }, []);

  // Load current speciality & its products
  useEffect(() => {
    const fetchSpecialityData = async () => {
      setLoading(true);
      try {
        const spec = await api.getSpeciality(slug);
        setSpeciality(spec);

        const prodData = await api.getProducts({
          speciality: slug,
          page: currentPage,
          limit: limit,
        });

        setProducts(prodData.products || []);
        setTotalProducts(prodData.total || 0);
        setTotalPages(prodData.pages || 1);
      } catch (err) {
        console.error("Failed to load speciality data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialityData();
  }, [slug, currentPage]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Specialities", url: "/super-speciality" },
    { name: speciality?.name || "Speciality", url: `/speciality/${slug}` },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-grid py-12 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#157a6d] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clinical-grid py-8 md:py-12 animate-[fade-in_0.3s_ease-out]">
      <SEO
        title={`${speciality?.name || "Speciality"} Formulations | WellMeds`}
        description={speciality?.description || `Explore ${speciality?.name} prescription medications and clinical care at WellMeds.`}
        canonical={`/speciality/${slug}`}
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
              <Link to="/super-speciality" className="hover:text-[#157a6d]">Specialities</Link>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-[#157a6d] dark:text-emerald-400 font-bold">{speciality?.name}</span>
            </nav>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#f4f9f7] dark:bg-emerald-950/60 border border-[#157a6d]/20 px-3 py-1 rounded-full font-clinical-mono text-xs font-semibold text-[#157a6d] dark:text-emerald-400 uppercase tracking-widest">
                <Sparkles size={14} className="text-[#b08d3e]" />
                <span>CLINICAL SPECIALITY</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold text-[#172b26] dark:text-white tracking-tight">
                {speciality?.name}
              </h1>

              <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans max-w-2xl">
                {speciality?.description || `Explore authentic ${speciality?.name} medications, specialty care regimens, and formulations verified by clinical pharmacists.`}
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

        {/* ── MAIN CONTENT: SIDEBAR + PRODUCT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar: All Specialities Navigation */}
          <aside className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-5 shadow-sm space-y-4 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <Layers size={18} className="text-[#157a6d]" />
              <h3 className="font-bold text-xs uppercase tracking-wider font-clinical-mono text-[#172b26] dark:text-white">
                All Specialities
              </h3>
            </div>
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {allSpecialities.map((item) => {
                const isActive = item.slug === slug;
                return (
                  <Link
                    key={item.id || item._id}
                    to={`/speciality/${item.slug}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${isActive
                        ? "bg-[#157a6d] text-white shadow-xs"
                        : "text-slate-600 dark:text-zinc-300 hover:bg-[#f4f9f7] dark:hover:bg-zinc-800 hover:text-[#157a6d]"
                      }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <ChevronRight size={14} className={isActive ? "text-white" : "text-slate-400"} />
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Main Grid Column */}
          <main className="lg:col-span-9 space-y-6">
            {products.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    Showing <span className="font-bold text-[#172b26] dark:text-white">{products.length}</span> of <span className="font-bold text-[#172b26] dark:text-white">{totalProducts}</span> Speciality Formulations
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((prod) => (
                    <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4">
                <Package size={36} className="mx-auto text-slate-400" />
                <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">
                  No Products Found in {speciality?.name}
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  We are actively expanding our catalog for this specialty area. Check back soon.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-zinc-800 rounded-full hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-zinc-800 rounded-full hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handlePageChange(pNum)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer ${currentPage === pNum
                          ? "bg-[#157a6d] text-white shadow-xs"
                          : "hover:bg-white text-slate-600 dark:text-zinc-300"
                        }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-zinc-800 rounded-full hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-zinc-800 rounded-full hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </main>
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

export default SpecialityPage;
