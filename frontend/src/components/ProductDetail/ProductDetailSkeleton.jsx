import React from "react";

const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-[1550px] mx-auto px-margin-mobile md:px-margin-desktop py-xl text-left animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="mb-lg flex items-center gap-xs flex-wrap select-none">
        <div className="w-12 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <div className="w-16 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <div className="w-20 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <div className="w-32 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
      </div>

      {/* 3-Column Layout */}
      <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap gap-lg mb-xl items-start w-full">
        
        {/* LEFT COLUMN (22% on desktop, 28% on tablet, 100% on mobile) */}
        <div className="w-full md:w-[28%] lg:w-[22%] space-y-md shrink-0 order-2 md:order-1 lg:order-1">
          {/* Table of Contents Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="w-28 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="space-y-3 pt-2">
              <div className="w-20 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-24 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-28 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-16 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-24 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>

          {/* Substitute Sidebar Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm">
            <div className="w-36 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-2.5 items-center p-2 rounded-xl border border-slate-50 dark:border-zinc-800/40">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-zinc-800 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                    <div className="w-2/3 h-2 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (52% on desktop, 68% on tablet, 100% on mobile) */}
        <div className="w-full md:w-[68%] lg:w-[52%] space-y-md order-1 md:order-2 lg:order-2">
          {/* Main Info & Gallery Card Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl shadow-sm p-lg flex flex-col lg:flex-row gap-lg items-stretch">
            {/* Left Info block (60%) */}
            <div className="w-full lg:w-[60%] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-24 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-11/12 h-7 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-3/4 h-7 bg-slate-200 dark:bg-zinc-800 rounded-md lg:hidden" />
                <div className="w-32 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-40 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              </div>
              <div className="space-y-2.5 pt-6 border-t border-slate-100 dark:border-zinc-850">
                <div className="w-28 h-5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-24 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              </div>
            </div>

            {/* Right Gallery block (40%) */}
            <div className="w-full lg:w-[40%] flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-zinc-850 pt-lg lg:pt-0 lg:pl-lg">
              <div className="w-full aspect-square max-w-[200px] bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
              <div className="flex gap-2 justify-center mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Dispatch & Delivery Banner Skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
            <div className="h-16 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-24 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-16 h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              </div>
            </div>
            <div className="h-16 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-20 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-28 h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              </div>
            </div>
          </div>

          {/* Prescription & Cold Chain Skeletons */}
          <div className="space-y-sm">
            <div className="h-12 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-zinc-800 shrink-0" />
              <div className="w-44 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            </div>
            <div className="h-12 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-zinc-800 shrink-0" />
              <div className="w-36 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>

          {/* Specifications Table Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg space-y-4 shadow-sm">
            <div className="w-48 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-slate-50 dark:border-zinc-850 last:border-0">
                  <div className="w-28 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                  <div className="w-36 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Introduction Card Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg space-y-4 shadow-sm">
            <div className="w-28 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            <div className="space-y-2.5 pt-2">
              <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-11/12 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-4/5 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>

          {/* ProductTabs Skeleton */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg space-y-4 shadow-sm">
            <div className="flex gap-4 border-b border-slate-100 dark:border-zinc-800 pb-2 overflow-x-auto">
              <div className="w-16 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md shrink-0" />
              <div className="w-24 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md shrink-0" />
              <div className="w-20 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md shrink-0" />
              <div className="w-28 h-4 bg-slate-200 dark:bg-zinc-800 rounded-md shrink-0" />
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-full h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-2/3 h-3 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (30% on desktop, 100% on tablet/mobile) */}
        <aside className="w-full lg:w-[26%] lg:sticky lg:top-24 space-y-md order-3 max-w-[380px] shrink-0">
          <div className="bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-855/60 py-md px-sm rounded-3xl shadow-lg space-y-md">
            {/* Price Box */}
            <div className="bg-slate-50/50 dark:bg-zinc-955/20 py-2.5 px-3 rounded-2xl border border-slate-100 dark:border-zinc-855 space-y-2">
              <div className="w-16 h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-24 h-6 bg-slate-200 dark:bg-zinc-800 rounded-md" />
            </div>
            
            {/* Quantity Selector */}
            <div className="space-y-2">
              <div className="w-24 h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-md" />
              <div className="w-full h-11 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-11 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
              <div className="w-full h-11 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
