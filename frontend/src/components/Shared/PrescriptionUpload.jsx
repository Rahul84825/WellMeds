import React, { useState } from "react";
import Loader from "../Loader";

const PrescriptionUpload = ({ onUploadSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

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
    
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a valid PDF, JPEG, or PNG file.");
      setFile(null);
      return;
    }
    
    // Max 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a prescription file to upload.");
      return;
    }

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      onUploadSuccess({ fileName: file.name, uploadDate: new Date().toISOString() });
    }, 1200);
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
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="rx-file-input" className="cursor-pointer space-y-sm block">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">cloud_upload</span>
          <p className="font-label-md text-label-md text-on-surface font-semibold">
            {file ? file.name : "Drag & drop your prescription here"}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            or click to browse from device (PDF, JPG, PNG up to 5MB)
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
        <div className="bg-secondary-container/20 border border-secondary/30 text-on-secondary-container p-md rounded-lg text-body-sm flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            <span className="font-medium">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
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
