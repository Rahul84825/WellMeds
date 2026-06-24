import React from "react";

/**
 * PrescriptionTimeline — shows visual workflow steps for a prescription.
 * Highlights the current active step.
 *
 * Props:
 *  - status: one of the 5 Prescription status strings
 */

const STEPS = [
  {
    key: "uploaded",
    label: "Uploaded",
    sublabel: "File received",
    icon: "cloud_done",
    statuses: ["Pending Review", "Under Verification", "Approved", "Rejected", "Expired"],
  },
  {
    key: "review",
    label: "Under Review",
    sublabel: "Pharmacist reviewing",
    icon: "manage_search",
    statuses: ["Under Verification", "Approved", "Rejected"],
  },
  {
    key: "decision",
    label: "Decision",
    sublabel: "Approved or Rejected",
    icon: "fact_check",
    statuses: ["Approved", "Rejected"],
  },
  {
    key: "ready",
    label: "Ready to Order",
    sublabel: "Use at checkout",
    icon: "shopping_bag",
    statuses: ["Approved"],
  },
];

const getStepState = (step, currentStatus) => {
  if (currentStatus === "Rejected") {
    // Mark everything after "Under Review" as error/blocked
    if (step.key === "decision") return "rejected";
    if (step.key === "ready") return "blocked";
    if (step.key === "uploaded") return "done";
    if (step.key === "review") return "done";
  }
  if (currentStatus === "Expired") {
    return step.statuses.includes("Approved") && step.key === "ready" ? "blocked" : "done";
  }
  if (step.statuses.includes(currentStatus)) return "done";
  // Is this the CURRENT active step?
  if (currentStatus === "Pending Review" && step.key === "uploaded") return "active";
  if (currentStatus === "Under Verification" && step.key === "review") return "active";
  if (currentStatus === "Approved" && step.key === "ready") return "active";
  return "pending";
};

const PrescriptionTimeline = ({ status }) => {
  return (
    <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm">
      <h3 className="font-label-md text-label-md font-bold text-on-surface mb-lg pb-md border-b border-outline-variant/60">
        Prescription Status Timeline
      </h3>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-outline-variant dark:bg-outline/30" />

        <div className="space-y-0">
          {STEPS.map((step, idx) => {
            const state = getStepState(step, status);
            const isLast = idx === STEPS.length - 1;

            let iconBg = "bg-surface-container-low border-outline-variant";
            let iconColor = "text-outline";
            let labelColor = "text-on-surface-variant";
            let sublabelColor = "text-on-surface-variant/60";
            let pulseClass = "";

            if (state === "done") {
              iconBg = "bg-secondary border-secondary";
              iconColor = "text-white";
              labelColor = "text-on-surface font-semibold";
            } else if (state === "active") {
              iconBg = "bg-primary border-primary";
              iconColor = "text-white";
              labelColor = "text-primary font-bold";
              sublabelColor = "text-primary/70";
              pulseClass = "animate-pulse";
            } else if (state === "rejected") {
              iconBg = "bg-error border-error";
              iconColor = "text-white";
              labelColor = "text-error font-semibold";
            } else if (state === "blocked") {
              iconBg = "bg-surface-container border-outline-variant/40";
              iconColor = "text-outline/40";
              labelColor = "text-on-surface-variant/40";
              sublabelColor = "text-on-surface-variant/30";
            }

            return (
              <div key={step.key} className={`relative flex items-start gap-md ${!isLast ? "pb-xl" : ""}`}>
                {/* Step Circle */}
                <div
                  className={`relative z-10 w-11 h-11 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${iconBg} ${pulseClass}`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${iconColor}`}
                    style={{ fontVariationSettings: state === "done" || state === "rejected" ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {state === "rejected" && step.key === "decision" ? "cancel" : step.icon}
                  </span>
                </div>

                {/* Step Text */}
                <div className="pt-1.5">
                  <p className={`font-label-md text-label-md ${labelColor} transition-colors`}>{step.label}</p>
                  <p className={`text-xs mt-0.5 ${sublabelColor}`}>{step.sublabel}</p>
                  {state === "active" && (
                    <span className="inline-flex items-center gap-xs mt-xs px-sm py-0.5 bg-primary-container/20 text-primary rounded-full text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                      In progress
                    </span>
                  )}
                  {state === "rejected" && step.key === "decision" && (
                    <span className="inline-flex items-center gap-xs mt-xs px-sm py-0.5 bg-error-container/20 text-error rounded-full text-xs font-semibold">
                      Prescription Rejected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTimeline;
