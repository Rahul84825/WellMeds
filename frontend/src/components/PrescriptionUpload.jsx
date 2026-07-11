import React, { useState, useEffect } from "react";
import Loader from "./Loader";
import { api } from "../services/api";

const PrescriptionUpload = ({ onUploadSuccess, onClose, cartSnapshot }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    // Clean up object URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid PDF, JPEG, PNG, or WEBP file.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    
    // Max 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError("");
    setFile(selectedFile);

    // Create object URL for preview if it's an image
    if (selectedFile.type.startsWith("image/")) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a prescription file to upload.");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadProgress(10);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const data = await api.uploadPrescription(file, cartSnapshot);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onUploadSuccess(data);
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      console.error(err);
      setError(err.response?.data?.message || "File upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-xl text-center cursor-pointer transition-colors bg-surface-container-low/50"
      >
        <input
          type="file"
          id="rx-file-input"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="rx-file-input" className="cursor-pointer space-y-sm block">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">cloud_upload</span>
          <p className="font-label-md text-label-md text-on-surface font-semibold">
            {file ? file.name : "Drag & drop your prescription here"}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            or click to browse from device (PDF, JPG, PNG, WEBP up to 10MB)
          </p>
        </label>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {file && !error && (
        <div className="bg-secondary-container/20 border border-secondary/30 text-on-secondary-container p-md rounded-lg text-body-sm flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              <span className="font-medium truncate max-w-[220px]">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
              }}
              className="text-on-surface-variant hover:text-error transition-colors p-1"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
          {previewUrl && (
            <div className="relative w-full max-h-[160px] rounded-lg overflow-hidden border border-outline-variant/60 bg-surface-container-low flex items-center justify-center p-1 animate-[fade-in_0.2s_ease-out]">
              <img src={previewUrl} alt="Prescription Preview" className="max-h-[150px] object-contain rounded-md" />
            </div>
          )}
        </div>
      )}

      {isUploading && (
        <div className="space-y-xs w-full animate-[fade-in_0.2s_ease-out]">
          <div className="flex justify-between text-[11px] font-bold text-secondary">
            <span>Uploading Prescription...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-secondary h-full transition-all duration-300 ease-out animate-[pulse_1.5s_infinite]"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-sm pt-sm border-t border-outline-variant">
        <button
          type="button"
          onClick={onClose}
          disabled={isUploading}
          className="px-lg py-sm border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUploading || !file}
          className="bg-secondary text-white px-lg py-sm rounded-lg font-label-md text-label-md font-bold hover:bg-on-secondary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-sm active:scale-95"
        >
          {isUploading ? (
            <>
              <Loader size="sm" color="white" />
              Uploading...
            </>
          ) : (
            "Verify & Upload"
          )}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionUpload;
