import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Premium Pagination Component — WellMeds Design System V2
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-indexed)
 * @param {number} props.totalPages - Total available pages
 * @param {number} [props.totalItems] - Total count of items across all pages
 * @param {number} [props.pageSize=20] - Number of items per page
 * @param {Function} props.onPageChange - Callback when a page is selected (pageNumber: number) => void
 * @param {boolean} [props.scrollToTop=true] - Scroll window to top on page change
 * @param {string} [props.itemLabel="Products"] - Label for total count summary (e.g. "Products", "Items", "Categories")
 * @param {string} [props.className=""] - Optional outer wrapper styling
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  scrollToTop = true,
  itemLabel = "Products",
  className = "",
}) => {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const curPage = Math.max(1, Math.min(currentPage, totalPages));

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages || page === curPage) return;
    if (onPageChange) {
      onPageChange(page);
    }
    if (scrollToTop && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers range for Desktop
  const getDesktopPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (curPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (curPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", curPage - 1, curPage, curPage + 1, "...", totalPages];
  };

  // Generate page numbers range for Mobile
  const getMobilePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (curPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }
    if (curPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, curPage - 1, curPage, curPage + 1, totalPages];
  };

  const desktopPages = getDesktopPages();
  const mobilePages = getMobilePages();

  const startItem = totalItems > 0 ? Math.min((curPage - 1) * pageSize + 1, totalItems) : 0;
  const endItem = totalItems > 0 ? Math.min(curPage * pageSize, totalItems) : 0;

  return (
    <div className={`space-y-4 my-8 select-none ${className}`}>
      {/* ── TOTAL PRODUCTS SUMMARY HEADER ── */}
      {totalItems > 0 && (
        <div className="text-center sm:text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-sans">
          Showing <span className="font-bold text-[#172b26] dark:text-white">{startItem}–{endItem}</span> of{" "}
          <span className="font-bold text-[#172b26] dark:text-white">{totalItems}</span> {itemLabel}
        </div>
      )}

      {/* ── PAGINATION CONTROLS ── */}
      <div className="flex items-center justify-center sm:justify-start flex-wrap gap-1.5 sm:gap-2">
        {/* PREVIOUS BUTTON */}
        <button
          type="button"
          onClick={() => handlePageClick(curPage - 1)}
          disabled={curPage <= 1}
          aria-label="Previous Page"
          className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 ${
            curPage <= 1
              ? "border-slate-200 dark:border-zinc-800 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-50 bg-slate-50/50 dark:bg-zinc-900/50"
              : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-[#157a6d]/10 hover:text-[#157a6d] hover:border-[#157a6d]/30 cursor-pointer shadow-xs active:scale-95"
          }`}
        >
          <ChevronLeft size={16} />
        </button>

        {/* DESKTOP PAGE NUMBERS */}
        <div className="hidden sm:flex items-center gap-1.5">
          {desktopPages.map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`dots-desktop-${idx}`}
                  className="w-8 h-10 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-zinc-500"
                >
                  •••
                </span>
              );
            }

            const isCurrent = item === curPage;
            return (
              <button
                key={`page-desktop-${item}`}
                type="button"
                onClick={() => handlePageClick(item)}
                aria-label={`Page ${item}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-9 h-9 sm:min-w-10 sm:h-10 px-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-[#157a6d] text-white shadow-md shadow-[#157a6d]/20 scale-105"
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 active:scale-95"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* MOBILE PAGE NUMBERS */}
        <div className="flex sm:hidden items-center gap-1">
          {mobilePages.map((item, idx) => {
            if (item === "...") {
              return (
                <span
                  key={`dots-mobile-${idx}`}
                  className="w-6 h-9 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-zinc-500"
                >
                  •••
                </span>
              );
            }

            const isCurrent = item === curPage;
            return (
              <button
                key={`page-mobile-${item}`}
                type="button"
                onClick={() => handlePageClick(item)}
                aria-label={`Page ${item}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-[#157a6d] text-white shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* NEXT BUTTON */}
        <button
          type="button"
          onClick={() => handlePageClick(curPage + 1)}
          disabled={curPage >= totalPages}
          aria-label="Next Page"
          className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 ${
            curPage >= totalPages
              ? "border-slate-200 dark:border-zinc-800 text-slate-300 dark:text-zinc-700 cursor-not-allowed opacity-50 bg-slate-50/50 dark:bg-zinc-900/50"
              : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-[#157a6d]/10 hover:text-[#157a6d] hover:border-[#157a6d]/30 cursor-pointer shadow-xs active:scale-95"
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
