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
        backgroundSize:     "cover",
        backgroundPosition: "center top",
        backgroundRepeat:   "no-repeat",
      }}
      className="relative w-full overflow-hidden h-[310px] md:h-[335px]
                 flex flex-col items-center justify-center select-none"
    >
      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[900px] flex-col
                      items-center justify-center px-6 text-center gap-4">

        {/* Heading */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <h1 className="text-[25px] font-extrabold leading-tight tracking-tight text-white
                         sm:text-[32px] lg:text-[41px]">
            More Than a Pharmacy.
          </h1>
          <p className="text-[19px] font-semibold tracking-tight text-[#038076]
                        sm:text-[24px] lg:text-[31px]">
            Your Partner in Better Health.
          </p>
        </div>

        {/* Search bar — refined rounded-full pill */}
        <div className="mt-2 w-full max-w-[520px] rounded-full border border-slate-200/80
                        bg-white p-1.5 shadow-[0_15px_45px_rgba(3,128,118,0.12)]
                        focus-within:border-[#038076]
                        focus-within:ring-2 focus-within:ring-[#038076]/10
                        transition-all duration-300
                        flex items-center gap-2
                        min-h-[50px] md:min-h-[56px]">

          {/* Search input */}
          <form onSubmit={handleHeroSearch} className="relative flex w-full flex-1 items-center">
            <Search className="absolute left-4 h-[22px] w-[22px] text-slate-400" />
            <input
              type="text"
              placeholder="Search Medicines, Brands, Molecules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-none bg-transparent py-2 pl-12 pr-4
                         text-[15px] search-input-poppins text-slate-800
                         placeholder-slate-400 focus:outline-none focus:ring-0
                         sm:text-[16px]"
            />
          </form>

          {/* Search button */}
          <button
            type="button"
            onClick={handleHeroSearch}
            className="shrink-0 cursor-pointer rounded-full bg-[#038076]
                       px-7 py-2.5 text-[16px] font-bold text-white shadow-md
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