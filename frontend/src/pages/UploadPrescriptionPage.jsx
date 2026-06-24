import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import Loader from "../components/Loader";
import PrescriptionCard from "../components/PrescriptionCard";
import PrescriptionTimeline from "../components/PrescriptionTimeline";
import Modal from "../components/Modal";

const UploadPrescriptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Prescriptions state
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(true);

  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  // Post-Upload Success details
  const [uploadedRxRecord, setUploadedRxRecord] = useState(null);

  // Accordion state
  const [accordionOpen, setAccordionOpen] = useState(false);

  // Right sidebar state
  const [orderMethod, setOrderMethod] = useState("upload-and-order");
  const [duration, setDuration] = useState("30");
  const [address, setAddress] = useState(user?.shippingAddress || "Please set a shipping address in your profile.");

  // Modal for changing address
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState(address);

  // Fetch saved prescriptions
  const fetchPrescriptions = async () => {
    try {
      const data = await api.getMyPrescriptions();
      setSavedPrescriptions(data);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setLoadingRx(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setUploadError("");
    setUploadedRxRecord(null);

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only PDF, JPG, and PNG are allowed!");
      setUploadFile(null);
      return;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  // Perform upload
  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadError("");
    setUploadProgress(10);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      const data = await api.uploadPrescription(uploadFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Update success states
      setUploadedRxRecord(data.prescription);
      setUploadFile(null);
      setUploadProgress(0);

      // Refresh list
      fetchPrescriptions();
    } catch (err) {
      clearInterval(progressInterval);
      setUploadError(err.response?.data?.message || "Prescription upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRx = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.deletePrescription(id);
        setSavedPrescriptions((prev) => prev.filter((rx) => (rx.id || rx._id) !== id));
        if (uploadedRxRecord && (uploadedRxRecord.id || uploadedRxRecord._id) === id) {
          setUploadedRxRecord(null);
        }
      } catch (err) {
        console.error("Failed to delete prescription", err);
        alert("Failed to delete prescription.");
      }
    }
  };

  const handleSaveAddress = () => {
    setAddress(newAddressInput);
    setAddressModalOpen(false);
  };

  const handleContinue = () => {
    // Continue Flow
    if (savedPrescriptions.length === 0 && !uploadedRxRecord) {
      alert("Please upload at least one prescription before continuing.");
      return;
    }
    alert(`Order proceeding with method: ${orderMethod === "upload-and-order" ? "Upload & Order" : orderMethod === "callback" ? "Pharmacist Callback" : "Assistance Required"} for ${duration} days.`);
    navigate("/checkout");
  };

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Breadcrumbs */}
      <div className="mb-lg">
        <nav className="flex items-center text-label-sm text-on-surface-variant dark:text-surface-variant gap-xs">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary dark:text-primary-fixed-dim font-bold">Upload Prescription</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-outline/60">Order</span>
        </nav>
      </div>

      <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-lg">Upload Prescription</h1>

      {/* Accordion: What makes a prescription valid? */}
      <div className="mb-lg border border-outline-variant/60 dark:border-outline/30 rounded-xl overflow-hidden bg-surface-container-lowest dark:bg-inverse-surface transition-all shadow-xs">
        <button
          onClick={() => setAccordionOpen(!accordionOpen)}
          className="w-full flex items-center justify-between p-md bg-surface-container-low dark:bg-surface-container hover:bg-surface-container transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-sm text-[#004782] dark:text-primary-fixed-dim font-bold">
            <span className="material-symbols-outlined text-2xl">help</span>
            <span className="font-label-md text-label-md">What makes a prescription valid?</span>
          </div>
          <span className="material-symbols-outlined transition-transform duration-300">
            {accordionOpen ? "expand_less" : "expand_more"}
          </span>
        </button>
        {accordionOpen && (
          <div className="p-lg border-t border-outline-variant/60 dark:border-outline/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md bg-white dark:bg-inverse-surface animate-[slide-down_0.2s_ease-out]">
            <div className="flex gap-sm items-start">
              <span className="material-symbols-outlined text-secondary">badge</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Doctor Info</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Doctor's full name and registration number.</p>
              </div>
            </div>
            <div className="flex gap-sm items-start">
              <span className="material-symbols-outlined text-secondary">domain</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Hospital Letterhead</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Hospital/clinic brand, details, and address.</p>
              </div>
            </div>
            <div className="flex gap-sm items-start">
              <span className="material-symbols-outlined text-secondary">patient_list</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Patient Details</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Patient's full name, age, and gender.</p>
              </div>
            </div>
            <div className="flex gap-sm items-start">
              <span className="material-symbols-outlined text-secondary">clinical_notes</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Medicine Specifications</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Clear dosage, strength, and duration details.</p>
              </div>
            </div>
            <div className="flex gap-sm items-start">
              <span className="material-symbols-outlined text-secondary">signature</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Doctor Signature</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Physician signature and physical seal/stamp.</p>
              </div>
            </div>
            <div className="flex gap-sm items-start">
              <span className="material-symbols-outlined text-secondary">calendar_today</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Prescription Date</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Valid prescription date (within 6 months).</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        {/* Left Column (70% approx) */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Card 1: Selected Prescriptions (Upload Area) */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/60 dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-lg">
            <h3 className="font-label-md text-label-md font-bold text-on-surface pb-sm border-b border-outline-variant/60">
              Selected Prescriptions
            </h3>

            {uploadedRxRecord ? (
              // Upload Success View
              <div className="space-y-lg">
                <div className="bg-secondary-container/20 border-2 border-secondary/20 rounded-xl p-lg space-y-md text-[#086b53]">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Prescription Uploaded Successfully</h3>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                        ID: {uploadedRxRecord.orderId || uploadedRxRecord.id || uploadedRxRecord._id}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md border-t border-secondary/10 text-body-sm text-on-surface-variant">
                    <p>Review Status: <span className="font-bold text-amber-600 font-mono uppercase bg-amber-50 px-sm py-0.5 rounded">{uploadedRxRecord.status}</span></p>
                    <p>Estimated Review Time: <span className="font-bold text-on-surface">5-10 minutes</span></p>
                  </div>
                </div>

                {/* Timeline status tracker */}
                <PrescriptionTimeline status={uploadedRxRecord.status} />

                <button
                  type="button"
                  onClick={() => setUploadedRxRecord(null)}
                  className="text-primary hover:text-primary-container font-semibold text-sm hover:underline flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  Upload Another Prescription
                </button>
              </div>
            ) : (
              // Drag and Drop Upload Area
              <div className="space-y-md">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("prescription-file-upload").click()}
                  className={`border-2 border-dashed rounded-xl p-xxl text-center cursor-pointer transition-all duration-200 bg-surface-container-low/50 hover:bg-surface-container-low/90 flex flex-col items-center justify-center space-y-md ${
                    dragActive ? "border-[#004782] bg-[#004782]/5" : "border-outline-variant hover:border-[#004782]"
                  }`}
                >
                  <input
                    type="file"
                    id="prescription-file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-full bg-primary-container/20 text-[#004782] flex items-center justify-center animate-bounce shadow-xs">
                    <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {uploadFile ? uploadFile.name : "Drag & drop your prescription here"}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-sm">
                      or click to browse from device (PDF, JPG, PNG up to 10MB)
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <div className="bg-error-container/20 border border-error/30 text-error p-md rounded-lg text-body-sm flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadFile && (
                  <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-md flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-secondary">check_circle</span>
                      <div>
                        <p className="font-label-md text-label-md font-bold text-on-surface truncate max-w-[200px] sm:max-w-xs">{uploadFile.name}</p>
                        <p className="text-xs text-on-surface-variant">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-md">
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        className="text-error hover:text-error/85 transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {uploadFile && (
                  <button
                    onClick={handleUploadSubmit}
                    disabled={uploading}
                    className="w-full bg-[#004782] text-white font-bold py-md rounded-xl hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-sm shadow-md"
                  >
                    {uploading ? (
                      <>
                        <Loader size="sm" color="white" />
                        Uploading Prescription ({uploadProgress}%)
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">cloud_upload</span>
                        Verify & Upload Prescription
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Saved Prescriptions */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/60 dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
            <h3 className="font-label-md text-label-md font-bold text-on-surface pb-sm border-b border-outline-variant/60 mb-lg">
              Saved Prescriptions
            </h3>

            {loadingRx ? (
              <div className="py-xl flex justify-center"><Loader size="lg" /></div>
            ) : savedPrescriptions.length === 0 ? (
              <div className="text-center py-xxl bg-surface-container-low/50 rounded-xl border border-outline-variant/40">
                <span className="material-symbols-outlined text-5xl text-outline mb-md">description</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold">No Saved Prescriptions</h4>
                <p className="font-body-sm text-on-surface-variant dark:text-surface-variant mt-sm">
                  Your uploaded prescription sheets will show up here for status tracking and checkout reference.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {savedPrescriptions.map((rx) => (
                  <PrescriptionCard
                    key={rx.id || rx._id}
                    prescription={rx}
                    onDelete={handleDeleteRx}
                    onPreview={(record) => window.open(record.fileUrl, "_blank")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (30% approx) */}
        <div className="space-y-lg">
          {/* Card 1: Need Support */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/60 dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md text-left">
            <h3 className="font-label-md text-label-md font-bold text-on-surface pb-sm border-b border-outline-variant/60 mb-lg">
              Need Support?
            </h3>
            <div className="space-y-md text-body-sm text-on-surface-variant">
              <a href="tel:+18005550199" className="flex items-center gap-md p-sm bg-surface-container-low/50 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface font-medium">
                <span className="material-symbols-outlined text-primary text-xl">call</span>
                <div>
                  <p className="text-xs opacity-75 leading-none">Toll Free Call</p>
                  <p className="mt-1">+1 (800) 555-0199</p>
                </div>
              </a>
              <a href="https://wa.me/18005550199" target="_blank" rel="noreferrer" className="flex items-center gap-md p-sm bg-surface-container-low/50 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface font-medium">
                <span className="material-symbols-outlined text-secondary text-xl">chat</span>
                <div>
                  <p className="text-xs opacity-75 leading-none">WhatsApp Chat</p>
                  <p className="mt-1">Connect Instantly</p>
                </div>
              </a>
              <a href="mailto:support@wellmeds.com" className="flex items-center gap-md p-sm bg-surface-container-low/50 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface font-medium">
                <span className="material-symbols-outlined text-primary text-xl">mail</span>
                <div>
                  <p className="text-xs opacity-75 leading-none">Email Support</p>
                  <p className="mt-1">support@wellmeds.com</p>
                </div>
              </a>
            </div>
          </div>

          {/* Card 2: Delivery Location */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/60 dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md text-left">
            <div className="flex justify-between items-center pb-sm border-b border-outline-variant/60 mb-lg">
              <h3 className="font-label-md text-label-md font-bold text-on-surface">Deliver to:</h3>
              <button
                type="button"
                onClick={() => { setNewAddressInput(address); setAddressModalOpen(true); }}
                className="text-primary text-xs font-bold hover:underline"
              >
                Change
              </button>
            </div>
            <div className="bg-surface-container-low/50 p-md rounded-lg border border-outline-variant/40 flex gap-sm items-start text-body-sm text-on-surface">
              <span className="material-symbols-outlined text-outline">location_on</span>
              <p className="leading-relaxed truncate-3-lines">{address}</p>
            </div>
          </div>

          {/* Card 3: Select Order Method */}
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/60 dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md text-left">
            <h3 className="font-label-md text-label-md font-bold text-on-surface pb-sm border-b border-outline-variant/60 mb-lg">
              Select Order Method
            </h3>
            <div className="flex flex-col gap-sm">
              <label
                className={`p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  orderMethod === "upload-and-order"
                    ? "border-primary bg-[#004782]/5 font-bold text-[#004782]"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-sm">
                  <input
                    type="radio"
                    name="orderMethod"
                    value="upload-and-order"
                    checked={orderMethod === "upload-and-order"}
                    onChange={() => setOrderMethod("upload-and-order")}
                    className="text-[#004782] focus:ring-[#004782] h-4 w-4"
                  />
                  <span className="font-body-sm text-sm">Upload Rx & Order</span>
                </div>
                <span className="material-symbols-outlined">local_mall</span>
              </label>

              <label
                className={`p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  orderMethod === "callback"
                    ? "border-primary bg-[#004782]/5 font-bold text-[#004782]"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-sm">
                  <input
                    type="radio"
                    name="orderMethod"
                    value="callback"
                    checked={orderMethod === "callback"}
                    onChange={() => setOrderMethod("callback")}
                    className="text-[#004782] focus:ring-[#004782] h-4 w-4"
                  />
                  <span className="font-body-sm text-sm">Request Pharmacist Callback</span>
                </div>
                <span className="material-symbols-outlined">phone_in_talk</span>
              </label>

              <label
                className={`p-md border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                  orderMethod === "assistance"
                    ? "border-primary bg-[#004782]/5 font-bold text-[#004782]"
                    : "border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-sm">
                  <input
                    type="radio"
                    name="orderMethod"
                    value="assistance"
                    checked={orderMethod === "assistance"}
                    onChange={() => setOrderMethod("assistance")}
                    className="text-[#004782] focus:ring-[#004782] h-4 w-4"
                  />
                  <span className="font-body-sm text-sm">Need Assistance</span>
                </div>
                <span className="material-symbols-outlined">support_agent</span>
              </label>
            </div>

            {/* Duration Dropdown */}
            <div className="pt-md border-t border-outline-variant/60 space-y-xs">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide">Supply Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-label-md text-on-surface focus:ring-primary cursor-pointer"
              >
                <option value="7">7 Days Supply</option>
                <option value="15">15 Days Supply</option>
                <option value="30">30 Days Supply</option>
                <option value="60">60 Days Supply</option>
                <option value="90">90 Days Supply</option>
              </select>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-[#004782] text-white font-bold h-12 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-sm shadow-lg sticky bottom-lg z-30"
          >
            <span>Continue Order</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Edit Shipping Address"
        maxWidth="max-w-md"
      >
        <div className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Full Shipping Address</label>
            <textarea
              value={newAddressInput}
              onChange={(e) => setNewAddressInput(e.target.value)}
              rows={4}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary"
              placeholder="Enter complete shipping address..."
            />
          </div>
          <div className="flex gap-sm pt-sm border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="flex-1 py-sm border border-outline-variant rounded-lg font-label-md text-sm hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAddress}
              className="flex-1 bg-[#004782] text-white py-sm rounded-lg font-label-md text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              Save Address
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UploadPrescriptionPage;
