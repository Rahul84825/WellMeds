import React from "react";
import { Star } from "lucide-react";

const testimonialsData = [
  {
    id: 1,
    text: "The fast delivery saved me when I ran out of my insulin. WellMeds is an absolute lifesaver!",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1qqFDPjz3Mr8onJQ_6cbTaWVtMMoFCE-6sTlTgkcqLOKLEU7U3qWgl5neLi-aExwyKcNlOuGK-jbKREv0LmfG8eMYE5dhyYdml4NKYqh4jZZ2II3rQMplB5l1wdrg1iQYa8NUGFdLEAwtlT52u8uBWQBJ-cy9N9Vy-zcunLCewUWgbW3Qv1O3vsKGczS5bkVn8SqR5U8VoIf7kgX8sA9FPbOVUcKMKSC7eL7KLtU2azZeiAd1cJmdoYS_ASeVhCh_u3Th9Vj86YqO",
    name: "Sarah Johnson",
    role: "Verified Buyer"
  },
  {
    id: 2,
    text: "I appreciate the prescription verification process. It feels very secure, clinical, and professional.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAphcqGx1fnNXyk5p_UtWhj_s54is7crJPOrdv-bdBBDjM48or3uFwhmUtrwjHBoS1DJjVoeJj_btREqdZQp1g8-Lbe94PGnvb7v74XRz3Aj5VYtoE_hsUmosd8fMoqz5B1wG6_vhc7YoDq_71RmIVWjnpqzvXZxpze9TDRNG6lLxdGwlgGCRNwIxQYR4QhQxhmRZ83e3lkrp7IfWJFRkhX5qm5siC1CD7CtiAQWlmqIP7k1wOHo5Oz12fYUEJvrtFjgc-vKMHgMYEb",
    name: "Mark Davis",
    role: "Regular Customer"
  },
  {
    id: 3,
    text: "Best prices for chronic medication. The digital prescription log feature is incredibly convenient.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzX8IBvLldjApG9rj0bhInruyvu-5aL0N1oxJh_FTwZPrSp-FgL1WRGlIEfV3Y_PWkw-2-NDTounyW9TTY9wBzEwHTYngSzgjsDPCTEAeAWD9F8uBdH1ZcIR5y57r78mVrBrM9Uzb7aS4c7PglCbbJP9onxrTgjrX4gZ7S8BPqo-hMQBmY2PA1UcbiDGWBKVeJcK3h5uLrxW9aXyVN90BPOKREzBHrZpFQ3q94AOMP_n5vi2_Mns5utqL-QlOVKMMEWWHRlPIou5Mg",
    name: "Emily Chen",
    role: "Verified Buyer"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            
            <h2 className="text-[32px] font-extrabold leading-tight tracking-tight
                           text-[#1D2B5C] dark:text-zinc-100 ">
              What Our <span className="text-[#038076]">Customers Say</span>
            </h2>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {testimonialsData.map((item) => (
            <div 
              key={item.id} 
              className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-5
                         transition-all duration-300
                         hover:-translate-y-1
                         hover:border-[#038076]/25
                         hover:bg-white
                         hover:shadow-[0_6px_20px_rgba(3,128,118,0.08)]
                         dark:border-zinc-800 dark:bg-zinc-900
                         dark:hover:border-[#038076]/40 relative overflow-hidden"
            >
              {/* Giant quote background decoration */}
              <span className="absolute -right-2 -top-6 text-[120px] font-serif font-black text-slate-100/50 dark:text-zinc-800/10 select-none pointer-events-none group-hover:text-[#038076]/5 transition-colors">
                “
              </span>

              {/* Card content */}
              <div>
                {/* 5 Star Rating */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-[13px] leading-relaxed text-slate-600 dark:text-zinc-300 italic mb-6 relative z-10 text-left">
                  "{item.text}"
                </p>
              </div>

              {/* Card Footer / User Info */}
              <div className="flex items-center justify-between border-t border-slate-100/80 dark:border-zinc-800/50 pt-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#038076]/20 bg-slate-100 dark:bg-zinc-800 shrink-0">
                    <img
                      alt={item.name}
                      className="w-full h-full object-cover"
                      src={item.image}
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="text-[13px] font-bold text-[#1D2B5C] dark:text-zinc-100 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                      {item.role}
                    </p>
                  </div>
                </div>

                {/* Verified Badge */}
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase select-none shrink-0">
                  <span className="material-symbols-outlined text-[12px] font-black">verified</span>
                  <span>Verified</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
