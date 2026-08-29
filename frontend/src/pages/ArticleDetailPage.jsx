import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import SEO from "../components/common/SEO";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Share2,
  Bookmark,
  Check,
  BookOpen,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Award,
  ListOrdered,
  Info,
} from "lucide-react";
import { ARTICLE_CATEGORIES } from "../admin/AdminArticles";

// Sample Curated Health Experts matching the design reference
const HEALTH_EXPERTS = [
  {
    id: 1,
    name: "Dr. Nikhil Ambatkar",
    qualification: "PhD (Biotechnology)",
    experience: "8 years",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 2,
    name: "Dr. Sachin Singh",
    qualification: "MBBS",
    experience: "7 years",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 3,
    name: "Dr. Mandeep Chadha",
    qualification: "MBBS, DNB (OBGY)",
    experience: "12 years",
    avatar: "https://images.unsplash.com/photo-1594824813501-4837e15e4c55?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 4,
    name: "Amatul Ameen",
    qualification: "B. Pharm, MSc.",
    experience: "14 years",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 5,
    name: "Amit Sharma",
    qualification: "B. Pharm",
    experience: "5 years",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200",
  },
];

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Active TOC Section
  const [activeSectionId, setActiveSectionId] = useState("");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  // Open FAQ items
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // References Show More
  const [showAllReferences, setShowAllReferences] = useState(false);

  // Fetch article
  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await api.getArticleBySlug(slug, isPreview);
        if (isMounted && data.article) {
          setArticle(data.article);
          setRelatedArticles(data.related || []);
          if (data.article.tableOfContents?.length > 0) {
            setActiveSectionId(data.article.tableOfContents[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load article detail", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      isMounted = false;
    };
  }, [slug, isPreview]);

  // ScrollSpy for TOC Active State
  useEffect(() => {
    if (!article) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    const registeredElements = [];
    const tocIds = (article.tableOfContents || []).map((t) => t.id);

    // Also observe faqs and references
    [...tocIds, "faqs", "references", "conclusion"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        registeredElements.push(el);
      }
    });

    return () => {
      registeredElements.forEach((el) => observer.unobserve(el));
    };
  }, [article]);

  const handleScrollToSection = (sectionId) => {
    setActiveSectionId(sectionId);
    setMobileTocOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#F5F6FA] dark:bg-zinc-950">
        <Loader />
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-4">Loading health guide...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-[#F5F6FA] dark:bg-zinc-950">
        <BookOpen className="w-16 h-16 text-[#157A6D] dark:text-emerald-400 mb-4 opacity-75" />
        <h2 className="text-2xl font-bold text-[#0F3B34] dark:text-emerald-300 mb-2">
          Article Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mb-6">
          The requested health article could not be found or has been moved.
        </p>
        <Link
          to="/health-library"
          className="px-6 py-2.5 bg-[#0F3B34] hover:bg-[#157A6D] text-white font-bold text-xs rounded-full transition-all shadow"
        >
          Back to Health Library
        </Link>
      </div>
    );
  }

  const publishedDateFormatted = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently Published";

  const publishedTimeFormatted = article.publishedAt
    ? new Date(article.publishedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const updatedDateFormatted = article.lastUpdatedDate || article.updatedAt
    ? new Date(article.lastUpdatedDate || article.updatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const updatedTimeFormatted = article.lastUpdatedDate || article.updatedAt
    ? new Date(article.lastUpdatedDate || article.updatedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const displayedReferences = showAllReferences
    ? article.references || []
    : (article.references || []).slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-[#172B26] dark:text-zinc-100 font-sans transition-colors duration-300 pb-20">
      <SEO
        title={article.seo?.metaTitle || `${article.title} | WellMeds Health Library`}
        description={article.seo?.metaDescription || article.excerpt || article.title}
        image={article.seo?.ogImage || article.heroImage || article.coverImage}
        canonical={article.seo?.canonicalUrl}
        noindex={article.status === "draft" || article.seo?.noIndex}
      />

      {/* ── PREVIEW BANNER IF PREVIEWING DRAFT ── */}
      {isPreview && (
        <div className="bg-amber-500 text-white text-xs font-bold text-center py-2 px-4 sticky top-0 z-40 shadow-sm flex items-center justify-center gap-2">
          <AlertCircle size={15} />
          <span>Admin Preview Mode — This draft article is not yet published publicly.</span>
        </div>
      )}

      {/* ── BREADCRUMBS ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <Link to="/" className="hover:text-[#157A6D] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/health-library" className="hover:text-[#157A6D] transition-colors">
            Health Library
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            to={`/health-library?category=${encodeURIComponent(article.category || "")}`}
            className="text-[#157A6D] dark:text-emerald-400 font-bold hover:underline"
          >
            {article.category || "Article"}
          </Link>
        </div>
      </div>

      {/* ── TOP HERO & CATEGORY SIDEBAR SECTION ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-2 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Hero Header (Left 8.5 Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Hero Image Container */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F3B34] via-[#157A6D] to-[#0A2621] aspect-[16/9] sm:aspect-[16/8.5] shadow-sm border border-slate-100 dark:border-zinc-800 flex items-center justify-center">
              {article.heroImage || article.coverImage ? (
                <img
                  src={article.heroImage || article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-8 text-center text-white space-y-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md mb-2">
                    {article.categoryBadge || article.category}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#F3EEE0]">
                    {article.title}
                  </h2>
                </div>
              )}

              {/* Badge Pill on top-left of image */}
              {(article.categoryBadge || article.category) && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#0F3B34]/90 backdrop-blur-md text-[#F3EEE0] text-[11px] font-extrabold px-3.5 py-1.5 rounded-full border border-white/15 shadow-sm">
                    {article.categoryBadge || article.category}
                  </span>
                </div>
              )}
            </div>

            {/* Article Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0F3B34] dark:text-zinc-50 leading-[1.25] tracking-tight">
              {article.title}
            </h1>

            {/* Author & Reviewer Info */}
            <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400 font-medium">
              {article.author?.name && (
                <p>
                  Written by{" "}
                  <span className="font-bold text-[#0F3B34] dark:text-zinc-200">
                    {article.author.name}
                  </span>
                  {article.author.credentials && `, ${article.author.credentials}`}
                </p>
              )}
              {article.reviewer?.name && (
                <p>
                  Reviewed by{" "}
                  <span className="font-bold text-[#0F3B34] dark:text-zinc-200">
                    {article.reviewer.name}
                  </span>
                  {article.reviewer.qualifications && `, ${article.reviewer.qualifications}`}
                </p>
              )}
            </div>

            {/* Published Dates & Read Time Strip */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 border-t border-b border-slate-100 dark:border-zinc-800 py-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                {article.publishedAt && (
                  <div>
                    <span className="font-normal">Published on: </span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                      {publishedDateFormatted} {publishedTimeFormatted ? `| ${publishedTimeFormatted} (IST)` : ""}
                    </span>
                  </div>
                )}
                {updatedDateFormatted && (
                  <div>
                    <span className="font-normal">Last updated on: </span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                      {updatedDateFormatted} {updatedTimeFormatted ? `| ${updatedTimeFormatted} (IST)` : ""}
                    </span>
                  </div>
                )}
              </div>

              {article.readTime && (
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
                  <Clock size={14} className="text-[#157A6D]" />
                  <span>Read time: {article.readTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Top Right "Select Category" Card (Desktop Right 4 Cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0F3B34] dark:text-zinc-100 px-1">
              Select Category
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              {ARTICLE_CATEGORIES.slice(0, 11).map((cat) => {
                const isSelected = article.category?.toLowerCase() === cat.toLowerCase();
                return (
                  <Link
                    key={cat}
                    to={`/health-library?category=${encodeURIComponent(cat)}`}
                    className={`flex items-center justify-between py-2.5 px-2 rounded-xl transition ${
                      isSelected
                        ? "bg-[#157A6D]/10 text-[#157A6D] dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
                    }`}
                  >
                    <span>{cat}</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE TABLE OF CONTENTS COLLAPSIBLE ── */}
      {article.tableOfContents?.length > 0 && (
        <div className="lg:hidden max-w-[1200px] mx-auto px-4 sm:px-6 mb-6">
          <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="w-full flex items-center justify-between p-4 text-xs font-bold text-[#0F3B34] dark:text-zinc-100"
            >
              <div className="flex items-center gap-2">
                <ListOrdered size={16} className="text-[#157A6D]" />
                <span>Table of Contents ({article.tableOfContents.length} items)</span>
              </div>
              {mobileTocOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {mobileTocOpen && (
              <div className="p-4 pt-0 space-y-1.5 border-t border-slate-200 dark:border-zinc-800">
                {article.tableOfContents.map((item) => {
                  const isActive = activeSectionId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleScrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition ${
                        isActive
                          ? "bg-[#157A6D] text-white font-bold"
                          : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN ARTICLE CONTENT & DESKTOP TOC GRID ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: STICKY TABLE OF CONTENTS ── */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
            <div className="bg-slate-50/80 dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider mb-3 px-2">
                Table of Contents
              </h3>
              <nav className="space-y-1 text-xs">
                {(article.tableOfContents || []).map((item) => {
                  const isActive = activeSectionId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleScrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition duration-150 cursor-pointer ${
                        isActive
                          ? "bg-[#0066FF] text-white font-bold shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60 font-medium leading-snug"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}

                {/* Direct link to FAQs if present and not in TOC */}
                {article.faqs?.length > 0 && !(article.tableOfContents || []).some((t) => t.id === "faqs") && (
                  <button
                    type="button"
                    onClick={() => handleScrollToSection("faqs")}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition duration-150 cursor-pointer ${
                      activeSectionId === "faqs"
                        ? "bg-[#0066FF] text-white font-bold shadow-xs"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60 font-medium leading-snug"
                    }`}
                  >
                    FAQs
                  </button>
                )}
              </nav>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: ARTICLE BODY CONTENT ── */}
          <main className="lg:col-span-9 space-y-8 text-slate-800 dark:text-zinc-200 leading-relaxed text-[15px]">
            
            {/* Excerpt / Lead paragraph */}
            {article.excerpt && (
              <p className="text-base text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Render Sections */}
            {(article.sections || []).map((sec, idx) => (
              <section key={sec.id || idx} id={sec.id} className="scroll-mt-24 space-y-4">
                {sec.heading && (
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F3B34] dark:text-zinc-100 tracking-tight pt-2">
                    {sec.heading}
                  </h2>
                )}

                {/* Paragraphs */}
                {(sec.paragraphs || []).map((p, pIdx) => (
                  <p key={pIdx} className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* Bullet list */}
                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className="space-y-2 pl-5 list-disc text-slate-700 dark:text-zinc-300 marker:text-[#157A6D]">
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Numbered list */}
                {sec.numbered && sec.numbered.length > 0 && (
                  <ol className="space-y-2 pl-5 list-decimal text-slate-700 dark:text-zinc-300 marker:font-bold marker:text-[#157A6D]">
                    {sec.numbered.map((num, nIdx) => (
                      <li key={nIdx} className="leading-relaxed">
                        {num}
                      </li>
                    ))}
                  </ol>
                )}

                {/* Structured Comparison Table */}
                {sec.table && sec.table.headers && sec.table.headers.length > 0 && (
                  <div className="my-6 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-zinc-800/80 text-[#0F3B34] dark:text-zinc-100 font-bold border-b border-slate-200 dark:border-zinc-700">
                            {sec.table.headers.map((hdr, hIdx) => (
                              <th key={hIdx} className="p-3.5 sm:p-4 text-center sm:text-left">
                                {hdr}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/40 transition-colors"
                            >
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className="p-3.5 sm:p-4 text-slate-700 dark:text-zinc-300 align-top text-xs sm:text-sm leading-relaxed"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Callout Notice */}
                {sec.callout && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium italic flex items-start gap-2.5">
                    <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>{sec.callout}</span>
                  </div>
                )}

                {/* Inline Section Images */}
                {sec.images && sec.images.length > 0 && (
                  <div className="my-5 space-y-4">
                    {sec.images.map((imgItem, iIdx) => (
                      <figure key={iIdx} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 shadow-2xs">
                        <img src={imgItem.url} alt={imgItem.alt || imgItem.caption || sec.heading} className="w-full max-h-[420px] object-cover" />
                        {imgItem.caption && (
                          <figcaption className="p-2.5 text-center text-xs text-slate-500 dark:text-zinc-400 italic bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800">
                            {imgItem.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}

                {/* ── OPTIONAL SECONDARY / MID-CONTENT ARTICLE IMAGE (Rendered in Middle of Article) ── */}
                {article.secondaryImage && idx === Math.min(1, (article.sections || []).length - 1) && (
                  <figure className="my-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-850 shadow-sm">
                    <img
                      src={article.secondaryImage}
                      alt={article.secondaryImageCaption || article.title}
                      className="w-full max-h-[440px] object-cover"
                    />
                    {article.secondaryImageCaption && (
                      <figcaption className="p-3.5 text-center text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300 italic font-medium bg-slate-50/90 dark:bg-zinc-900 border-t border-slate-200/80 dark:border-zinc-800">
                        {article.secondaryImageCaption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </section>
            ))}

            {/* ── FAQ ACCORDION SECTION ── */}
            {article.faqs && article.faqs.length > 0 && (
              <section id="faqs" className="scroll-mt-24 pt-6 space-y-4">
                <h2 className="text-2xl font-bold text-[#0F3B34] dark:text-zinc-100 tracking-tight">
                  FAQs
                </h2>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800 border-t border-b border-slate-100 dark:border-zinc-800">
                  {article.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div key={idx} className="py-4">
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                          className="w-full text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-[15px] text-[#0F3B34] dark:text-zinc-100 hover:text-[#157A6D] transition cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <span className="shrink-0 text-slate-400">
                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed animate-[fade-in_0.2s_ease-out]">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── MEDICAL DISCLAIMER ── */}
            <section className="pt-4">
              <div className="p-5 rounded-2xl bg-[#F3EEE0]/50 dark:bg-zinc-900/60 border border-[#E4DFCF] dark:border-zinc-800 text-xs sm:text-[13px] text-slate-600 dark:text-zinc-400 space-y-2">
                <h4 className="font-bold text-[#0F3B34] dark:text-zinc-200">
                  Medical Disclaimer
                </h4>
                <p className="italic leading-relaxed">
                  {article.disclaimer ||
                    "This article is for informational purposes only and does not constitute medical advice. The information provided should not be used for diagnosing or treating health conditions. Always consult a qualified healthcare provider for diagnosis, treatment, and personalised medical advice. Do not disregard professional medical advice or delay seeking it because of information found in this article. If you have a medical emergency, contact your doctor or emergency services immediately."}
                </p>
              </div>
            </section>

            {/* ── REFERENCES SECTION ── */}
            {article.references && article.references.length > 0 && (
              <section id="references" className="scroll-mt-24 pt-4 space-y-4">
                <h3 className="text-base font-bold text-[#0F3B34] dark:text-zinc-100">
                  References
                </h3>

                <ol className="space-y-3 text-xs text-slate-600 dark:text-zinc-400 list-decimal pl-4">
                  {displayedReferences.map((ref, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span>{ref.title}</span>{" "}
                      {ref.source && <span className="font-semibold">{ref.source}.</span>}{" "}
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0066FF] hover:underline break-all inline-flex items-center gap-1"
                        >
                          <span>{ref.url}</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </li>
                  ))}
                </ol>

                {article.references.length > 4 && (
                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAllReferences(!showAllReferences)}
                      className="text-xs font-bold text-[#0066FF] hover:underline cursor-pointer"
                    >
                      {showAllReferences ? "Show less" : "Show more"}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ── SHARE & ACTIONS ── */}
            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Share this medical guide:
              </span>
              <button
                type="button"
                onClick={handleShareCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 transition shadow-2xs"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                <span>{copied ? "Link Copied!" : "Copy Article Link"}</span>
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* ── MEET OUR HEALTH EXPERTS SECTION ── */}
      <section className="mt-16 pt-12 border-t border-slate-100 dark:border-zinc-800 bg-[#F7F9FB] dark:bg-zinc-950/60 py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0F3B34] dark:text-zinc-100 tracking-tight">
              Meet Our Health Experts
            </h3>
            <Link
              to="/about"
              className="text-xs font-bold text-[#0066FF] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {HEALTH_EXPERTS.map((expert) => (
              <div
                key={expert.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 text-center flex flex-col items-center space-y-2 shadow-2xs hover:shadow-xs transition"
              >
                <img
                  src={expert.avatar}
                  alt={expert.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#157A6D]/20 mb-1"
                />
                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                  {expert.name}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium line-clamp-1">
                  {expert.qualification}
                </p>
                <span className="text-[10px] font-bold text-[#157A6D] dark:text-emerald-400">
                  {expert.experience}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400 text-center pt-2">
            Check our{" "}
            <Link to="/about" className="text-[#0066FF] font-semibold hover:underline">
              Editorial policy
            </Link>
          </p>

          {/* Social Follow */}
          <div className="pt-4 flex flex-col items-center gap-3">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
              Follow us on
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center hover:opacity-90 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:opacity-90 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetailPage;
