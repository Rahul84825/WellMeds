import React from "react";

/**
 * Cleanly format storage instructions or storage specification text.
 * Handles arrays, single strings, bullet lists, and paragraphs.
 *
 * @param {Array|string} data
 * @returns {React.ReactNode}
 */
export const renderStorageContent = (data) => {
  if (!data) return null;

  let lines = [];
  if (Array.isArray(data)) {
    lines = data.map((s) => String(s).trim()).filter(Boolean);
  } else if (typeof data === "string") {
    lines = data
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    lines = [String(data)];
  }

  if (lines.length === 0) return null;

  // Process lines into structured items
  const items = [];
  lines.forEach((line) => {
    const isBullet = /^[•\-\*\d.]+\s*/.test(line);
    const cleaned = line.replace(/^[•\-\*\d.]+\s*/, "").trim();
    if (cleaned) {
      items.push({ text: cleaned, isBullet });
    }
  });

  if (items.length === 0) return null;

  // Single item non-bullet text
  if (items.length === 1 && !items[0].isBullet) {
    return (
      <p className="text-xs text-[#3f544d] leading-relaxed font-normal font-sans">
        {items[0].text}
      </p>
    );
  }

  return (
    <div className="space-y-2 text-xs text-[#3f544d] leading-relaxed font-sans">
      {items.map((item, idx) => {
        if (!item.isBullet && idx === 0) {
          // Intro headline/paragraph
          return (
            <p key={idx} className="font-normal text-[#172b26] mb-2.5 leading-relaxed font-sans">
              {item.text}
            </p>
          );
        }
        return (
          <div key={idx} className="flex items-start gap-2.5 text-[#2d4039]">
            <span className="text-[#157a6d] font-bold shrink-0 mt-0.5 select-none">•</span>
            <span className="font-normal leading-relaxed font-sans">{item.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default renderStorageContent;
