import React from "react";
import SubstituteProducts from "./SubstituteProducts";
import ClinicalIndex from "./ClinicalIndex";

const StickySidebar = ({
  substituteProducts,
  product,
  computedSections = [],
  activeSection = ""
}) => {
  const hasSpecs = product?.productSpecifications && Object.values(product.productSpecifications).some(v => v !== undefined && v !== "");
  
  // Compile active clinical sections containing data
  const clinicalItems = [
    { label: "Specifications", id: "Specifications", available: !!hasSpecs },
    { label: "Introduction", id: "Introduction", available: !!(product?.description && product.description.trim()) },
    { label: "Uses", id: "Uses", available: computedSections.some(s => s.id === "Uses") },
    { label: "Benefits", id: "Benefits", available: computedSections.some(s => s.id === "Benefits") },
    { label: "Dosage", id: "Dosage", available: computedSections.some(s => s.id === "Dosage") },
    { label: "Warnings", id: "Warnings", available: computedSections.some(s => s.id === "Warnings") },
    { label: "Side Effects", id: "SideEffects", available: computedSections.some(s => s.id === "SideEffects") },
    { label: "Precautions", id: "Precautions", available: computedSections.some(s => s.id === "Precautions") },
    { label: "Storage", id: "Storage", available: computedSections.some(s => s.id === "Storage") },
    { label: "FAQs", id: "FAQs", available: computedSections.some(s => s.id === "FAQs") },
    { label: "References", id: "References", available: computedSections.some(s => s.id === "References") },
    { label: "Disclaimer", id: "Disclaimer", available: true },
  ].filter(item => item.available);

  return (
    <aside className="w-full md:w-[30%] lg:w-[22%] shrink-0 self-stretch order-2 lg:order-1 select-none text-left hidden lg:block space-y-md">
      {/* Component 1 (Upper): Alternative Medicines Card */}
      <div className="w-full">
        <SubstituteProducts substituteProducts={substituteProducts} product={product} />
      </div>

      {/* Component 2 (Lower): Clinical Index */}
      <div className="w-full sticky top-24">
        <ClinicalIndex clinicalItems={clinicalItems} activeSection={activeSection} />
      </div>
    </aside>
  );
};

export default StickySidebar;
