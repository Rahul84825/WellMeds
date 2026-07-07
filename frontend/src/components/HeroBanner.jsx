import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, ChevronDown, Check } from "lucide-react";
import heroImage from "../assets/banners/hero.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Pune, 411021");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="relative overflow-visible bg-[#eaf5f2] min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center justify-center py-16 md:py-24 transition-colors duration-300 w-full border-t border-gray-100">
      {/* Background Image containing stethoscope and clipboard */}
      <img
        src={heroImage}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none p-8 md:p-14 opacity-90"
        draggable={false}
      />

      {/* Ambient Waves / Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30 pointer-events-none"></div>

      {/* Content Overlay */}
      <div className="relative max-w-[1400px] w-full mx-auto px-6 lg:px-10 xl:px-16 flex flex-col items-center text-center z-10">
        
        {/* Text Container restricted to 900px to prevent stretched text */}
        <div className="max-w-[900px] flex flex-col items-center text-center">
          <h1 className="font-extrabold text-[36px] sm:text-[48px] lg:text-[58px] tracking-tight leading-tight text-[#1D2B5C] mb-[32px]">
            <span>More Than a Pharmacy.</span>
            <span className="text-[#038076] block mt-1">Your Partner in Better Health.</span>
          </h1>

          <p style={{ color: "#2F3B52" }} className="text-[15px] sm:text-[18px] lg:text-[24px] leading-relaxed font-medium mb-[48px]">
            Life-saving medicines, surgical essentials, wellness products,<br className="hidden md:inline" />
            and expert support – all in one place.
          </p>
        </div>

        {/* Integrated Search & Delivery Pin Card (Rounded-full, Desktop: 80px height, White Bg, Teal CTA) */}
        <div className="w-full max-w-[900px] bg-white rounded-full shadow-[0_15px_45px_rgba(3,128,118,0.12)] p-2 flex flex-col md:flex-row items-center gap-3 border border-slate-200/80 focus-within:border-[#038076] focus-within:ring-2 focus-within:ring-[#038076]/10 transition-all duration-300 relative min-h-[70px] md:min-h-[80px]">

          {/* Deliver To Section */}
          <div className="relative w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setLocationMenuOpen(!locationMenuOpen)}
              className="flex items-center gap-3 px-5 py-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors focus:outline-none cursor-pointer"
              aria-label="Select delivery location"
            >
              <MapPin className="w-[24px] h-[24px] text-[#038076] shrink-0" />
              <div className="flex flex-col items-start leading-none text-left select-none">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Deliver to</span>
                <span className="text-[13px] font-extrabold text-slate-800 mt-[1px] flex items-center gap-1">
                  {selectedLocation} <ChevronDown className={`w-[14px] h-[14px] text-slate-500 transition-transform ${locationMenuOpen ? "rotate-180" : ""}`} />
                </span>
              </div>
            </button>

            {/* Mock Location Selector Dropdown */}
            {locationMenuOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[90] text-left text-sm text-gray-700 animate-[slide-up_0.15s_ease-out]">
                {["Pune, 411021", "Mumbai, 400001", "Delhi, 110001", "Bangalore, 560001", "Chennai, 600001"].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setLocationMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 hover:bg-[#f8f7fc] hover:text-[#038076] font-medium text-left transition-colors focus:outline-none cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Separator line (desktop) */}
          <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0 mx-1"></div>

          {/* Search Input Section */}
          <form onSubmit={handleHeroSearch} className="flex-1 w-full flex items-center relative">
            <Search className="absolute left-4 w-[22px] h-[22px] text-slate-400" />
            <input
              type="text"
              placeholder="Search Medicines, Molecules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 placeholder-slate-400 text-[15px] sm:text-[16px] font-medium"
            />
            <button type="submit" className="hidden" />
          </form>

          {/* Search Button (Teal Background with strong shadow) */}
          <button
            type="button"
            onClick={handleHeroSearch}
            className="w-full md:w-auto bg-[#038076] text-white hover:bg-[#02665e] px-8 py-3.5 rounded-full font-bold text-[16px] hover:shadow-lg hover:shadow-[#038076]/15 transition-all duration-300 active:scale-[0.98] shrink-0 cursor-pointer shadow-md shadow-[#038076]/10"
          >
            Search
          </button>
        </div>

        {/* Bottom Badges (36px vertical margin top, gap 16px, gap between badges 32-40px) */}
        <div className="mt-[36px] flex flex-wrap justify-center gap-x-[36px] gap-y-3 text-slate-700 font-semibold select-none">
          <div className="flex items-center gap-[16px]">
            <div className="w-[22px] h-[22px] rounded-full bg-[#038076] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
            <span className="text-[15px]">FDA Approved Brands</span>
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="w-[22px] h-[22px] rounded-full bg-[#038076] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
            <span className="text-[15px]">Next-day Delivery</span>
          </div>
          <div className="flex items-center gap-[16px]">
            <div className="w-[22px] h-[22px] rounded-full bg-[#038076] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
            <span className="text-[15px]">24/7 Pharmacist Support</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
