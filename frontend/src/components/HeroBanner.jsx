import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, ChevronDown, Check } from "lucide-react";
import heroImage from "../assets/banners/hero.png";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Pune, 411021");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

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
        <h1 className="text-[25px] font-extrabold leading-tight tracking-tight
                       sm:text-[32px] lg:text-[41px]">
          <span className="text-white">More Than a Pharmacy.</span>
          <span className="text-[#038076] block mt-1">Your Partner in Better Health.</span>
        </h1>

        {/* Search bar — refined rounded-full pill */}
        <div className="mt-2 w-full rounded-full border border-slate-200/80
                        bg-white p-1.5 shadow-[0_15px_45px_rgba(3,128,118,0.12)]
                        focus-within:border-[#038076]
                        focus-within:ring-2 focus-within:ring-[#038076]/10
                        transition-all duration-300
                        flex flex-col md:flex-row items-center gap-3
                        min-h-[56px] md:min-h-[62px]">

          {/* Location picker */}
          <div className="relative w-full shrink-0 md:w-auto">
            <button
              type="button"
              onClick={() => setLocationMenuOpen((v) => !v)}
              aria-label="Select delivery location"
              className="flex cursor-pointer items-center gap-3 rounded-full
                         px-4 py-1.5 text-slate-800 transition-colors
                         hover:bg-slate-50 focus:outline-none"
            >
              <MapPin className="h-[22px] w-[22px] shrink-0 text-[#038076]" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Deliver to
                </span>
                <span className="mt-px flex items-center gap-1 text-[13px]
                                 font-extrabold text-slate-800">
                  {selectedLocation}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 transition-transform
                              ${locationMenuOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </div>
            </button>

            {locationMenuOpen && (
              <div className="absolute left-0 z-[90] mt-2 w-52 rounded-xl border
                              border-gray-100 bg-white py-1.5 text-left text-sm
                              text-gray-700 shadow-xl">
                {["Pune, 411021","Mumbai, 400001","Delhi, 110001","Bangalore, 560001","Chennai, 600001"].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => { setSelectedLocation(loc); setLocationMenuOpen(false); }}
                    className="w-full cursor-pointer px-4 py-2 text-left font-medium
                               transition-colors hover:bg-[#f8f7fc]
                               hover:text-[#038076] focus:outline-none"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-1 hidden h-8 w-px shrink-0 bg-slate-200 md:block" />

          {/* Search input */}
          <form onSubmit={handleHeroSearch} className="relative flex w-full flex-1 items-center">
            <Search className="absolute left-4 h-[22px] w-[22px] text-slate-400" />
            <input
              type="text"
              placeholder="Search Medicines, Molecules..."
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
            className="w-full shrink-0 cursor-pointer rounded-full bg-[#038076]
                       px-7 py-2.5 text-[16px] font-bold text-white shadow-md
                       shadow-[#038076]/10 transition-all duration-300
                       hover:bg-[#02665e] hover:shadow-lg hover:shadow-[#038076]/15
                       active:scale-[0.98] md:w-auto"
          >
            Search
          </button>
        </div>

      </div>
    </section>
  );
};

export default Hero;