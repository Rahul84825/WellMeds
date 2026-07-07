import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import { toast } from "sonner";
import { 
  ChevronRight, 
  ChevronLeft, 
  ChevronsLeft, 
  ChevronsRight,
  Layers, 
  ShieldAlert,
  Activity,
  HeartPulse
} from "lucide-react";

const SpecialityPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page")) || 1;

  const [speciality, setSpeciality] = useState(null);
  const [allSpecialities, setAllSpecialities] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
        // 1. Fetch speciality details
        const spec = await api.getSpeciality(slug);
        setSpeciality(spec);

        // 2. Fetch associated products using pagination
        const prodData = await api.getProducts({
          speciality: slug,
          page: currentPage,
          limit: limit,
        });

        setProducts(prodData.products);
        setTotalProducts(prodData.total);
        setTotalPages(prodData.pages);
      } catch (err) {
        console.error("Failed to load speciality data", err);
        toast.error("Speciality page not found or currently offline.");
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialityData();
  }, [slug, currentPage]);

  // Handle SEO Meta and JSON-LD structured script injection
  useEffect(() => {
    if (speciality) {
      // Document Title
      document.title = speciality.seoTitle || `${speciality.name} Medications & Supplies - WellMeds`;

      // Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = speciality.seoDescription || speciality.shortDescription || "";

      // Meta Keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.name = "keywords";
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = speciality.seoKeywords || "";

      // Canonical URL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = window.location.href;

      // Open Graph Tags
      const setOgTag = (property, value) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.content = value;
      };

      setOgTag("og:title", speciality.seoTitle || speciality.name);
      setOgTag("og:description", speciality.seoDescription || speciality.shortDescription);
      setOgTag("og:url", window.location.href);
      setOgTag("og:type", "website");
      if (speciality.bannerImage) {
        setOgTag("og:image", speciality.bannerImage);
      }

      // Twitter Card Tags
      const setTwitterTag = (name, value) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("name", name);
          document.head.appendChild(tag);
        }
        tag.content = value;
      };

      setTwitterTag("twitter:card", "summary_large_image");
      setTwitterTag("twitter:title", speciality.seoTitle || speciality.name);
      setTwitterTag("twitter:description", speciality.seoDescription || speciality.shortDescription || "");
      if (speciality.bannerImage) {
        setTwitterTag("twitter:image", speciality.bannerImage);
      }

      // JSON-LD structured schema script injection
      const scriptId = "speciality-jsonld";
      let scriptEl = document.getElementById(scriptId);
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = scriptId;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }

      const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "name": speciality.name,
        "description": speciality.shortDescription,
        "url": window.location.href,
        "mainEntity": {
          "@type": "MedicalSpecialty",
          "name": speciality.name,
          "description": speciality.shortDescription
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": window.location.origin
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Speciality",
              "item": `${window.location.origin}/speciality`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": speciality.name,
              "item": window.location.href
            }
          ]
        }
      };

      scriptEl.text = JSON.stringify(jsonLdData);

      return () => {
        // Clean up schema on route change/unmount
        if (scriptEl) {
          scriptEl.remove();
        }
      };
    }
  }, [speciality]);

  const handlePageChange = (pageNum) => {
    setSearchParams({ page: pageNum });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading && !speciality) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!speciality) {
    return (
      <div className="max-w-7xl mx-auto py-xxl px-md text-center">
        <ShieldAlert className="mx-auto text-red-500 mb-md" size={48} />
        <h1 className="font-extrabold text-xl text-slate-800 dark:text-zinc-100">Speciality Not Found</h1>
        <p className="text-xs text-slate-400 mt-xs">The clinical specialty page you requested does not exist or has been disabled.</p>
        <Link to="/" className="inline-block mt-lg bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-lg px-md space-y-lg text-left animate-[fade-in_0.3s_ease-out]">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-xs text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
        <Link to="/" className="hover:text-slate-600 dark:hover:text-zinc-200">Home</Link>
        <ChevronRight size={10} />
        <span className="text-slate-400">Speciality</span>
        <ChevronRight size={10} />
        <span className="text-[#004782] dark:text-[#a4c9ff]">{speciality.name}</span>
      </nav>

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-lg border border-slate-800">
        {speciality.bannerImage ? (
          <>
            <img 
              alt={speciality.name} 
              src={speciality.bannerImage} 
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#002b55] via-[#004782] to-[#0062a3] opacity-90" />
        )}

        <div className="relative z-10 p-lg sm:p-xl md:p-xxl max-w-2xl space-y-md">
          <div className="flex items-center gap-sm">
            {speciality.iconImage ? (
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl p-2 flex items-center justify-center border border-white/20">
                <img src={speciality.iconImage} className="w-full h-full object-contain filter invert brightness-200" alt={speciality.name} />
              </div>
            ) : (
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <HeartPulse className="text-white" size={24} />
              </div>
            )}
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-md py-1 rounded-full border border-white/15">
              Clinical Speciality
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {speciality.name}
          </h1>
          
          {speciality.shortDescription && (
            <p className="text-sm text-slate-200 font-medium leading-relaxed max-w-xl">
              {speciality.shortDescription}
            </p>
          )}
        </div>
      </div>

      {/* Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg items-start">
        
        {/* Sidebar Nav */}
        <aside className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-md shadow-sm space-y-md sticky top-24 z-20">
          <h2 className="font-extrabold text-xs text-slate-800 dark:text-zinc-100 pb-sm border-b border-slate-100 dark:border-zinc-800 flex items-center gap-xs">
            <Layers size={14} className="text-[#004782]" />
            Active Specialities
          </h2>

          <div className="flex flex-col gap-xs">
            {allSpecialities.map((item) => {
              const isActive = item.slug === slug;
              return (
                <Link
                  key={item._id || item.id}
                  to={`/speciality/${item.slug}`}
                  className={`flex items-center justify-between px-md py-2.5 rounded-2xl text-xs font-bold transition-all select-none ${
                    isActive
                      ? "bg-[#004782] text-white shadow-md shadow-[#004782]/10"
                      : "text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850"
                  }`}
                >
                  <div className="flex items-center gap-sm min-w-0">
                    {item.iconImage ? (
                      <img 
                        src={item.iconImage} 
                        className={`w-4 h-4 object-contain ${isActive ? "filter invert brightness-200" : "opacity-60"}`} 
                        alt="" 
                      />
                    ) : (
                      <Activity size={12} className={isActive ? "text-white" : "text-slate-400"} />
                    )}
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-sm py-0.5 rounded-lg border ${
                    isActive 
                      ? "bg-white/10 border-white/20 text-white" 
                      : "bg-slate-100 dark:bg-zinc-950 border-slate-200/50 dark:border-zinc-800 text-slate-400"
                  }`}>
                    {item.productCount}
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Product Grid & SEO Content */}
        <main className="lg:col-span-3 space-y-xl">
          
          {/* Section Header */}
          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 px-lg py-sm rounded-2xl shadow-sm">
            <h3 className="font-extrabold text-xs text-slate-800 dark:text-zinc-100">
              Approved Therapeutics & Supplies
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">
              {totalProducts > 0 
                ? `Showing ${Math.min(totalProducts, (currentPage - 1) * limit + 1)}-${Math.min(totalProducts, currentPage * limit)} of ${totalProducts} items`
                : "0 products found"
              }
            </p>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
              {products.map((prod) => (
                <ProductCard key={prod.id || prod._id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-xxl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm">
              <ShieldAlert className="mx-auto text-slate-300 dark:text-zinc-700 mb-sm" size={40} />
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-zinc-300">Catalog Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-xs">
                No products are currently cataloged under {speciality.name}. Please contact our support team for custom clinical procurement.
              </p>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-lg select-none text-xs font-bold text-slate-400 mt-lg">
              <div className="flex items-center gap-xs">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>

              <div className="flex items-center gap-xs">
                {getPageNumbers().map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                      currentPage === pNum
                        ? "bg-[#004782] text-white shadow-md shadow-[#004782]/10"
                        : "hover:bg-slate-50 dark:hover:bg-zinc-950 text-slate-500"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-xs">
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Last Page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Repeatable Rich SEO Content Sections */}
          {speciality.richContentSections && speciality.richContentSections.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-sm space-y-lg mt-xl">
              {speciality.richContentSections
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((sec, idx) => (
                  <div key={idx} className="space-y-sm">
                    {idx > 0 && <hr className="border-slate-100 dark:border-zinc-800" />}
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004782]" />
                      {sec.heading}
                    </h3>
                    <div 
                      className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium space-y-md"
                      dangerouslySetInnerHTML={{ __html: sec.richTextDescription }}
                    />
                  </div>
                ))}
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

export default SpecialityPage;
