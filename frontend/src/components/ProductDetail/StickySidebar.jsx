import React from "react";
import SubstituteProducts from "./SubstituteProducts";
import ClinicalIndex from "./ClinicalIndex";

const StickySidebar = ({
  substituteProducts,
  product,
  computedSections = [],
  activeSection = ""
}) => {
  // Compile active clinical sections containing data
  const clinicalItems = [
    { label: "Introduction", id: "Introduction", available: !!(product?.description && product.description.trim()) },
    { label: "Uses", id: "Uses", available: computedSections.some(s => s.id === "Uses") },
    { label: "Benefits", id: "Benefits", available: computedSections.some(s => s.id === "Benefits") },
    { label: "Dosage", id: "Dosage", available: computedSections.some(s => s.id === "Dosage") },
    { label: "Side Effects", id: "SideEffects", available: computedSections.some(s => s.id === "SideEffects") },
    { label: "Warnings", id: "Warnings", available: computedSections.some(s => s.id === "Warnings") },
    { label: "Precautions", id: "Precautions", available: computedSections.some(s => s.id === "Precautions") },
    { label: "Storage", id: "Storage", available: computedSections.some(s => s.id === "Storage") },
    { label: "FAQs", id: "FAQs", available: computedSections.some(s => s.id === "FAQs") },
    { label: "References", id: "References", available: computedSections.some(s => s.id === "References") },
  ].filter(item => item.available);

  return (
    <aside className="w-full md:w-[30%] lg:w-[22%] shrink-0 md:sticky md:top-24 order-2 lg:order-1 select-none text-left space-y-md">
      {/* Substitute Medicines */}
      <SubstituteProducts substituteProducts={substituteProducts} product={product} />

      {/* Clinical Index */}
      <ClinicalIndex clinicalItems={clinicalItems} activeSection={activeSection} />
    </aside>
  );
};

export default StickySidebar;
