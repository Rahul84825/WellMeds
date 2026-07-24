import React from "react";
import { ShoppingBag, FileText, CreditCard, CheckCircle2, ChevronRight } from "lucide-react";

const STEPS = [
  { id: "cart", label: "Shopping Cart", icon: ShoppingBag },
  { id: "rx", label: "Upload Prescription", icon: FileText, rxOnly: true },
  { id: "checkout", label: "Checkout & Address", icon: CreditCard },
  { id: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
];

const ProgressStepper = ({ currentStep = "cart", hasRxItem = false }) => {
  // Filter steps based on whether prescription items are in cart
  const activeSteps = STEPS.filter((step) => !step.rxOnly || hasRxItem);
  const currentStepIndex = activeSteps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs mb-8 animate-[fade-in_0.3s_ease-out]">
      <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto custom-scrollbar">
        {activeSteps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStepIndex;
          const isCurrent = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2.5 shrink-0 py-1">
                {/* Step Circle Icon */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-xs transition-all shadow-xs ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-[#038076] text-white ring-4 ring-[#038076]/20"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="stroke-[2.5]" />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>

                {/* Step Label */}
                <div className="text-left">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-[#038076] dark:text-[#84d6b9]"
                        : isCompleted
                        ? "text-slate-800 dark:text-zinc-200"
                        : "text-slate-400 dark:text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    Step {idx + 1} of {activeSteps.length}
                  </p>
                </div>
              </div>

              {/* Connecting Chevron/Line */}
              {idx < activeSteps.length - 1 && (
                <div className="hidden sm:flex items-center justify-center px-2 text-slate-300 dark:text-zinc-700 shrink-0">
                  <ChevronRight size={18} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStepper;
