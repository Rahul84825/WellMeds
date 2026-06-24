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
  const [editCurrentPw, setEditCurrentPw] = useState("");
  const [editNewPw, setEditNewPw] = useState("");
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
    setEditCurrentPw("");
    setEditNewPw("");
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
        currentPassword: editCurrentPw || undefined,
        newPassword: editNewPw || undefined,
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
      <div className="max-w-max-width mx-auto px-margin-desktop py-xxl text-center space-y-md">
        <span className="material-symbols-outlined text-5xl text-outline">lock</span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Please log in to view your profile</h2>
        <Link to="/login" className="inline-block bg-primary text-white px-xl py-sm rounded-lg font-label-md font-bold hover:opacity-90">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left space-y-xl">
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

        {/* Prescription Logs */}
        <div className="md:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <div className="flex items-center justify-between pb-md border-b border-outline-variant/60 mb-lg">
            <div>
              <h3 className="font-label-md text-label-md text-on-surface font-bold">Prescription Document Logs (Rx)</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">{prescriptions.length} document{prescriptions.length !== 1 ? "s" : ""} uploaded</p>
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
                className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-xs font-bold hover:bg-primary-container active:scale-95 transition-all flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                Upload New Rx
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant text-xs uppercase">
                  <th className="py-sm font-bold">Document Name</th>
                  <th className="py-sm font-bold">Date Uploaded</th>
                  <th className="py-sm font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 text-body-sm text-on-surface-variant dark:text-surface-variant">
                {loadingRx ? (
                  <tr>
                    <td colSpan="3" className="py-lg text-center">
                      <div className="flex justify-center py-md"><Loader size="sm" /></div>
                    </td>
                  </tr>
                ) : prescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-xl text-center">
                      <div className="space-y-sm">
                        <span className="material-symbols-outlined text-4xl text-outline block">description</span>
                        <p className="text-on-surface-variant/60">No prescription records found.</p>
                        <button
                          onClick={() => setUploadOpen(true)}
                          className="text-primary text-sm font-semibold hover:underline"
                        >
                          Upload your first prescription →
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((rx) => {
                    const { badge: badgeClass, dot: dotClass } = getRxStatusStyle(rx.status);
                    const displayDate = rx.date || (rx.createdAt
                      ? formatDate(rx.createdAt)
                      : "—");
                    return (
                      <tr key={rx.id || rx._id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-md font-semibold text-on-surface">
                          <div className="flex items-center gap-xs">
                            <span className="material-symbols-outlined text-outline text-[18px]">
                              {rx.fileType === "application/pdf" || rx.name?.endsWith(".pdf") ? "picture_as_pdf" : "image"}
                            </span>
                            <span className="truncate max-w-[180px]">{rx.name}</span>
                          </div>
                        </td>
                        <td className="py-md">{displayDate}</td>
                        <td className="py-md">
                          <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                            {rx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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

          <div className="pt-md border-t border-outline-variant/60 space-y-xs">
            <p className="text-label-sm font-semibold text-on-surface">Change Password <span className="font-normal text-on-surface-variant">(optional)</span></p>
            <input
              type="password"
              placeholder="Current password"
              value={editCurrentPw}
              onChange={(e) => setEditCurrentPw(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary"
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={editNewPw}
              onChange={(e) => setEditNewPw(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary"
            />
          </div>

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
