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

/**
 * Compresses an image client-side to ensure fast uploads and prevent payload size limits (e.g. 413 Payload Too Large).
 * @param {File} file - Original File object from file input
 * @param {Object} options - Configuration options { maxWidth, maxHeight, quality, maxSizeBytes }
 * @returns {Promise<File>} Compressed File object (or original file if compression not applicable)
 */
export const compressImage = async (file, options = {}) => {
  if (!file || !(file instanceof File)) return file;

  // Only compress raster images (jpeg, png, webp)
  const compressibleTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!compressibleTypes.includes(file.type)) {
    return file;
  }

  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85
  } = options;

  // If file is already small (under 300KB), return as is
  if (file.size < 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob (preserve webp/jpeg/png format)
        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob || (blob.size >= file.size && width === img.width)) {
              resolve(file);
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: blob.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
};

