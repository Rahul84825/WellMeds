import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  HeartPulse,
  Pill,
  Activity,
  Apple,
  Stethoscope,
  Clock,
  ShieldCheck,
} from "lucide-react";

// Fallback curated articles to ensure instant zero-latency visual pop
const FALLBACK_FEATURED = [
  {
    _id: "f1",
    title: "Why Blood Thinners Need Careful, Ongoing Monitoring",
    slug: "why-blood-thinners-require-careful-ongoing-monitoring",
    category: "Medicine Guides",
    topic: "Anticoagulants",
    readTime: "5 min read",
    gradientClass: "from-[#0F3B34] to-[#157A6D]",
    author: { name: "Wellmeds Health Team", avatar: "W" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
  },
  {
    _id: "f2",
    title: "Understanding Insulin Types: Rapid, Short, and Long-Acting",
    slug: "understanding-insulin-types-rapid-short-and-long-acting",
    category: "Lifestyle",
    topic: "Diabetic Care",
    readTime: "6 min read",
    gradientClass: "from-[#157A6D] via-[#0F3B34] to-[#0F3B34]",
    author: { name: "Wellmeds Health Team", avatar: "W" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
  },
  {
    _id: "f3",
    title: "Understanding U=U: Undetectable Equals Untransmittable",
    slug: "understanding-uu-undetectable-equals-untransmittable",
    category: "Disease Awareness",
    topic: "HIV Care",
    readTime: "5 min read",
    gradientClass: "from-[#B08D3E] to-[#0F3B34]",
    author: { name: "Wellmeds Health Team", avatar: "W" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
  },
  {
    _id: "f4",
    title: "CPAP Machines: What to Check Before Buying One",
    slug: "cpap-machines-what-to-check-before-buying-one",
    category: "Health Guides",
    topic: "Equipment",
    readTime: "6 min read",
    gradientClass: "from-[#0F3B34] to-[#B08D3E]",
    author: { name: "Wellmeds Health Team", avatar: "W" },
    reviewer: { name: "Dr. Aarsheel Garcha", qualifications: "BPT", avatarText: "AG" },
  },
  {
    _id: "f5",
    title: "Do You Actually Need a Multivitamin? A Balanced Look",
    slug: "do-you-actually-need-a-multivitamin-a-balanced-look",
    category: "Nutrition",
    topic: "Wellness",
    readTime: "5 min read",
    gradientClass: "from-[#157A6D] to-[#B08D3E]",
    author: { name: "Wellmeds Health Team", avatar: "W" },
    reviewer: { name: "Payal Choudhary", qualifications: "D.Pharm", avatarText: "PC" },
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "health-guides", label: "Health Guides", match: "Health Guides" },
  { id: "medicine-guides", label: "Medicine Guides", match: "Medicine Guides" },
  { id: "disease-awareness", label: "Disease Awareness", match: "Disease Awareness" },
  { id: "lifestyle", label: "Lifestyle", match: "Lifestyle" },
  { id: "nutrition", label: "Nutrition", match: "Nutrition" },
];

const TOPICS = [
  "All Topics",
  "Cancer Care",
  "HIV Care",
  "Hepatitis",
  "Diabetic Care",
  "Arthritis",
  "Anticoagulants",
  "Transplant Care",
  "Anemia Care",
  "Equipment",
  "Wellness",
];

const HealthLibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter State
  const activeCategory = searchParams.get("category") || "all";
  const activeTopic = searchParams.get("topic") || "All Topics";
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Data states
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState(FALLBACK_FEATURED);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Hero carousel active slide
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const carouselTimerRef = useRef(null);

  // Fetch featured articles once
  useEffect(() => {
    let isMounted = true;
    const loadFeatured = async () => {
      try {
        const feat = await api.getFeaturedArticles();
        if (isMounted && feat && feat.length > 0) {
          setFeaturedArticles(feat);
        }
      } catch (err) {
        console.warn("Using fallback featured articles", err);
      }
    };
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch articles based on query filters
  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const selectedCatObj = CATEGORIES.find((c) => c.id === activeCategory);
        const categoryParam = selectedCatObj && selectedCatObj.id !== "all" ? selectedCatObj.match : "";
        const topicParam = activeTopic !== "All Topics" ? activeTopic : "";

        const res = await api.getArticles({
          category: categoryParam,
          topic: topicParam,
          search: searchQuery,
          sort: "newest",
          page: 1,
          limit: 100, // Load rich pool for interactive filtering
        });

        if (isMounted) {
          setArticles(res.articles || []);
          setTotalCount(res.total || (res.articles ? res.articles.length : 0));
        }
      } catch (err) {
        console.error("Failed to load articles", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, [activeCategory, activeTopic, searchQuery]);

  // Carousel auto-advance
  useEffect(() => {
    if (isHoveringCarousel || featuredArticles.length === 0) return;
    carouselTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);

    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [isHoveringCarousel, featuredArticles.length]);

  // Category filter click handler
  const handleCategoryChange = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    setSearchParams(params);
    setCurrentPage(1);
  };

  // Topic filter click handler
  const handleTopicChange = (top) => {
    const params = new URLSearchParams(searchParams);
    if (top === "All Topics") {
      params.delete("topic");
    } else {
      params.set("topic", top);
    }
    setSearchParams(params);
    setCurrentPage(1);
  };

  // Search input handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const params = new URLSearchParams(searchParams);
    if (val.trim()) {
      params.set("search", val);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
    setCurrentPage(1);
  };

  // Filtered & Paginated Articles
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return articles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [articles, currentPage]);

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE) || 1;

  // Icon selector based on category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Medicine Guides":
        return <Pill className="w-9 h-9 text-[#F3EEE0] opacity-85" />;
      case "Health Guides":
        return <Stethoscope className="w-9 h-9 text-[#F3EEE0] opacity-85" />;
      case "Disease Awareness":
        return <HeartPulse className="w-9 h-9 text-[#F3EEE0] opacity-85" />;
      case "Lifestyle":
        return <Activity className="w-9 h-9 text-[#F3EEE0] opacity-85" />;
      case "Nutrition":
        return <Apple className="w-9 h-9 text-[#F3EEE0] opacity-85" />;
      default:
        return <BookOpen className="w-9 h-9 text-[#F3EEE0] opacity-85" />;
    }
  };

  // Date formatter for article cards
  const formatArticleDate = (dateStr) => {
    if (!dateStr) return "05/09/2026";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "05/09/2026";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "05/09/2026";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1411] text-[#172B26] dark:text-zinc-100 font-sans transition-colors duration-300">
      {/* 1. HERO FEATURED CAROUSEL */}
      {featuredArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
          <div
            className="relative h-[290px] sm:h-[340px] md:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-[#0F3B34]/20"
            onMouseEnter={() => setIsHoveringCarousel(true)}
            onMouseLeave={() => setIsHoveringCarousel(false)}
          >
            {featuredArticles.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={slide._id || idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-end p-6 sm:p-10 bg-gradient-to-br ${
                    slide.gradientClass || "from-[#0F3B34] to-[#157A6D]"
                  } ${isActive ? "opacity-100 pointer-events-auto z-10" : "opacity-0 pointer-events-none z-0"}`}
                >
                  {/* FEATURED Badge */}
                  <span className="absolute top-5 right-5 sm:top-6 sm:right-6 bg-[#B08D3E] text-[#0F3B34] text-[10px] sm:text-xs font-extrabold tracking-wider px-3.5 py-1.5 rounded-lg uppercase shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    FEATURED
                  </span>

                  <div className="max-w-2xl relative z-20">
                    <span className="inline-block bg-[#F3EEE0]/20 text-[#F3EEE0] backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full mb-3 border border-white/10">
                      {slide.category || "Health Guide"} • {slide.topic || "Specialty"}
                    </span>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#F3EEE0] leading-tight mb-4 drop-shadow-sm line-clamp-2">
                      {slide.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-[#F3EEE0]/90">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F3EEE0] text-[#0F3B34] font-bold flex items-center justify-center text-xs shadow-inner">
                          {slide.author?.avatar || "W"}
                        </div>
                        <span>{slide.author?.name || "Wellmeds Health Team"}</span>
                      </div>

                      {slide.reviewer?.name && (
                        <>
                          <span className="text-[#F3EEE0]/40">•</span>
                          <span className="text-[#F3EEE0]/80">
                            Reviewed by {slide.reviewer.name}, {slide.reviewer.qualifications}
                          </span>
                        </>
                      )}

                      <span className="text-[#F3EEE0]/40">•</span>
                      <span className="text-[#B08D3E] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {slide.readTime || "5 min read"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/health-library/${slide.slug}`}
                    className="absolute inset-0 z-30"
                    aria-label={slide.title}
                  />
                </div>
              );
            })}
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {featuredArticles.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dotIdx === currentSlide
                    ? "w-7 bg-[#0F3B34] dark:bg-emerald-400"
                    : "w-2 bg-slate-200 dark:bg-zinc-700 hover:bg-[#157A6D]"
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. STICKY FILTERS & SEARCH CONTROLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        
        {/* Category Pills Row */}
        <div className="flex flex-wrap gap-2.5 justify-center">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#0F3B34] dark:bg-emerald-600 border-[#0F3B34] dark:border-emerald-600 text-[#F3EEE0] shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-[#172B26] dark:text-zinc-200 hover:border-[#157A6D] dark:hover:border-emerald-500 shadow-2xs"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Topics Row */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-200/90 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {TOPICS.map((top) => {
            const isActive = activeTopic === top;
            return (
              <button
                key={top}
                onClick={() => handleTopicChange(top)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#157A6D] dark:bg-teal-600 border-[#157A6D] dark:border-teal-600 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-[#157A6D] shadow-2xs"
                }`}
              >
                {top}
              </button>
            );
          })}
        </div>

        {/* Heading + Search & Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-8 pt-4 border-t border-slate-200/90 dark:border-zinc-800">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F3B34] dark:text-emerald-400">
              Articles For You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Showing {articles.length} verified clinical articles
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Search input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#157A6D] dark:text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search articles by name..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[#172B26] dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-[#157A6D] dark:focus:border-emerald-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    const params = new URLSearchParams(searchParams);
                    params.delete("search");
                    setSearchParams(params);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ARTICLES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-xs text-slate-500 mt-4">Loading curated articles...</p>
          </div>
        ) : paginatedArticles.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900/30 rounded-3xl border border-slate-200 dark:border-zinc-800 p-8 my-6">
            <BookOpen className="w-12 h-12 text-[#157A6D] dark:text-emerald-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold text-[#0F3B34] dark:text-emerald-400 mb-1">
              No articles found
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
              We could not find any clinical articles matching your current search or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchParams({});
                setCurrentPage(1);
              }}
              className="px-5 py-2 text-xs font-bold bg-[#0F3B34] hover:bg-[#157A6D] text-white rounded-xl transition-colors shadow"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 sm:gap-8 lg:gap-[30px]">
            {paginatedArticles.map((article) => {
              const heroImg = article.heroImage || article.coverImage;
              const authorName = article.author?.name || (article.reviewer?.name ? `Dr. ${article.reviewer.name}` : "Wellmeds Health Team");
              const authorAvatar = article.author?.avatar;
              const dateFormatted = formatArticleDate(article.publishedAt || article.createdAt);
              const badgeText = article.categoryBadge || (article.topic && article.topic !== "All Topics" && article.topic !== "General" ? article.topic : (article.category || "Health Guide"));

              return (
                <Link
                  key={article._id || article.slug}
                  to={`/health-library/${article.slug}`}
                  className="group flex flex-col bg-transparent cursor-pointer text-inherit no-underline transition-all duration-300"
                >
                  {/* Card Image / Banner Frame */}
                  <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[#157A6D]/20 dark:border-zinc-700/80 bg-slate-100 dark:bg-zinc-800 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-[#157A6D]">
                    {heroImg ? (
                      <img
                        src={heroImg}
                        alt={article.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0F3B34] via-[#157A6D] to-[#0A2621] relative flex items-center justify-center p-4">
                        <div className="opacity-80 group-hover:scale-110 transition-transform duration-300">
                          {getCategoryIcon(article.category)}
                        </div>
                      </div>
                    )}

                    {/* Top-Left Category/Topic Pill */}
                    <span className="absolute top-2.5 left-2.5 bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full z-10 border border-white/10 shadow-sm">
                      {badgeText}
                    </span>

                    {/* Top-Right Verified Medical Icon */}
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm border border-slate-100 dark:border-zinc-700 flex items-center justify-center text-[#157A6D] dark:text-emerald-400 z-10">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="pt-3 pb-1 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h3 className="text-[13.5px] sm:text-[14px] font-bold text-slate-900 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-[#157A6D] dark:group-hover:text-emerald-400 transition-colors">
                        {article.title}
                      </h3>

                      <p className="text-[11.5px] sm:text-[12px] text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mt-1.5 font-normal">
                        {article.excerpt || "Comprehensive medical guide detailing symptoms, clinical causes, preventive steps, and personalized health strategies."}
                      </p>
                    </div>

                    {/* Footer: Author & Read Time */}
                    <div className="flex items-center justify-between pt-2.5 mt-auto border-t border-slate-100 dark:border-zinc-800/80">
                      {/* Left: Author Avatar + Name + Date */}
                      <div className="flex items-center gap-2 min-w-0">
                        {authorAvatar && (authorAvatar.startsWith("http") || authorAvatar.startsWith("/") || authorAvatar.startsWith("data:")) ? (
                          <img
                            src={authorAvatar}
                            alt={authorName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-zinc-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#157A6D]/10 dark:bg-emerald-950/50 text-[#157A6D] dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0 border border-[#157A6D]/20">
                            {authorName.charAt(0) || "D"}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[110px] sm:max-w-[130px] leading-tight">
                            {authorName}
                          </span>
                          <span className="text-[9.5px] text-slate-400 dark:text-zinc-500 leading-tight">
                            {dateFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Right: Read Time */}
                      <div className="flex items-center gap-1 text-[10.5px] font-medium text-slate-500 dark:text-zinc-400 shrink-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{article.readTime || "5 Min Read"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 5. PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-10 pb-16">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#157A6D] flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? "bg-[#0F3B34] dark:bg-emerald-600 text-[#F3EEE0] border border-[#0F3B34]"
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:border-[#157A6D]"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#157A6D] flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HealthLibraryPage;
