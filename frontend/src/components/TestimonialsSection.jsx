import React from "react";

const testimonialsData = [
  {
    id: 1,
    text: "The fast delivery saved me when I ran out of my insulin. MediShop is a lifesaver!",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1qqFDPjz3Mr8onJQ_6cbTaWVtMMoFCE-6sTlTgkcqLOKLEU7U3qWgl5neLi-aExwyKcNlOuGK-jbKREv0LmfG8eMYE5dhyYdml4NKYqh4jZZ2II3rQMplB5l1wdrg1iQYa8NUGFdLEAwtlT52u8uBWQBJ-cy9N9Vy-zcunLCewUWgbW3Qv1O3vsKGczS5bkVn8SqR5U8VoIf7kgX8sA9FPbOVUcKMKSC7eL7KLtU2azZeiAd1cJmdoYS_ASeVhCh_u3Th9Vj86YqO",
    name: "Sarah Johnson",
    role: "Verified Buyer"
  },
  {
    id: 2,
    text: "I appreciate the prescription verification process. It feels very secure and professional.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAphcqGx1fnNXyk5p_UtWhj_s54is7crJPOrdv-bdBBDjM48or3uFwhmUtrwjHBoS1DJjVoeJj_btREqdZQp1g8-Lbe94PGnvb7v74XRz3Aj5VYtoE_hsUmosd8fMoqz5B1wG6_vhc7YoDq_71RmIVWjnpqzvXZxpze9TDRNG6lLxdGwlgGCRNwIxQYR4QhQxhmRZ83e3lkrp7IfWJFRkhX5qm5siC1CD7CtiAQWlmqIP7k1wOHo5Oz12fYUEJvrtFjgc-vKMHgMYEb",
    name: "Mark Davis",
    role: "Regular Customer"
  },
  {
    id: 3,
    text: "Best prices for chronic medication. The prescription log feature is incredibly convenient.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzX8IBvLldjApG9rj0bhInruyvu-5aL0N1oxJh_FTwZPrSp-FgL1WRGlIEfV3Y_PWkw-2-NDTounyW9TTY9wBzEwHTYngSzgjsDPCTEAeAWD9F8uBdH1ZcIR5y57r78mVrBrM9Uzb7aS4c7PglCbbJP9onxrTgjrX4gZ7S8BPqo-hMQBmY2PA1UcbiDGWBKVeJcK3h5uLrxW9aXyVN90BPOKREzBHrZpFQ3q94AOMP_n5vi2_Mns5utqL-QlOVKMMEWWHRlPIou5Mg",
    name: "Emily Chen",
    role: "Verified Buyer"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 max-w-max-width mx-auto px-margin-desktop">
      <h2 className="font-headline-md text-headline-md text-on-surface mb-xl text-center">What our customers say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonialsData.map((item) => (
          <div 
            key={item.id} 
            className="bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl border border-outline-variant dark:border-outline/40 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-xs text-[#086b53] mb-lg select-none">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span className="text-[11px] font-bold uppercase tracking-wider">Verified Purchase</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface dark:text-on-surface italic mb-lg">
                "{item.text}"
              </p>
            </div>
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
                <img
                  alt={item.name}
                  className="w-full h-full object-cover"
                  src={item.image}
                />
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-on-surface">{item.name}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
