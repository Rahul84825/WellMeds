import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Modal from "../components/Modal";
import PrescriptionUpload from "../components/PrescriptionUpload";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { formatDate } from "../utils/date";

// Format ISO date → "June 2026" (member since)
const formatMemberSince = (isoString) => {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  } catch {
    return isoString;
  }
};

// Status config matching backend enum
const getRxStatusStyle = (status) => {
  switch (status) {
    case "Approved":
      return { badge: "bg-secondary-container/30 text-on-secondary-container", dot: "bg-secondary" };
    case "Under Verification":
      return { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500" };
    case "Rejected":
      return { badge: "bg-error-container/20 text-error", dot: "bg-error" };
    case "Expired":
      return { badge: "bg-surface-container-high text-on-surface-variant", dot: "bg-outline" };
    default: // Pending Review
      return { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" };
  }
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingRx, setLoadingRx] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchRx = async () => {
      try {
        const data = await api.getMyPrescriptions();
        setPrescriptions(data);
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
      } finally {
        setLoadingRx(false);
      }
    };
    fetchRx();
  }, [user]);

  const handleUploadSuccess = (data) => {
    if (data.prescription) {
      setPrescriptions((prev) => [data.prescription, ...prev]);
    }
    setUploadOpen(false);
  };

  const handleOpenEdit = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setSaveError("");
    setSaveSuccess(false);
    setEditOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => { setEditOpen(false); setSaveSuccess(false); }, 1200);
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xxl text-center space-y-md">
        <span className="material-symbols-outlined text-5xl text-outline">lock</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Please log in to view your profile</h2>
        <Link to="/login" className="inline-block bg-primary text-white px-xl py-sm rounded-lg font-label-md font-bold hover:opacity-90">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left space-y-xl">
      <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl items-start">
        {/* User Info Card */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <div className="flex flex-col items-center text-center space-y-sm">
            <div className="h-24 w-24 rounded-full bg-primary-container dark:bg-surface-container-highest border-2 border-primary/20 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-6xl text-primary">account_circle</span>
              )}
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{user?.name || "—"}</h3>
              <p className="text-body-sm text-secondary font-medium uppercase tracking-wide text-xs">
                {user?.role === "admin" ? "Pharmacist / Admin" : "Verified Client"}
              </p>
            </div>
          </div>

          <div className="pt-md border-t border-outline-variant/60 space-y-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            {user?.mobile && (
              <p className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px] text-outline">phone_iphone</span>
                <span className="font-mono tracking-wider">+91 {user.mobile}</span>
              </p>
            )}
            <p className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-outline">mail</span>
              <span className="truncate">{user?.email || "—"}</span>
            </p>
            <p className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-outline">calendar_month</span>
              Member since {formatMemberSince(user?.createdAt)}
            </p>
            <p className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-outline">shield_person</span>
              {user?.role === "admin" ? "Admin access" : "Patient account"}
            </p>
          </div>

          <button
            onClick={handleOpenEdit}
            className="w-full flex items-center justify-center gap-xs border border-outline-variant rounded-lg py-sm text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit Profile
          </button>
        </div>

        {/* Prescription Logs - Premium Prescription Center */}
        <div className="md:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <div className="flex items-center justify-between pb-md border-b border-outline-variant/60 mb-lg">
            <div>
              <h3 className="font-label-md text-label-md text-on-surface font-bold text-base">Prescription Center</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{prescriptions.length} record{prescriptions.length !== 1 ? "s" : ""} found</p>
            </div>
            <div className="flex items-center gap-sm">
              <Link
                to="/upload-prescription"
                className="flex items-center gap-xs border border-outline-variant rounded-lg px-md py-sm text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                Full Rx Page
              </Link>
              <button
                onClick={() => setUploadOpen(true)}
                className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-xs font-bold hover:bg-primary-container active:scale-95 transition-all flex items-center gap-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                Upload New Rx
              </button>
            </div>
          </div>

          <div className="space-y-sm">
            {loadingRx ? (
              <div className="flex justify-center py-lg"><Loader size="sm" /></div>
            ) : prescriptions.length === 0 ? (
              <div className="py-xl text-center border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low/20">
                <div className="space-y-sm">
                  <span className="material-symbols-outlined text-4xl text-outline block">description</span>
                  <p className="text-on-surface-variant/60 text-sm font-semibold">No prescription records found.</p>
                  <button
                    onClick={() => setUploadOpen(true)}
                    className="text-primary text-sm font-semibold hover:underline cursor-pointer"
                  >
                    Upload your first prescription →
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {prescriptions.map((rx) => {
                  const { badge: badgeClass, dot: dotClass } = getRxStatusStyle(rx.status);
                  const uploadDate = rx.createdAt ? formatDate(rx.createdAt) : "—";
                  const verificationDate = rx.approvedAt 
                    ? formatDate(rx.approvedAt) 
                    : (rx.status === "Rejected" && rx.updatedAt ? formatDate(rx.updatedAt) : "—");
                  
                  return (
                    <div 
                      key={rx.id || rx._id} 
                      className="border border-outline-variant/50 dark:border-outline/30 rounded-2xl p-md bg-surface-container-low/10 hover:bg-surface-container-low/30 transition-all space-y-md flex flex-col justify-between"
                    >
                      {/* Header */}
                      <div className="space-y-sm">
                        <div className="flex justify-between items-start gap-xs pb-sm border-b border-outline-variant/30">
                          <div className="flex items-start gap-xs">
                            <span className="material-symbols-outlined text-outline text-[18px] mt-0.5">
                              {rx.fileType === "application/pdf" || rx.name?.endsWith(".pdf") ? "picture_as_pdf" : "image"}
                            </span>
                            <div>
                              <a 
                                href={rx.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-extrabold text-slate-800 dark:text-zinc-150 hover:underline hover:text-primary transition-all text-xs truncate max-w-[130px] block"
                                title={rx.name}
                              >
                                {rx.name}
                              </a>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                Size: {rx.fileSize ? `${(rx.fileSize / 1024).toFixed(1)} KB` : "—"}
                              </span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-[9px] font-bold ${badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                            {rx.status}
                          </span>
                        </div>

                        {/* Info details grid */}
                        <div className="grid grid-cols-2 gap-xs text-[10px] text-slate-500 dark:text-zinc-400">
                          <div>
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[8px]">Uploaded On</span>
                            <p className="font-bold text-slate-700 dark:text-zinc-200 mt-0.5">{uploadDate}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 uppercase tracking-wider text-[8px]">
                              {rx.status === "Rejected" ? "Rejected On" : "Verified On"}
                            </span>
                            <p className="font-bold text-slate-700 dark:text-zinc-200 mt-0.5">{verificationDate}</p>
                          </div>
                        </div>

                        {/* Rejected Reason block */}
                        {rx.status === "Rejected" && rx.adminNotes && (
                          <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-lg p-xs text-[10px] text-rose-600 dark:text-rose-400">
                            <span className="font-bold uppercase tracking-wider text-[8px] block text-rose-500">Rejection Reason</span>
                            <p className="mt-0.5">{rx.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Approved Medicines Snapshot */}
                      {rx.cartSnapshot && rx.cartSnapshot.items && (
                        <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/40 rounded-xl p-xs text-[10px] mt-auto">
                          <span className="font-bold text-slate-550 dark:text-zinc-400 uppercase tracking-wider text-[8px] block border-b border-slate-200/50 dark:border-zinc-800/60 pb-xs mb-xs">
                            Associated Medicines
                          </span>
                          <div className="space-y-xs max-h-24 overflow-y-auto custom-scrollbar">
                            {rx.cartSnapshot.items.map((med, index) => (
                              <div key={index} className="flex justify-between items-center text-[9px] text-slate-650 dark:text-zinc-300">
                                <span className="font-semibold truncate max-w-[130px]">{med.name}</span>
                                <span className="font-bold shrink-0">Qty: {med.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Upload Modal */}
      <Modal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Medical Prescription (Rx)"
        maxWidth="max-w-md"
      >
        <div className="space-y-md mb-lg text-left">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Upload your medical prescription file (signed by a licensed practitioner) for verification. Once verified by our pharmacists, you can order Rx-regulated items.
          </p>
        </div>
        <PrescriptionUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setUploadOpen(false)}
        />
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-md text-left">
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Full Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Email Address <span className="font-normal text-on-surface-variant">(optional)</span></label>
            <input
              type="email"
              placeholder="you@example.com"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary"
            />
          </div>

          {user?.mobile && (
            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Mobile Number</label>
              <div className="flex items-center gap-xs p-sm bg-surface-container border border-outline-variant/50 rounded-lg text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
                <span className="font-mono tracking-wider">+91 {user.mobile}</span>
                <span className="ml-auto text-xs text-on-surface-variant/60">(Contact support to change)</span>
              </div>
            </div>
          )}

          {saveError && (
            <div className="bg-error-container/20 text-error border border-error/30 rounded-lg p-sm text-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="bg-secondary-container/20 text-secondary border border-secondary/20 rounded-lg p-sm text-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Profile updated successfully!
            </div>
          )}

          <div className="flex gap-sm pt-sm">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="flex-1 border border-outline-variant rounded-lg py-sm text-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary text-white rounded-lg py-sm text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-xs"
            >
              {isSaving ? <><Loader size="sm" color="white" /> Saving...</> : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
