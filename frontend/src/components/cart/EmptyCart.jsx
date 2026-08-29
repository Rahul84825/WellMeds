import React from "react";
import { Link } from "react-router-dom";
import emptyCartBasket from "../../assets/cart/empty-cart-basket.png";

/**
 * EmptyCart Component
 * Renders the empty state for the shopping cart matching the design specifications.
 */
const EmptyCart = () => {
  return (
    <div className="w-full min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center bg-[#F5F6FA] dark:bg-zinc-950 px-4 py-12 sm:py-16">
      <div className="w-full max-w-[420px] text-center px-6 py-10 sm:py-14 animate-[fade-in_0.3s_ease-out]">
        <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] mx-auto mb-2 flex items-center justify-center">
          <img
            src={emptyCartBasket}
            alt="Empty shopping basket"
            className="w-full h-full object-contain select-none"
            loading="eager"
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
  );
};

export default EmptyCart;
