import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";
import ConsultationModal from "../components/ConsultationModal";
import SEO from "../components/common/SEO";
import Pagination from "../components/common/Pagination";
import usePaginationUrl from "../hooks/usePaginationUrl";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pill,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  Phone,
  FileText,
  Package
} from "lucide-react";

const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const { currentPage, setPage } = usePaginationUrl();

  // Category & Data States
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [relatedCategories, setRelatedCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Filtering, Search & Sorting States
  const [searchVal, setSearchVal] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");

  // Pagination State (Driven by DB response)
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  // Single unified data fetching effect with AbortController & state reset
  useEffect(() => {
    const controller = new AbortController();

    // 1. Immediately reset state to eliminate stale data leakage when switching category
    setProducts([]);
    setTotalProducts(0);
    setTotalPages(1);
    setLoadingCategory(true);
    setLoadingProducts(true);

    const loadCategoryData = async () => {
      try {
        const [catData, allCats, prodData] = await Promise.all([
          api.getCategory(categorySlug, { signal: controller.signal }).catch(() => null),
          api.getCategories({ signal: controller.signal }).catch(() => []),
          api.getProducts(
            {
              category: categorySlug,
              page: currentPage,
              limit: LIMIT,
              sortBy: sortBy,
              search: searchVal || undefined,
            },
            { signal: controller.signal }
          ).catch(() => ({ products: [], totalProducts: 0, totalPages: 1 }))
        ]);

        if (controller.signal.aborted) return;

        // Set Category Header
        if (catData) {
          setCategory(catData);
        } else {
          const name = categorySlug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          setCategory({ name, slug: categorySlug, description: "" });
        }

        // Set Related Categories (all active categories)
        const activeCats = (allCats || []).filter(
          (c) => c.status === "Active" || c.isActive === true
        );
        const filteredRelated = activeCats.filter((c) => c.slug !== categorySlug);
        setRelatedCategories(filteredRelated);

        // Set Products & DB Pagination Metadata
        setProducts(prodData.products || []);
        setTotalProducts(prodData.totalProducts || prodData.total || 0);
        setTotalPages(prodData.totalPages || prodData.pages || 1);

      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Failed to load category page data", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCategory(false);
          setLoadingProducts(false);
        }
      }
    };

    loadCategoryData();

    return () => {
      // Cancel pending network requests if user changes category rapidly
      controller.abort();
    };
  }, [categorySlug, currentPage, sortBy, searchVal]);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/categories" },
    { name: category?.name || "Category", url: `/category/${categorySlug}` },
  ];

  if (loadingCategory) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 py-12 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#157a6d] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!category && !loadingCategory) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 py-12">
        <SEO title="Category Not Found — WellMeds" noindex={true} canonical="/categories" />
        <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] p-8 text-center space-y-4 shadow-sm">
          <Pill size={40} className="mx-auto text-slate-400" />
          <h2 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">Category Not Found</h2>
          <p className="text-xs text-slate-500 font-sans">The requested therapeutic category does not exist or has been moved.</p>
          <Link to="/categories" className="bg-[#157a6d] text-white px-6 py-2.5 rounded-full text-xs font-semibold inline-block hover:bg-[#0f6157] transition-colors">
            Browse All Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-left animate-[fade-in_0.3s_ease-out]">
      <SEO
        title={`${category?.name || "Category"} Medicines & Formulations | WellMeds`}
        description={category?.description || `Browse authentic clinical ${category?.name} prescription medicines and therapeutic treatments at WellMeds.`}
        canonical={`/category/${categorySlug}`}
        breadcrumbs={breadcrumbs}
      />

      {/* ── HERO TITLE HEADER WITH LIGHT GREEN GRADIENT ── */}
      <div className="relative bg-gradient-to-b from-[#8ad8b7] via-[#caf0e2] to-white dark:from-[#0d3328] dark:via-[#091a14] dark:to-zinc-950 pt-10 pb-12 sm:pt-14 sm:pb-16 md:pt-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#11221e] dark:text-white tracking-tight">
            {category?.name}
          </h1>
        </div>
      </div>

      {/* ── MAIN CONTENT (WHITE BACKGROUND) ── */}
      <div className="bg-white dark:bg-zinc-950 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* ── PRODUCT GRID OR SKELETONS ── */}
          <div>
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-300 dark:border-zinc-800 p-4 space-y-3 animate-pulse">
                    <div className="w-full h-40 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
                    <div className="h-4 bg-slate-100 dark:bg-zinc-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((prod) => (
                    <ProductCard key={(prod._id || prod.id)?.toString()} product={prod} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalProducts}
                  pageSize={LIMIT}
                  onPageChange={setPage}
                  itemLabel="Formulations"
                />
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-[28px] p-8 shadow-sm space-y-4 max-w-lg mx-auto">
                <Package size={36} className="mx-auto text-slate-400" />
                <h3 className="font-editorial text-2xl font-semibold text-[#172b26] dark:text-white">No Formulations Available</h3>
                <p className="text-xs text-slate-500 font-sans">No products currently match your active search filter in this category.</p>
              </div>
            )}
          </div>

          {/* ── RELATED MEDICAL CONDITIONS ── */}
          {relatedCategories.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-[28px] border border-slate-300 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-[#172b26] dark:text-white">
                Related Medical Conditions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedCategories.map((relCat) => (
                  <Link
                    key={relCat._id || relCat.id}
                    to={`/category/${relCat.slug}`}
                    className="flex items-center justify-between gap-2 p-3 bg-[#f8fafc] dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl hover:border-[#157a6d] transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Pill size={16} className="text-[#157a6d] shrink-0" />
                      <span className="font-bold text-[#172b26] dark:text-zinc-200 text-xs truncate group-hover:text-[#157a6d]">
                        {relCat.name}
                      </span>
                    </div>
                    {typeof relCat.count === "number" && relCat.count > 0 && (
                      <span className="bg-[#157a6d]/10 text-[#157a6d] dark:bg-emerald-950 dark:text-emerald-400 text-[10px] font-clinical-mono font-bold px-2 py-0.5 rounded-full shrink-0">
                        {relCat.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

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

export default CategoryDetailPage;
