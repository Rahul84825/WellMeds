import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Globe,
  FileEdit,
  SlidersHorizontal,
  Check,
  AlertTriangle,
} from "lucide-react";

export const ARTICLE_CATEGORIES = [
  "Women's Health",
  "Oral & Dental Health",
  "Fitness & Exercise",
  "Skin & Hair Care",
  "Medication",
  "Men's Health",
  "Nutrition & Diet",
  "General Wellness",
  "Supplements & Vitamins",
  "Lifestyle",
  "Preventive Care",
  "Health Guides",
  "Medicine Guides",
  "Disease Awareness",
];

const AdminArticles = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // Deletion Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchArticles = async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await api.adminGetArticles({
        search: searchQuery,
        category: selectedCategory !== "all" ? selectedCategory : "",
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
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage, searchQuery, selectedCategory, selectedStatus]);

  // Toggle Publish Status
  const handleTogglePublish = async (art) => {
    setActionLoading(true);
    try {
      await api.togglePublishArticle(art._id);
      const isNowPublished = art.status !== "published";
      showToast(
        `Article "${art.title.slice(0, 24)}..." ${isNowPublished ? "published" : "saved as draft"}`
      );
      fetchArticles(currentPage);
    } catch (err) {
      console.error("Failed to update status", err);
      showToast("Failed to update publish status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await api.deleteArticle(deleteTarget._id);
      showToast(`Article "${deleteTarget.title}" deleted successfully`);
      setDeleteTarget(null);
      fetchArticles(currentPage);
    } catch (err) {
      console.error("Failed to delete article", err);
      showToast("Failed to delete article", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-sm font-semibold animate-[fade-in_0.2s_ease-out] ${
            toastMessage.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800"
              : "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800"
          }`}
        >
          {toastMessage.type === "error" ? <X size={18} /> : <CheckCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#157A6D]/10 text-[#157A6D] dark:text-emerald-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3B34] dark:text-zinc-100 tracking-tight">
              Health Articles & CMS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Publish clinical guides, manage Table of Contents, FAQs, and medical references. Total:{" "}
            <span className="font-bold text-[#157A6D] dark:text-emerald-400">{totalCount} articles</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/health-library"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 transition shadow-xs"
          >
            <Globe size={15} />
            View Public Library
          </Link>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0F3B34] hover:bg-[#157A6D] text-white text-xs font-bold transition shadow-sm active:scale-95"
          >
            <Plus size={16} />
            Add New Article
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-[#157A6D]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-[#157A6D]"
          >
            <option value="all">All Categories</option>
            {ARTICLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-[#157A6D]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader />
            <p className="text-xs text-slate-400 mt-4">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center px-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200 mb-1">
              No articles found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                ? "No articles matched your filter criteria. Try clearing search filters."
                : "Create your first clinical health article to publish informative medical content."}
            </p>
            <Link
              to="/admin/articles/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0F3B34] hover:bg-[#157A6D] text-white text-xs font-bold transition shadow-sm"
            >
              <Plus size={16} />
              Add Article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Article</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Author</th>
                  <th className="py-4 px-4">Read Time</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Published</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {articles.map((art) => {
                  const isPub = art.status === "published" || (art.active && art.status !== "draft");
                  const cover = art.coverImage || art.heroImage;

                  return (
                    <tr
                      key={art._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Title & Cover */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3.5 min-w-[240px] max-w-sm">
                          {cover ? (
                            <img
                              src={cover}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#157A6D]/10 text-[#157A6D] dark:text-emerald-400 flex items-center justify-center shrink-0 font-black text-sm">
                              {art.title?.charAt(0) || "A"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/admin/articles/${art._id}/edit`}
                              className="font-bold text-slate-800 dark:text-zinc-100 hover:text-[#157A6D] transition line-clamp-1 block"
                            >
                              {art.title}
                            </Link>
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono truncate">
                              /{art.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F3EEE0] dark:bg-emerald-950/60 text-[#0F3B34] dark:text-emerald-300 border border-[#E4DFCF] dark:border-emerald-800/40">
                          {art.category || "General"}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-4 px-4 text-slate-600 dark:text-zinc-300">
                        <div className="font-semibold">{art.author?.name || "Wellmeds"}</div>
                        {art.author?.credentials && (
                          <div className="text-[10px] text-slate-400">{art.author.credentials}</div>
                        )}
                      </td>

                      {/* Read Time */}
                      <td className="py-4 px-4 text-slate-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock size={13} className="text-slate-400" />
                          <span>{art.readTime || "5 min read"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(art)}
                          disabled={actionLoading}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition shadow-2xs ${
                            isPub
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPub ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {isPub ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Published Date */}
                      <td className="py-4 px-4 text-slate-500 dark:text-zinc-400 text-[11px]">
                        {new Date(art.publishedAt || art.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview / View Public */}
                          <Link
                            to={`/articles/${art.slug}?preview=true`}
                            target="_blank"
                            title="Preview Article"
                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-[#157A6D]/10 hover:text-[#157A6D] dark:hover:text-emerald-400 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition"
                          >
                            <Eye size={15} />
                          </Link>

                          {/* Edit */}
                          <Link
                            to={`/admin/articles/${art._id}/edit`}
                            title="Edit Article"
                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-[#157A6D]/10 hover:text-[#157A6D] dark:hover:text-emerald-400 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition"
                          >
                            <FileEdit size={15} />
                          </Link>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(art)}
                            title="Delete Article"
                            className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center justify-center transition cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <span className="font-bold">{currentPage}</span> of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-zinc-800 transition font-bold"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-zinc-800 transition font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Article"
      >
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 text-rose-900 dark:text-rose-200">
            <AlertTriangle size={24} className="text-rose-600 shrink-0" />
            <p className="text-xs leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold underline">{deleteTarget?.title}</span>? This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {actionLoading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminArticles;
