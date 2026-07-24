import React from "react";
import { Plus, Minus } from "lucide-react";

const QuantitySelector = ({
  quantity = 1,
  onUpdate = () => {},
  min = 1,
  max = 99,
  disabled = false,
  className = "",
}) => {
  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || quantity <= min) return;
    onUpdate(quantity - 1);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || quantity >= max) return;
    onUpdate(quantity + 1);
  };

  return (
    <div
      className={`inline-flex items-center bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 shadow-2xs ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className="w-7 h-7 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-900 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer active:scale-90"
        aria-label="Decrease quantity"
      >
        <Minus size={13} strokeWidth={2.5} />
      </button>

      <span className="w-9 text-center font-extrabold text-xs text-slate-900 dark:text-white select-none">
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className="w-7 h-7 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-900 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer active:scale-90"
        aria-label="Increase quantity"
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default QuantitySelector;
