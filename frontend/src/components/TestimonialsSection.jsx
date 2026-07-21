import React, { useState, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Check } from "lucide-react";

const testimonialsData = [
  {
    id: 1,
    text: "The fast delivery saved me when I ran out of my insulin. WellMeds is an absolute lifesaver!",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1qqFDPjz3Mr8onJQ_6cbTaWVtMMoFCE-6sTlTgkcqLOKLEU7U3qWgl5neLi-aExwyKcNlOuGK-jbKREv0LmfG8eMYE5dhyYdml4NKYqh4jZZ2II3rQMplB5l1wdrg1iQYa8NUGFdLEAwtlT52u8uBWQBJ-cy9N9Vy-zcunLCewUWgbW3Qv1O3vsKGczS5bkVn8SqR5U8VoIf7kgX8sA9FPbOVUcKMKSC7eL7KLtU2azZeiAd1cJmdoYS_ASeVhCh_u3Th9Vj86YqO",
    name: "Sarah Johnson",
    role: "Verified Buyer",
    time: "2 days ago",
    source: "Google Review"
  },
  {
    id: 2,
    text: "I appreciate the prescription verification process. It feels very secure, clinical, and professional. The pharmacists are highly helpful.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAphcqGx1fnNXyk5p_UtWhj_s54is7crJPOrdv-bdBBDjM48or3uFwhmUtrwjHBoS1DJjVoeJj_btREqdZQp1g8-Lbe94PGnvb7v74XRz3Aj5VYtoE_hsUmosd8fMoqz5B1wG6_vhc7YoDq_71RmIVWjnpqzvXZxpze9TDRNG6lLxdGwlgGCRNwIxQYR4QhQxhmRZ83e3lkrp7IfWJFRkhX5qm5siC1CD7CtiAQWlmqIP7k1wOHo5Oz12fYUEJvrtFjgc-vKMHgMYEb",
    name: "Mark Davis",
    role: "Regular Customer",
    time: "2 weeks ago",
    source: "Google Review"
  },
  {
    id: 3,
    text: "Best prices for chronic medication. The digital prescription log feature is incredibly convenient and makes order tracking very straightforward.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzX8IBvLldjApG9rj0bhInruyvu-5aL0N1oxJh_FTwZPrSp-FgL1WRGlIEfV3Y_PWkw-2-NDTounyW9TTY9wBzEwHTYngSzgjsDPCTEAeAWD9F8uBdH1ZcIR5y57r78mVrBrM9Uzb7aS4c7PglCbbJP9onxrTgjrX4gZ7S8BPqo-hMQBmY2PA1UcbiDGWBKVeJcK3h5uLrxW9aXyVN90BPOKREzBHrZpFQ3q94AOMP_n5vi2_Mns5utqL-QlOVKMMEWWHRlPIou5Mg",
    name: "Emily Chen",
    role: "Verified Buyer",
    time: "1 month ago",
    source: "Google Review"
  },
  {
    id: 4,
    text: "Navigating cancer treatment medicines is extremely stressful, but WellMeds ensured cold-chain integrity and timely delivery for my critical medications. Truly top-notch support.",
    image: null,
    name: "Rajesh Kumar",
    role: "Verified Buyer",
    time: "3 weeks ago",
    source: "Google Review"
  },
  {
    id: 5,
    text: "Very professional service. The home delivery of my mother's daily heart medications is always punctual, nicely packed, and authentic.",
    image: null,
    name: "Anita Deshmukh",
    role: "Regular Customer",
    time: "5 days ago",
    source: "Google Review"
  },
  {
    id: 6,
    text: "Exceptional support from the consulting pharmacists. They helped me understand drug-to-drug interactions before I ordered my chronic therapy plans.",
    image: null,
    name: "David Miller",
    role: "Verified Buyer",
    time: "12 days ago",
    source: "Google Review"
  },
  {
    id: 7,
    text: "Authentic medicines with batch tracking gives me absolute peace of mind. Excellent UI/UX storefront as well. Highly recommended for chronic care.",
    image: null,
    name: "Priya Sharma",
    role: "Regular Customer",
    time: "1 month ago",
    source: "Google Review"
  },
  {
    id: 8,
    text: "Super quick upload prescription workflow. Approved and dispatched in a couple of hours. Brilliant service, clean dashboard to log my Rx history.",
    image: null,
    name: "James Wilson",
    role: "Verified Buyer",
    time: "2 months ago",
    source: "Google Review"
  }
];

const GoogleIcon = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const TestimonialCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const maxLength = 110;
  const shouldTruncate = item.text.length > maxLength;
  const textToShow = isExpanded ? item.text : (shouldTruncate ? `${item.text.slice(0, maxLength)}...` : item.text);

  return (
    <div className="w-[85vw] sm:w-[320px] md:w-[350px] shrink-0 snap-start flex flex-col gap-sm select-none">
      
      {/* 1. Customer Details Header (Aligned outside the card body) */}
      <div className="flex items-center gap-md px-xs">
        {/* Avatar */}
        {!item.image || imageError ? (
          <div className="w-[52px] h-[52px] rounded-full bg-[#038076]/10 text-[#038076] flex items-center justify-center font-bold text-base border border-slate-200 dark:border-zinc-800 shadow-xs shrink-0">
            {getInitials(item.name)}
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImageError(true)}
            className="w-[52px] h-[52px] rounded-full object-cover border border-slate-200 dark:border-zinc-800 shadow-xs shrink-0"
          />
        )}

        {/* Name and Stars */}
        <div className="text-left">
          <div className="flex items-center gap-xs">
            <span className="font-extrabold text-sm text-slate-800 dark:text-zinc-150 leading-tight">
              {item.name}
            </span>
            <span className="inline-flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded-md gap-0.5 shrink-0 select-none">
              <Check className="w-2.5 h-2.5" />
              Verified
            </span>
          </div>
          
          <div className="flex items-center gap-0.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Review Card Shell */}
      <div className="relative flex flex-col justify-between h-[230px] rounded-[24px] border border-slate-150 dark:border-zinc-800/80 bg-[#f7f9fc] dark:bg-zinc-900 p-lg shadow-sm hover:shadow-md hover:border-[#038076] dark:hover:border-[#038076] transition-all duration-300 overflow-hidden">
        
        {/* Quote Watermark Decoration */}
        <div className="absolute top-4 left-4 text-slate-250 dark:text-zinc-850 opacity-40 pointer-events-none select-none">
          <Quote className="w-14 h-14 transform rotate-180 text-slate-300 dark:text-zinc-800" />
        </div>

        {/* Google Floating Badge at Top Right */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center border border-slate-150 dark:border-zinc-850 shadow-xs select-none z-10">
          <GoogleIcon />
        </div>

        {/* Review Content */}
        <div className="relative z-15 pt-8 text-left">
          <p className="text-[13px] leading-relaxed text-slate-655 dark:text-zinc-300 font-medium font-poppins">
            "{textToShow}"
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-[11px] font-bold text-[#038076] hover:underline focus:outline-none cursor-pointer"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Card Footer */}
        <div className="relative z-10 border-t border-slate-200/60 dark:border-zinc-800/50 pt-sm flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-zinc-550 select-none">
          <span className="flex items-center gap-xs">
            <GoogleIcon />
            Google Review
          </span>
          <span>{item.time || "2 months ago"}</span>
        </div>

      </div>

    </div>
  );
};

export const TestimonialsSection = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-zinc-950 transition-colors duration-300 select-none">
      <div className="home-section-container">
        
        {/* Section Header with Top View All Row */}
        <div className="flex justify-between items-end mb-8 md:mb-12 border-b border-slate-100 dark:border-zinc-900 pb-md">
          <div className="text-left max-w-2xl space-y-xs">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              What Our <span className="text-[#038076]">Customers Say</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Read genuine reviews from patients who rely on WellMeds for chronic care, oncology, surgical products, wellness, and daily healthcare.
            </p>
          </div>

          <div className="shrink-0 pb-xs">
            <a
              href="/about"
              className="inline-flex items-center justify-center px-lg h-9 rounded-full border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-zinc-200 hover:bg-[#038076] hover:text-white hover:border-[#038076] transition-all duration-200 select-none cursor-pointer"
            >
              View All Reviews
            </a>
          </div>
        </div>

        {/* Testimonials Carousel Track */}
        <div className="relative w-full overflow-hidden">
          <div
            ref={scrollRef}
            className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {testimonialsData.map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Separated Carousel Navigation Controls */}
        <div className="flex items-center justify-center gap-md mt-md">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-[#038076] hover:text-white hover:border-[#038076] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-[#038076] hover:text-white hover:border-[#038076] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
