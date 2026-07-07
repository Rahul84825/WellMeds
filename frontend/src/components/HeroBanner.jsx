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
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <section className="relative overflow-visible bg-[#eaf5f2] min-h-[480px] flex items-center justify-center py-16 transition-colors duration-300 w-full border-t border-gray-100">
      {/* Background Image containing stethoscope and clipboard */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-90 pointer-events-none"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      {/* Ambient Waves / Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30 pointer-events-none"></div>

      {/* Content Overlay */}
      <div className="relative max-w-[1440px] w-full mx-auto px-6 lg:px-10 xl:px-16 flex flex-col items-center text-center z-10">
        <h1 className="font-bold text-[36px] md:text-[48px] tracking-tight leading-tight text-center max-w-3xl mb-4">
          <span className="text-[#1D2B5C] block">More Than a Pharmacy.</span>
          <span className="text-[#ffffff] block mt-1">Your Partner in Better Health.</span>
        </h1>
        
        <p style={{ color: "#2F3B52" }} className="text-[16px] md:text-[18px] max-w-2xl mb-10 leading-relaxed font-medium">
          Life-saving medicines, surgical essentials, wellness products,<br className="hidden md:inline" />
          and expert support – all in one place.
        </p>
        
        {/* Integrated Search & Delivery Pin Card */}
        <div className="w-full max-w-4xl bg-[#038076] rounded-[24px] shadow-[0_20px_50px_rgba(3,128,118,0.22)] p-2.5 flex flex-col md:flex-row items-center gap-3 border border-[#026b62] focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all duration-300 relative">
          
          {/* Deliver To Section */}
          <div className="relative w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setLocationMenuOpen(!locationMenuOpen)}
              className="flex items-center gap-2.5 px-4 w-full md:w-auto py-2 text-white hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
              aria-label="Select delivery location"
            >
              <MapPin className="w-[24px] h-[24px] text-white shrink-0" />
              <div className="flex flex-col items-start leading-none text-left select-none">
                <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Deliver to</span>
                <span className="text-[14px] font-bold mt-[2px] flex items-center gap-1">
                  {selectedLocation} <ChevronDown className={`w-[14px] h-[14px] transition-transform ${locationMenuOpen ? "rotate-180" : ""}`} />
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
                    className="w-full px-4 py-2 hover:bg-[#f8f7fc] hover:text-[#4f2d8c] font-medium text-left transition-colors focus:outline-none"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Separator line (desktop) */}
          <div className="hidden md:block w-px h-8 bg-white/20 shrink-0"></div>

          {/* Search Input Section */}
          <form onSubmit={handleHeroSearch} className="flex-1 w-full flex items-center relative">
            <Search className="absolute left-3 w-[22px] h-[22px] text-white/70" />
            <input
              type="text"
              placeholder="Search Medicines, Molecules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-white/60 text-[16px]"
            />
            <button type="submit" className="hidden" />
          </form>
          
          {/* Search Button */}
          <button 
            type="button"
            onClick={handleHeroSearch}
            className="w-full md:w-auto bg-white text-[#038076] px-8 py-3 rounded-[16px] font-bold text-[16px] hover:bg-gray-50 transition-all duration-200 shadow-md active:scale-[0.98] shrink-0"
          >
            Search
          </button>
        </div>
        
        {/* Bottom Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-gray-700 font-semibold select-none">
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] rounded-full bg-[#038076] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
            <span className="text-[15px]">FDA Approved Brands</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[22px] h-[22px] rounded-full bg-[#038076] flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
            </div>
            <span className="text-[15px]">Next-day Delivery</span>
          </div>
          <div className="flex items-center gap-2">
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
