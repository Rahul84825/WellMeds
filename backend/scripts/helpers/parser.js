/**
 * parser.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WellMeds Product Import Utility – Data Parser
 *
 * Converts raw Excel cell values into MongoDB-friendly structures.
 * Keeps all parsing logic isolated from the main importer so that
 * column-mapping changes only touch this one file.
 *
 * IMPORTANT: This helper is READ-ONLY with respect to the database.
 * It never writes, updates or deletes any documents.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Primitive helpers ────────────────────────────────────────────────────────

/**
 * Safely coerce a cell value to a trimmed string.
 * Returns "" if the value is null / undefined / empty.
 */
export const toString = (val) => {
  if (val === null || val === undefined) return "";
  return String(val).trim();
};

/**
 * Parse a numeric value from a cell.
 * Returns the fallback (default 0) when the value is missing or NaN.
 */
export const toNumber = (val, fallback = 0) => {
  if (val === null || val === undefined || val === "") return fallback;
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

/**
 * Parse a boolean from typical Excel representations.
 * Accepts: true/false (JS), "yes"/"no", "true"/"false", 1/0.
 */
export const toBoolean = (val, fallback = false) => {
  if (val === null || val === undefined || val === "") return fallback;
  if (typeof val === "boolean") return val;
  const s = String(val).toLowerCase().trim();
  if (["true", "yes", "1", "y"].includes(s)) return true;
  if (["false", "no", "0", "n"].includes(s)) return false;
  return fallback;
};

/**
 * Split a delimited string into a trimmed, non-empty string array.
 * Supports semicolons, commas, newline bullets (•), and plain newlines.
 * @param {string|number|undefined} val  – Raw cell value
 * @param {string|RegExp} delimiter       – Split pattern (default: semicolon or comma)
 */
export const toArray = (val, delimiter = /[;,]+/) => {
  if (!val && val !== 0) return [];
  return String(val)
    .split(delimiter)
    .map((s) => s.replace(/^[•\-\*\s]+/, "").trim()) // strip bullet prefixes
    .filter(Boolean);
};

/**
 * Split a newline-separated bullet list into a clean string array.
 * Each bullet may be prefixed with "•", "-", or nothing.
 */
export const toBulletArray = (val) => {
  if (!val) return [];
  return String(val)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-\*\d.]+\s*/, "").trim())
    .filter(Boolean);
};

// ─── Structured parsers ───────────────────────────────────────────────────────

/**
 * Parse medicalSections[] from multiple column values.
 *
 * Each argument is { title, rawValue } where rawValue is the Excel cell.
 * Sections with empty content are omitted.
 *
 * @param  {...{title:string, rawValue:any}} sections
 * @returns {{ title: string, content: string }[]}
 */
export const parseMedicalSections = (...sections) => {
  return sections
    .map(({ title, rawValue }) => ({
      title: title.trim(),
      content: toString(rawValue),
    }))
    .filter((s) => s.content.length > 0);
};

/**
 * Parse composition[] from a multi-line cell.
 *
 * Supported formats (one ingredient per line):
 *   "Bevacizumab 400mg – antineoplastic"
 *   "Bevacizumab; 400mg; antineoplastic"
 *   "Bevacizumab 400mg"           ← purpose defaults to "Active Ingredient"
 *
 * @param {any} val – Raw cell value
 * @returns {{ ingredient: string, strength: string, purpose: string }[]}
 */
export const parseComposition = (val) => {
  if (!val) return [];
  const lines = String(val)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-\*]+\s*/, "").trim())
    .filter(Boolean);

  return lines.map((line) => {
    // Try semicolon-separated: ingredient; strength; purpose
    const parts = line.split(/\s*[;–—]\s*/);
    if (parts.length >= 3) {
      return {
        ingredient: parts[0].trim(),
        strength: parts[1].trim(),
        purpose: parts[2].trim(),
      };
    }
    if (parts.length === 2) {
      return {
        ingredient: parts[0].trim(),
        strength: parts[1].trim(),
        purpose: "Active Ingredient",
      };
    }
    // Try splitting off trailing "Xmg / Xmcg / Xiu" as strength
    const strengthMatch = line.match(/^(.+?)\s+([\d.,]+\s*(?:mg|mcg|iu|g|ml|%|units?)?)\s*$/i);
    if (strengthMatch) {
      return {
        ingredient: strengthMatch[1].trim(),
        strength: strengthMatch[2].trim(),
        purpose: "Active Ingredient",
      };
    }
    return {
      ingredient: line,
      strength: "",
      purpose: "Active Ingredient",
    };
  });
};

/**
 * Parse benefits[] from a multi-line cell.
 *
 * Supported formats (one benefit per line):
 *   "Treats cancer – long description"
 *   "Treats cancer: long description"
 *   "Treats cancer"               ← description defaults to ""
 *
 * @param {any} val – Raw cell value
 * @returns {{ title: string, description: string }[]}
 */
export const parseBenefits = (val) => {
  if (!val) return [];
  const lines = String(val)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-\*\d.]+\s*/, "").trim())
    .filter(Boolean);

  return lines.map((line) => {
    const sep = line.match(/\s*[–—:]\s+/);
    if (sep) {
      const idx = line.indexOf(sep[0]);
      return {
        title: line.substring(0, idx).trim(),
        description: line.substring(idx + sep[0].length).trim(),
      };
    }
    return { title: line, description: "" };
  });
};

/**
 * Parse faqs[] from a numbered / plain-text block.
 *
 * Supported formats:
 *   "1. Question? Answer."
 *   "Q: Question\nA: Answer"
 *   "Question? Answer."
 *
 * @param {any} val – Raw cell value
 * @returns {{ question: string, answer: string }[]}
 */
export const parseFAQs = (val) => {
  if (!val) return [];
  const text = String(val);

  // Format: "Q: ...\nA: ..."
  if (/Q\s*:/i.test(text) && /A\s*:/i.test(text)) {
    const blocks = text.split(/\n(?=Q\s*:)/i).filter(Boolean);
    return blocks
      .map((block) => {
        const qMatch = block.match(/Q\s*:\s*(.+?)(?=\n|A\s*:)/is);
        const aMatch = block.match(/A\s*:\s*(.+)/is);
        if (qMatch && aMatch) {
          return {
            question: qMatch[1].trim(),
            answer: aMatch[1].trim(),
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  // Format: "1. Question? Answer." or "1. Question Answer"
  const numbered = text.split(/\n(?=\d+\.)/).filter(Boolean);
  if (numbered.length > 0 && /^\d+\./.test(numbered[0])) {
    return numbered
      .map((block) => {
        const cleaned = block.replace(/^\d+\.\s*/, "").trim();
        // Split at first "?" that ends the question
        const qIdx = cleaned.indexOf("?");
        if (qIdx !== -1) {
          return {
            question: cleaned.substring(0, qIdx + 1).trim(),
            answer: cleaned.substring(qIdx + 1).trim(),
          };
        }
        // Fallback: treat entire block as question with empty answer
        return { question: cleaned, answer: "" };
      })
      .filter((f) => f.question.length > 0);
  }

  // Fallback: one entry per line
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-\*]+\s*/, "").trim())
    .filter(Boolean)
    .map((l) => ({ question: l, answer: "" }));
};

/**
 * Parse safetyCards[] from Safety Advice cell.
 *
 * Supported format (one entry per line):
 *   "Pregnancy: Unsafe"
 *   "Kidney: Use with caution"
 *
 * Also supports the Safety Information Cards column:
 *   "• Prescription Required: Yes"
 *
 * @param {any} val – Raw cell value
 * @returns {{ icon: string, title: string, status: string, description: string }[]}
 */
export const parseSafetyCards = (val) => {
  if (!val) return [];
  const lines = String(val)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-\*]+\s*/, "").trim())
    .filter(Boolean);

  // Icon mapping for common safety categories
  const iconMap = {
    pregnancy: "baby",
    breastfeeding: "baby-bottle",
    kidney: "kidney",
    liver: "liver",
    driving: "car",
    alcohol: "wine",
    heart: "heart",
    prescription: "prescription",
    "cold chain": "snowflake",
    hospital: "hospital",
    biological: "dna",
    biosimilar: "flask",
    cytotoxic: "skull",
    route: "syringe",
  };

  return lines
    .map((line) => {
      // "Title: Status" or "Title: Status – Description"
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) return null;

      const title = line.substring(0, colonIdx).trim();
      const rest = line.substring(colonIdx + 1).trim();

      // Check for description after "–" or "—"
      const dashMatch = rest.match(/^(.+?)\s*[–—]\s*(.+)$/);
      const status = dashMatch ? dashMatch[1].trim() : rest;
      const description = dashMatch ? dashMatch[2].trim() : "";

      // Resolve icon
      const titleLower = title.toLowerCase();
      const icon = Object.keys(iconMap).find((k) => titleLower.includes(k)) || "info";

      return { icon, title, status, description };
    })
    .filter(Boolean);
};

/**
 * Parse specifications[] from a bullet list cell.
 *
 * Supported format (one spec per line):
 *   "• Label: Value"
 *   "Label: Value"
 *
 * @param {any} val – Raw cell value
 * @returns {{ label: string, value: string }[]}
 */
export const parseSpecifications = (val) => {
  if (!val) return [];
  const lines = String(val)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-\*]+\s*/, "").trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) return null;
      return {
        label: line.substring(0, colonIdx).trim(),
        value: line.substring(colonIdx + 1).trim(),
      };
    })
    .filter(Boolean);
};

/**
 * Parse imagesData[] from a newline-separated list.
 *
 * Supported format (one image per line):
 *   "url | alt | title | caption"
 *   "url"   ← alt / title / caption default to ""
 *
 * @param {any} val – Raw cell value
 * @returns {{ url: string, alt: string, title: string, caption: string }[]}
 */
export const parseImagesData = (val) => {
  if (!val) return [];
  const lines = String(val)
    .split(/\r?\n/)
    .map((l) => l.replace(/^[•\-\*]+\s*/, "").trim())
    .filter(Boolean);

  return lines.map((line) => {
    const parts = line.split(/\s*\|\s*/);
    return {
      url: (parts[0] || "").trim(),
      alt: (parts[1] || "").trim(),
      title: (parts[2] || "").trim(),
      caption: (parts[3] || "").trim(),
    };
  });
};

/**
 * Parse the SEO block from a multi-line cell.
 *
 * Supported format:
 *   "SEO Title: …"
 *   "Meta Description: …"
 *   "Keywords: …"
 *   "Canonical URL: …"
 *   "OG Image: …"
 *
 * @param {any} val   – Raw cell value
 * @param {string} productName – Fallback for auto-generated meta values
 * @returns {{ metaTitle, metaDescription, keywords, canonicalUrl, ogImage }}
 */
export const parseSEO = (val, productName = "") => {
  const seo = {
    metaTitle: productName ? `Buy ${productName} Online | WellMeds` : "",
    metaDescription: productName
      ? `Buy ${productName} online at WellMeds. Get the best price, dosage, side effects and usage information.`
      : "",
    keywords: "",
    canonicalUrl: "",
    ogImage: "",
  };

  if (!val) return seo;

  const lines = String(val)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.substring(0, colonIdx).trim().toLowerCase();
    const value = line.substring(colonIdx + 1).trim();

    if (key.includes("seo title") || key === "title") seo.metaTitle = value;
    else if (key.includes("meta description") || key === "description") seo.metaDescription = value;
    else if (key.includes("keyword")) seo.keywords = value;
    else if (key.includes("canonical")) seo.canonicalUrl = value;
    else if (key.includes("og image") || key.includes("ogimage")) seo.ogImage = value;
  }

  return seo;
};

/**
 * Generate a unique slug by appending a counter suffix when the base slug
 * is already present in the provided Set of existing slugs.
 *
 * @param {string} baseSlug       – Starting slug value
 * @param {Set<string>} usedSlugs – Set of already-used slugs (mutated in-place)
 * @returns {string} Unique slug
 */
export const uniqueSlug = (baseSlug, usedSlugs) => {
  let candidate = baseSlug;
  let counter = 2;
  while (usedSlugs.has(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
  usedSlugs.add(candidate);
  return candidate;
};
