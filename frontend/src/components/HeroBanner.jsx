import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import heroImage from "../assets/banners/hero.png";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleHeroSearch = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section
      style={{
        backgroundImage:    `url(${heroImage})`,
        backgroundRepeat:   "no-repeat",
      }}
      className="relative w-full overflow-hidden h-[310px] md:h-[335px]
                 flex flex-col items-center justify-center select-none
                 bg-[#b9e0e7] bg-cover md:bg-contain bg-center"
    >
      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[950px] flex-col
                      items-center justify-center px-6 text-center gap-4 md:gap-5">

        {/* Heading & Paragraph (SEO and Accessibility) */}
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-[28px] sm:text-[38px] lg:text-[46px] font-extrabold leading-tight tracking-tight text-slate-800 font-poppins">
            More Than a <span className="text-[#038076]">Pharmacy.</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-[17px] font-medium text-slate-600 max-w-[620px] leading-relaxed font-poppins">
            Your Partner in Better Health. Your trusted partner for specialty medicines, prescription care, and expert healthcare support.
          </p>
        </div>

        {/* Search bar — refined rounded-full pill */}
        <div className="mt-1 w-full max-w-[850px] rounded-full border border-slate-200/80
                        bg-white p-1.5 shadow-[0_15px_45px_rgba(3,128,118,0.12)]
                        focus-within:border-[#038076]
                        focus-within:ring-2 focus-within:ring-[#038076]/10
                        transition-all duration-300
                        flex items-center gap-2
                        min-h-[50px] md:min-h-[54px]">

          {/* Search input */}
          <form onSubmit={handleHeroSearch} className="relative flex w-full flex-1 items-center">
            <Search className="absolute left-4 h-[20px] w-[20px] text-slate-400" />
            <input
              type="text"
              placeholder="Search Medicines, Brands, Molecules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-none bg-transparent py-2 pl-11 pr-4
                         text-[14px] md:text-[15px] search-input-poppins text-slate-800
                         placeholder-slate-400 focus:outline-none focus:ring-0"
            />
          </form>

          {/* Search button */}
          <button
            type="button"
            onClick={handleHeroSearch}
            className="shrink-0 cursor-pointer rounded-full bg-[#038076]
                       px-6 py-2.5 text-[14px] md:text-[15px] font-bold text-white shadow-md
                       shadow-[#038076]/10 transition-all duration-300
                       hover:bg-[#02665e] hover:shadow-lg hover:shadow-[#038076]/15
                       active:scale-[0.98]"
          >
            Search
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;