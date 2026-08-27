import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Award,
  CheckCircle2,
  Share2,
  Bookmark,
  Check,
  ChevronRight,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

const ArticleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const data = await api.getArticleBySlug(slug);
        if (isMounted && data.article) {
          setArticle(data.article);
          setRelatedArticles(data.related || []);
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
  }, [slug]);

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Read this health guide from Wellmeds: ${article?.title} - ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-[#0b1411]">
        <Loader />
        <p className="text-xs text-slate-500 mt-4">Loading clinical article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-[#0b1411]">
        <BookOpen className="w-16 h-16 text-[#157A6D] dark:text-emerald-400 mb-4 opacity-75" />
        <h2 className="text-2xl font-bold text-[#0F3B34] dark:text-emerald-300 mb-2">
          Article Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mb-6">
          The requested health article could not be found or has been moved.
        </p>
        <Link
          to="/health-library"
          className="px-6 py-2.5 bg-[#0F3B34] hover:bg-[#157A6D] text-white font-bold text-xs rounded-xl transition-all shadow"
        >
          Back to Health Library
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1411] text-[#172B26] dark:text-zinc-100 font-sans transition-colors duration-300 pb-20">
      
      {/* 1. BREADCRUMBS */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <Link to="/" className="hover:text-[#157A6D] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/health-library" className="hover:text-[#157A6D] transition-colors">
            Health Library
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#157A6D] dark:text-emerald-400 font-bold truncate max-w-xs">
            {article.category || "Article"}
          </span>
        </div>
      </div>

      {/* 2. ARTICLE HEADER & META */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-6">
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="bg-[#F3EEE0] dark:bg-emerald-950/60 text-[#0F3B34] dark:text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-[#E4DFCF] dark:border-emerald-800/40">
            {article.category}
          </span>
          {article.topic && article.topic !== "General" && (
            <span className="bg-[#157A6D]/10 dark:bg-teal-950/50 text-[#157A6D] dark:text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-[#157A6D]/20">
              {article.topic}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F3B34] dark:text-emerald-300 leading-tight mb-4 tracking-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 font-normal leading-relaxed mb-6 border-l-4 border-[#157A6D] pl-4 italic">
            {article.excerpt}
          </p>
        )}

        {/* Byline & Reviewer Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F3EEE0]/40 dark:bg-zinc-900/60 border border-[#E4DFCF] dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0F3B34] text-[#F3EEE0] font-extrabold flex items-center justify-center text-xs shadow-sm">
                {article.author?.avatar || "W"}
              </div>
              <div>
                <p className="font-bold text-[#0F3B34] dark:text-emerald-300">
                  {article.author?.name || "Wellmeds Health Team"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {article.author?.title || "Clinical Editorial Team"}
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700 hidden sm:block" />

            <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#157A6D]" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#157A6D]" />
                {article.readTime || "5 min read"}
              </span>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareCopy}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-[#E4DFCF] dark:border-zinc-700 hover:border-[#157A6D] text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#157A6D]" />}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-emerald-400 border border-[#25D366]/30 transition-colors text-xs font-semibold"
              title="Share on WhatsApp"
            >
              WhatsApp
            </button>
          </div>
        </div>

        {/* Clinical Verification Callout */}
        {article.reviewer?.name && (
          <div className="flex items-center gap-3 bg-[#edf7f2] dark:bg-[#0d221c] border border-[#c6e6d8] dark:border-[#1a4438] rounded-xl p-3.5 mt-4 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#038076] dark:text-[#84d6b9] flex-shrink-0" />
            <p className="text-slate-700 dark:text-zinc-300">
              <strong className="text-[#038076] dark:text-[#84d6b9] font-bold">
                Medically & Clinically Reviewed:
              </strong>{" "}
              This article was verified for pharmaceutical accuracy by{" "}
              <strong className="text-slate-900 dark:text-white">
                {article.reviewer.name}
              </strong>
              {article.reviewer.qualifications ? ` (${article.reviewer.qualifications})` : ""}.
            </p>
          </div>
        )}
      </header>

      {/* 3. MAIN ARTICLE CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <article className="prose prose-emerald max-w-none dark:prose-invert text-slate-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base">
          {/* Quick Key Takeaways Box */}
          <div className="bg-[#F3EEE0]/50 dark:bg-zinc-900/80 border border-[#E4DFCF] dark:border-zinc-800 rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-extrabold text-[#0F3B34] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-[#B08D3E]" />
              Key Clinical Takeaways
            </h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 pl-4 list-disc marker:text-[#157A6D]">
              <li>Understand the specific indications and prescribed schedules for this medication or care routine.</li>
              <li>Always inform your treating physician or pharmacist before combining over-the-counter supplements.</li>
              <li>Seek immediate medical attention if you experience severe adverse reactions or unexplained symptoms.</li>
            </ul>
          </div>

          {/* Render formatted markdown/text content */}
          <div className="space-y-4 whitespace-pre-line font-normal text-slate-700 dark:text-zinc-300">
            {article.content ? (
              article.content
            ) : (
              <p>
                Proper healthcare management begins with trusted, accessible medical information. For full clinical inquiries and medication reconciliation, consult your healthcare provider or reach out directly to the Wellmeds Pharmacist Care Team.
              </p>
            )}
          </div>

          {/* Medical Disclaimer Alert */}
          <div className="mt-10 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Medical Disclaimer:</strong> This clinical article is published for educational and informational purposes only. It does not constitute formal medical diagnosis or individualized prescription advice. Always consult a qualified physician or clinical pharmacist regarding your specific therapeutic needs.
            </div>
          </div>
        </article>

        {/* Back Button */}
        <div className="mt-10 pt-6 border-t border-[#E4DFCF] dark:border-zinc-800 flex justify-between items-center">
          <Link
            to="/health-library"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0F3B34] dark:text-emerald-400 hover:text-[#157A6D] dark:hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Articles
          </Link>
        </div>
      </main>

      {/* 4. RELATED ARTICLES RECOMMENDATIONS */}
      {relatedArticles.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 mt-10 border-t border-[#E4DFCF] dark:border-zinc-800">
          <div className="mb-6">
            <h3 className="text-xl font-black text-[#0F3B34] dark:text-emerald-400">
              Related Clinical Guides
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Explore more articles in {article.topic || article.category}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedArticles.map((rel) => (
              <Link
                key={rel._id || rel.slug}
                to={`/health-library/${rel.slug}`}
                className="group flex flex-col bg-[#F3EEE0]/30 dark:bg-zinc-900 border border-[#E4DFCF] dark:border-zinc-800 rounded-xl p-4 hover:border-[#157A6D] hover:shadow-md transition-all"
              >
                <span className="text-[10px] font-bold text-[#157A6D] dark:text-emerald-400 uppercase tracking-wider mb-1">
                  {rel.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-[#0F3B34] dark:text-emerald-300 group-hover:text-[#157A6D] leading-snug line-clamp-2 mb-2">
                  {rel.title}
                </h4>
                <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 pt-2 border-t border-[#E4DFCF]/60 dark:border-zinc-800/60">
                  <span>{rel.readTime || "5 min read"}</span>
                  <span className="text-[#157A6D] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ArticleDetailPage;
