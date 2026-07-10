import React from "react";

const QuickActionCards = () => {
  // Four empty promotional cards
  const cards = [1, 2, 3, 4];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center w-full my-6">
      {cards.map((cardId) => (
        <a
          key={cardId}
          href="#"
          className="block w-full max-w-[360px] h-[170px] sm:h-[180px] md:h-[190px] lg:h-[200px]
                     rounded-2xl border border-slate-100 bg-white 
                     shadow-[0_4px_20px_rgba(0,0,0,0.03)] 
                     hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] 
                     hover:-translate-y-1 
                     transition-all duration-[250ms] ease-in-out 
                     overflow-hidden
                     dark:border-zinc-800 dark:bg-zinc-900/60
                     dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                     dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
        >
          {/* Placeholder image container supporting object-fit, overflow, rounded corners, 100% width/height */}
          <div className="w-full h-full object-cover overflow-hidden rounded-2xl bg-slate-50 dark:bg-zinc-800/40">
            {/* The container is empty and styled, ready to be replaced or containing an image later */}
          </div>
        </a>
      ))}
    </div>
  );
};

export default QuickActionCards;
