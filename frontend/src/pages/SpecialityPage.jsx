import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";
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
  const { currentPage, setPage } = usePaginationUrl();

  const [speciality, setSpeciality] = useState(null);
  const [allSpecialities, setAllSpecialities] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 20;

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
        setTotalProducts(prodData.totalProducts || prodData.total || 0);
        setTotalPages(prodData.totalPages || prodData.pages || 1);
      } catch (err) {
        console.error("Failed to load speciality data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialityData();
  }, [slug, currentPage]);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Specialities", url: "/super-speciality" },
    { name: speciality?.name || "Speciality", url: `/speciality/${slug}` },
  ];

  if (loadingSpeciality) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 py-12 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#157a6d] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title={`${speciality?.name || "Speciality"} Formulations | WellMeds`}
        description={speciality?.description || `Explore ${speciality?.name} prescription medications and clinical care at WellMeds.`}
        canonical={`/speciality/${slug}`}
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            {speciality?.name}
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── MAIN CONTENT: SIDEBAR + PRODUCT GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar: All Specialities Navigation */}
            <aside className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] p-5 shadow-xs space-y-4 text-left">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {products.map((prod) => (
                    <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
                  ))}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProducts}
                  pageSize={limit}
                  onPageChange={setPage}
                  itemLabel="Speciality Formulations"
                />
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
          </main>
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

export default SpecialityPage;
