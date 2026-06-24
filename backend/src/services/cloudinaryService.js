import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import fs from "fs";

export const uploadToCloudinary = async (localFilePath, folderName = "medishop") => {
  if (!localFilePath) return null;

  try {
    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderName,
        resource_type: "auto",
      });
      // Delete temporary local file
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      return result.secure_url;
    } else {
      // Return relative url path.
      const normalizedPath = localFilePath.replace(/\\/g, "/");
      // Prepend / to make it a root-relative path
      const relativeUrl = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
      console.log(`Disk Storage Fallback: Saved to ${relativeUrl}`);
      return relativeUrl;
    }
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    // Cleanup local file on failure
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};
