import React from "react";

const QuickActionCards = () => {
  // Four empty promotional cards
  const cards = [1, 2, 3, 4];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center w-full my-6">
      {cards.map((cardId) => (
        <a
          key={cardId}
          href="#"
          className="block cursor-pointer w-full max-w-[320px] md:w-80 h-[100px] p-4
                     rounded-2xl border border-slate-100 bg-white 
                     shadow-[0_4px_20px_rgba(0,0,0,0.03)] 
                     hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] 
                     hover:scale-[1.03]
                     transition-all duration-[250ms] ease-in-out 
                     overflow-hidden
                     dark:border-zinc-800 dark:bg-zinc-900/60
                     dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                     dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.4)]"
        >
          {/* Placeholder image container supporting object-fit, overflow, rounded corners, 100% width/height */}
          <div className="w-full h-full object-cover overflow-hidden rounded-xl bg-slate-50 dark:bg-zinc-800/40">
            {/* The container is empty and styled, ready to be replaced with a promotional image later */}
          </div>
        </a>
      ))}
    </div>
  );
};

export default QuickActionCards;
