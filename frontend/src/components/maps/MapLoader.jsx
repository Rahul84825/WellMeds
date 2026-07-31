import React from "react";
import { Loader2, MapPin } from "lucide-react";

const MapLoader = ({ height = "350px", text = "Initializing Mapbox..." }) => {
  return (
    <div
      className="w-full bg-surface-container-low dark:bg-surface-dark border border-outline-variant/60 rounded-xl flex flex-col items-center justify-center p-md text-on-surface-variant animate-pulse relative overflow-hidden"
      style={{ minHeight: height, height }}
    >
      <div className="flex items-center gap-xs text-primary dark:text-primary-fixed-dim font-bold mb-xs">
        <MapPin className="w-5 h-5 animate-bounce" />
        <span className="text-sm font-semibold">{text}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-on-surface-variant/70">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>Loading map tiles...</span>
      </div>
    </div>
  );
};

export default MapLoader;
