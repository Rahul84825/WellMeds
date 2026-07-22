import React from "react";
import Loader from "../Loader";

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center w-full py-20 bg-white/50 dark:bg-zinc-950/50">
    <Loader size="lg" />
  </div>
);

export default PageFallback;
