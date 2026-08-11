/**
 * Image Utility for WellMeds Delivery Pipeline
 * Generates optimized Cloudinary delivery URLs for Product Cards using e_trim, f_auto, q_auto.
 */

/**
 * Returns an optimized delivery URL for product cards.
 * If the URL is from Cloudinary, inserts e_trim, f_auto, q_auto, w_600, c_limit
 * to remove empty canvas borders on the CDN side while preserving 100% packaging detail.
 *
 * @param {string} url - Original image URL
 * @param {object} options - Optional config { width: 600, trim: true }
 * @returns {string} Optimized image URL
 */
export const getCardImageUrl = (url, options = {}) => {
  if (!url || typeof url !== "string") return url;

  // Do not modify data URIs, SVGs, or blob URLs
  if (url.startsWith("data:") || url.startsWith("blob:") || url.endsWith(".svg")) {
    return url;
  }

  // Cloudinary URL processing
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    const { width = 600, trim = true } = options;

    // Check if URL already has e_trim
    if (url.includes("e_trim")) {
      return url;
    }

    const transformParts = [];
    if (trim) transformParts.push("e_trim");
    transformParts.push("f_auto", "q_auto");
    if (width) transformParts.push(`w_${width}`, "c_limit");

    const transformStr = transformParts.join(",");

    // Insert transform parameter after /upload/
    return url.replace("/upload/", `/upload/${transformStr}/`);
  }

  return url;
};
