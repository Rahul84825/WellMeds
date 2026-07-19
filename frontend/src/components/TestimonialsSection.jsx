import { useState, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

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

  // Truncate logic if content is long
  const maxLength = 100;
  const shouldTruncate = item.text.length > maxLength;
  const textToShow = isExpanded ? item.text : (shouldTruncate ? `${item.text.slice(0, maxLength)}...` : item.text);

  return (
    <div className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] shrink-0 snap-start testimonial-card-wrap">
      <div className="group relative flex flex-col justify-between h-full rounded-[24px] border border-slate-200/60 bg-white dark:bg-zinc-900 p-6 md:p-8 pb-24
                      shadow-[0_4px_20px_rgba(0,0,0,0.015)]
                      transition-all duration-300 ease-in-out
                      hover:-translate-y-1
                      hover:border-[#038076]
                      hover:shadow-[0_12px_30px_rgba(3,128,118,0.06)]
                      dark:border-zinc-800/80 dark:bg-zinc-950/40
                      dark:hover:border-[#038076] dark:hover:bg-zinc-950
                      overflow-hidden min-h-[340px] testimonial-card-body">
        
        {/* Subtle Quote Watermark */}
        <div className="absolute top-20 right-6 text-slate-100 dark:text-zinc-800 opacity-[0.18] dark:opacity-[0.05] pointer-events-none select-none transition-colors group-hover:text-[#038076]/10">
          <Quote className="w-24 h-24 transform rotate-180" />
        </div>

        <div>
          {/* Top customer block */}
          <div className="flex items-center gap-4 mb-5 relative z-10 testimonial-user-block">
            {/* Avatar */}
            {!item.image || imageError ? (
              <div className="w-[64px] h-[64px] rounded-full bg-[#038076]/10 dark:bg-[#038076]/20 text-[#038076] flex items-center justify-center font-bold text-lg border border-slate-100 dark:border-zinc-800 shadow-sm shrink-0 testimonial-avatar">
                {getInitials(item.name)}
              </div>
            ) : (
              <img
                src={item.image}
                alt={item.name}
                onError={() => setImageError(true)}
                className="w-[64px] h-[64px] rounded-full object-cover border border-slate-100 dark:border-zinc-800 shadow-sm shrink-0 testimonial-avatar"
              />
            )}

            {/* User Meta */}
            <div className="text-left testimonial-meta">
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-zinc-100 leading-tight testimonial-user-name">
                {item.name}
              </h4>
              <p className="text-[12px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5 mb-1.5 testimonial-user-role">
                {item.role || "Verified Buyer"}
              </p>
              <div className="flex items-center gap-0.5 testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial body */}
          <div className="relative z-10 text-left mb-6 testimonial-text-container">
            <p className="text-[14px] leading-relaxed text-slate-600 dark:text-zinc-300 font-medium testimonial-text">
              "{textToShow}"
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-[12px] font-bold text-[#038076] hover:underline focus:outline-none cursor-pointer"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
        </div>

        {/* Footer (with card half blur effect) */}
        <div className="absolute bottom-0 left-0 right-0 h-[72px] px-6 md:px-8 flex items-center justify-between border-t border-slate-150 dark:border-zinc-800/40 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-md rounded-b-[24px] z-10 testimonial-footer">
          <div className="flex items-center gap-2">
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">
              {item.source || "Google Review"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-[11px] font-medium testimonial-time">
            <span>•</span>
            <span>{item.time || "2 months ago"}</span>
          </div>
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
    <section className="py-12 md:py-16 bg-white dark:bg-zinc-950 transition-colors duration-300 testimonials-section">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 testimonials-header">
          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight testimonials-title">
              What Our <span className="text-[#038076]">Customers Say</span>
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 max-w-xl leading-relaxed testimonials-desc">
              Read genuine reviews from patients who rely on WellMeds for chronic care, oncology, and daily healthcare needs.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 self-start sm:self-end shrink-0 testimonials-controls">
            <button
              onClick={() => scroll("left")}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 text-[#1D2B5C] dark:text-zinc-300 hover:bg-[#038076] hover:text-white hover:border-[#038076] transition-all duration-200 cursor-pointer"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <a
              href="/about"
              className="inline-flex items-center justify-center px-5 h-10 rounded-full border border-slate-200 dark:border-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-300 hover:bg-[#038076] hover:text-white hover:border-[#038076] transition-all duration-200"
            >
              View All
            </a>
            <button
              onClick={() => scroll("right")}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 text-[#1D2B5C] dark:text-zinc-300 hover:bg-[#038076] hover:text-white hover:border-[#038076] transition-all duration-200 cursor-pointer"
              aria-label="Next testimonials"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid/Carousel */}
        <div className="relative w-full">
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }

            /* ── Testimonials Mobile Overrides (≤768px) ── */
            @media (max-width: 768px) {
              .testimonials-section {
                padding-top: 24px !important;
                padding-bottom: 24px !important;
              }
              .testimonials-header {
                margin-bottom: 16px !important;
                gap: 12px !important;
              }
              .testimonials-title {
                font-size: 24px !important; /* Reduced ~20% from 30px */
                line-height: 1.25 !important;
                font-weight: 700 !important;
              }
              .testimonials-desc {
                font-size: 13px !important;
                margin-top: 6px !important;
                margin-bottom: 0 !important;
                line-height: 1.4 !important;
              }
              .testimonials-controls {
                gap: 8px !important;
                margin-top: 4px !important;
              }
              .testimonials-controls button,
              .testimonials-controls a {
                height: 34px !important;
                width: 34px !important;
                font-size: 12px !important;
                padding: 0 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
              }
              .testimonials-controls a {
                width: auto !important;
                padding-left: 14px !important;
                padding-right: 14px !important;
                border-radius: 999px !important;
              }
              .testimonial-card-wrap {
                width: 280px !important; /* Peek next cards */
                min-width: 280px !important;
              }
              .testimonial-card-body {
                padding: 16px !important;
                padding-bottom: 56px !important; /* Reduce padding to optimize vertical space */
                min-height: 200px !important;
                border-radius: 18px !important;
              }
              .testimonial-avatar {
                width: 44px !important;
                height: 44px !important;
                font-size: 14px !important;
              }
              .testimonial-user-block {
                gap: 10px !important;
                margin-bottom: 12px !important;
              }
              .testimonial-user-name {
                font-size: 14px !important;
              }
              .testimonial-user-role {
                font-size: 11px !important;
                margin-top: 1px !important;
                margin-bottom: 4px !important;
              }
              .testimonial-stars svg {
                width: 12px !important;
                height: 12px !important;
              }
              .testimonial-text-container {
                margin-bottom: 12px !important;
              }
              .testimonial-text {
                font-size: 13px !important;
                line-height: 1.45 !important;
                margin-bottom: 0 !important;
                display: -webkit-box !important;
                -webkit-line-clamp: 3 !important; /* Limit previews to 3 lines */
                -webkit-box-orient: vertical !important;
                overflow: hidden !important;
              }
              .testimonial-footer {
                height: 44px !important;
                padding-left: 16px !important;
                padding-right: 16px !important;
                border-radius: 0 0 18px 18px !important;
              }
              .testimonial-footer span {
                font-size: 10px !important;
              }
              .testimonial-footer svg {
                width: 14px !important;
                height: 14px !important;
              }
            }
          `}</style>
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

      </div>
    </section>
  );
};

export default TestimonialsSection;
