import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import { api } from "../services/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  X,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  ShieldCheck,
  Clock,
  FileText,
  Layers,
} from "lucide-react";

const CATEGORIES_LIST = [
  "Health Guides",
  "Medicine Guides",
  "Disease Awareness",
  "Lifestyle",
  "Nutrition",
  "General Wellness",
];

const COMMON_TOPICS = [
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
  "General",
];

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 15;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Health Guides");
  const [topic, setTopic] = useState("General");
  const [readTime, setReadTime] = useState("5 min read");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("Wellmeds Health Team");
  const [authorTitle, setAuthorTitle] = useState("Clinical Editorial Team");
  const [reviewerName, setReviewerName] = useState("Payal Choudhary");
  const [reviewerQualifications, setReviewerQualifications] = useState("D.Pharm");
  const [isFeatured, setIsFeatured] = useState(false);
  const [active, setActive] = useState(true);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch articles for Admin CMS
  const fetchArticles = async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await api.adminGetArticles({
        search: searchQuery,
        category: selectedCategory !== "all" ? selectedCategory : "",
        topic: selectedTopic !== "all" ? selectedTopic : "",
        status: selectedStatus !== "all" ? selectedStatus : "",
        page,
        limit: ITEMS_PER_PAGE,
      });

      setArticles(data.articles || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error("Failed to load admin articles", err);
      showToast("Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTopic, selectedStatus]);

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage, searchQuery, selectedCategory, selectedTopic, selectedStatus]);

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle("");
    setSlug("");
    setCategory("Health Guides");
    setTopic("General");
    setReadTime("5 min read");
    setExcerpt("");
    setContent("");
    setAuthorName("Wellmeds Health Team");
    setAuthorTitle("Clinical Editorial Team");
    setReviewerName("Payal Choudhary");
    setReviewerQualifications("D.Pharm");
    setIsFeatured(false);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (art) => {
    setEditingArticle(art);
    setTitle(art.title || "");
    setSlug(art.slug || "");
    setCategory(art.category || "Health Guides");
    setTopic(art.topic || "General");
    setReadTime(art.readTime || "5 min read");
    setExcerpt(art.excerpt || "");
    setContent(art.content || "");
    setAuthorName(art.author?.name || "Wellmeds Health Team");
    setAuthorTitle(art.author?.title || "Clinical Editorial Team");
    setReviewerName(art.reviewer?.name || "Payal Choudhary");
    setReviewerQualifications(art.reviewer?.qualifications || "D.Pharm");
    setIsFeatured(art.isFeatured || false);
    setActive(art.active !== false);
    setIsModalOpen(true);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Article title is required", "error");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title,
        slug: slug.trim() || undefined,
        category,
        topic,
        readTime,
        excerpt,
        content,
        author: {
          name: authorName,
          title: authorTitle,
          avatar: authorName ? authorName.charAt(0).toUpperCase() : "W",
        },
        reviewer: {
          name: reviewerName,
          qualifications: reviewerQualifications,
          avatarText: reviewerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "MD",
        },
        isFeatured,
        active,
      };

      if (editingArticle) {
        await api.updateArticle(editingArticle._id, payload);
        showToast("Article updated successfully!");
      } else {
        await api.createArticle(payload);
        showToast("New article published successfully!");
      }

      setIsModalOpen(false);
      fetchArticles(currentPage);
    } catch (err) {
      console.error("Save article failed", err);
      showToast(err.message || "Failed to save article", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      await api.deleteArticle(deleteConfirmId);
      showToast("Article deleted successfully");
      setDeleteConfirmId(null);
      fetchArticles(currentPage);
    } catch (err) {
      console.error("Delete article failed", err);
      showToast("Failed to delete article", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-2 ${
            toastMessage.type === "error" ? "bg-red-600" : "bg-[#0F3B34]"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#038076] dark:text-[#84d6b9]" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Health Library Articles CMS
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage, publish, edit, and categorize clinical guides and medical articles ({totalCount} total)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#038076] hover:bg-[#02665e] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Article</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, topic, reviewer..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-[#038076]"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#038076]"
          >
            <option value="all">All Categories</option>
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Filter */}
        <div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#038076]"
          >
            <option value="all">All Topics</option>
            {COMMON_TOPICS.map((top) => (
              <option key={top} value={top}>
                {top}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-[#038076]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active / Published</option>
            <option value="inactive">Inactive / Draft</option>
            <option value="featured">Featured in Carousel</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-xs text-slate-500 mt-3">Loading articles database...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-zinc-400">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm font-semibold">No articles found matching filters</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedTopic("all");
                setSelectedStatus("all");
              }}
              className="mt-3 text-xs text-[#038076] font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category / Topic</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Featured</th>
                  <th className="py-3.5 px-4 text-center">Views</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                {articles.map((art) => (
                  <tr
                    key={art._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Title & Slug */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono truncate">
                        /health-library/{art.slug}
                      </div>
                    </td>

                    {/* Category & Topic */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block bg-[#038076]/10 text-[#038076] dark:text-[#84d6b9] font-bold text-[10px] px-2 py-0.5 rounded-full mr-1.5">
                        {art.category}
                      </span>
                      {art.topic && art.topic !== "General" && (
                        <span className="inline-block bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          {art.topic}
                        </span>
                      )}
                    </td>

                    {/* Reviewer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {art.reviewer?.name ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#038076]" />
                          <span>
                            {art.reviewer.name}
                            {art.reviewer.qualifications ? ` (${art.reviewer.qualifications})` : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          art.active !== false
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                            : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700"
                        }`}
                      >
                        {art.active !== false ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Featured */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {art.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-[#B08D3E]/15 text-[#B08D3E] dark:text-amber-400 px-2 py-0.5 rounded-md">
                          <Sparkles className="w-3 h-3" />
                          Hero
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 text-center text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                      {art.views || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/health-library/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#038076] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                          title="View Live Article"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => openEditModal(art)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-[#038076] hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(art._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/20 text-xs">
            <span className="text-slate-500 dark:text-zinc-400">
              Page {currentPage} of {totalPages} ({totalCount} articles)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5 inline" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT ARTICLE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? "Edit Clinical Article" : "Publish New Clinical Article"}
      >
        <form onSubmit={handleSaveArticle} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Understanding Blood Thinners & Monitoring"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#038076]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Custom URL Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title if blank"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[#038076]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-[#038076]"
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Topic / Therapeutic Area
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Cancer Care, Diabetic Care, Arthritis"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Short Summary / Excerpt
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief overview displayed on article cards and search results..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#038076]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Full Article Content (Markdown / Text)
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed article body with clinical takeaways, dosage advice, warnings, etc..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[#038076]"
            />
          </div>

          {/* Clinical Reviewer & Author Inputs */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#038076]" />
              Clinical Reviewer & Author Attribution
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-0.5">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Payal Choudhary"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-0.5">
                  Reviewer Qualifications
                </label>
                <input
                  type="text"
                  value={reviewerQualifications}
                  onChange={(e) => setReviewerQualifications(e.target.value)}
                  placeholder="e.g. D.Pharm / MBBS"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Flags / Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#038076] focus:ring-[#038076]"
              />
              <span>Feature in Top Carousel</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#038076] focus:ring-[#038076]"
              />
              <span>Published & Live (Active)</span>
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#038076] hover:bg-[#02665e] text-white shadow transition-all disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : editingArticle ? "Update Article" : "Publish Article"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Delete Article"
      >
        <div className="space-y-4 text-xs text-slate-700 dark:text-zinc-300">
          <p>
            Are you sure you want to permanently delete this article? This action cannot be undone and will remove it from the Health Library.
          </p>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteArticle}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow"
            >
              {actionLoading ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminArticles;
