import React from "react";
import SimilarProducts from "./SimilarProducts";

const StickySidebar = ({
  similarProducts,
  product
}) => {
  return (
    <aside className="w-full lg:w-[22%] shrink-0 lg:sticky lg:top-24 order-2 lg:order-1 select-none text-left">
      {/* Similar Medicines */}
      <SimilarProducts similarProducts={similarProducts} product={product} />
    </aside>
  );
};

export default StickySidebar;
