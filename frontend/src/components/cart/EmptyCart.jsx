import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import emptyCartBasket from "../../assets/cart/empty-cart-basket.webp";
import CartMobileHeader from "./CartMobileHeader";

/**
 * EmptyCart Component
 * Renders the dedicated page mobile view matching reference,
 * while preserving untouched desktop view on md+ screens.
 */
const EmptyCart = () => {
  return (
    <>
      {/* ── MOBILE DEDICATED VIEW (< 768px) ── */}
      <div className="md:hidden flex flex-col min-h-screen bg-white dark:bg-zinc-950">
        <CartMobileHeader />

        <div className="flex-1 flex flex-col items-center justify-center px-4 pt-4 pb-16 text-center animate-[fade-in_0.25s_ease-out]">
          {/* Sized Illustration increased by 40% matching brand theme */}
          <div className="w-[294px] h-[294px] max-w-[85vw] max-h-[85vw] mx-auto mb-2 flex items-center justify-center">
            <img
              src={emptyCartBasket}
              alt="Empty shopping basket"
              className="w-full h-full object-contain select-none pointer-events-none"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              width={294}
              height={294}
            />
          </div>

          <h2 className="font-sans text-[22px] font-bold text-slate-900 dark:text-white mt-4 mb-1.5 tracking-tight">
            Your cart is empty
          </h2>

          <p className="font-sans text-[13.5px] text-slate-500 dark:text-zinc-400 font-normal mb-8">
            Enjoy upto 60% savings on Medicines
          </p>

          <Link
            to="/products"
            className="w-[86%] max-w-[340px] bg-[#038076] hover:bg-[#02635c] active:bg-[#014d47] text-white font-bold text-[15px] py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-sm shadow-[#038076]/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
            <span>Search Medicine</span>
          </Link>
        </div>
      </div>

      {/* ── DESKTOP VIEW (≥ 768px, UNTOUCHED) ── */}
      <div className="hidden md:flex w-full min-h-[60vh] sm:min-h-[70vh] items-center justify-center bg-[#F5F6FA] dark:bg-zinc-950 px-4 py-12 sm:py-16">
        <div className="w-full max-w-[420px] text-center px-6 py-10 sm:py-14 animate-[fade-in_0.3s_ease-out]">
          <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] mx-auto mb-2 flex items-center justify-center">
            <img
              src={emptyCartBasket}
              alt="Empty shopping basket"
              className="w-full h-full object-contain select-none"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              width={220}
              height={220}
            />
          </div>

          <h2 className="font-sans text-[22px] font-bold text-[#0F3B34] dark:text-emerald-300 mt-5 mb-2 tracking-tight">
            Your cart is empty
          </h2>

          <p className="font-sans text-[14.5px] text-[#157A6D] dark:text-emerald-400 font-semibold mb-7">
            Save up to 75% on genuine medicines
          </p>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 bg-[#0F3B34] hover:bg-[#157A6D] text-[#F3EEE0] font-bold text-[15px] px-7 py-3.5 rounded-full transition-all duration-150 shadow-sm active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[#157A6D] focus:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[18px] h-[18px] shrink-0"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span>Search Medicine</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default EmptyCart;
