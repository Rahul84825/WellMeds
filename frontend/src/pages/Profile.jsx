import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Shared/Modal";
import PrescriptionUpload from "../components/Shared/PrescriptionUpload";

const Profile = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([
    { id: "rx-1", name: "prescription_insulin_may.pdf", date: "2026-05-12", status: "Verified" },
    { id: "rx-2", name: "lipitor_refill_2026.jpg", date: "2026-06-01", status: "Verified" }
  ]);
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleUploadSuccess = (data) => {
    const newRx = {
      id: `rx-${Date.now()}`,
      name: data.fileName,
      date: data.uploadDate.split("T")[0],
      status: "Pending Review"
    };
    setPrescriptions(prev => [newRx, ...prev]);
    setUploadOpen(false);
  };

  return (
    <div className="max-w-max-width mx-auto px-margin-desktop py-xl animate-[fade-in_0.3s_ease-out] text-left space-y-xl">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl items-start">
        {/* User Card */}
        <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <div className="flex flex-col items-center text-center space-y-sm">
            <div className="h-24 w-24 rounded-full bg-primary-container dark:bg-surface-container-highest border-2 border-primary/20 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-6xl text-primary">account_circle</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {user?.name || "Patient User"}
              </h3>
              <p className="text-body-sm text-secondary font-medium uppercase tracking-wide text-xs">
                {user?.role === "admin" ? "Pharmacist / Admin" : "Verified Client"}
              </p>
            </div>
          </div>
          
          <div className="pt-md border-t border-outline-variant/60 space-y-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            <p>Email: <span className="font-bold text-on-surface">{user?.email || "patient@example.com"}</span></p>
            <p>Member Since: <span className="font-bold text-on-surface">2026-06-01</span></p>
            <p>Address: <span className="font-bold text-on-surface">123 Health Ave, Austin, TX</span></p>
          </div>
        </div>

        {/* Prescription Verification History Logs */}
        <div className="md:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <div className="flex items-center justify-between pb-md border-b border-outline-variant/60 mb-lg">
            <h3 className="font-label-md text-label-md text-on-surface font-bold">
              Prescription Document Logs (Rx)
            </h3>
            <button
              onClick={() => setUploadOpen(true)}
              className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md text-xs font-bold hover:bg-primary-container active:scale-95 transition-all flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              Upload New Rx
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                  <th className="py-sm font-bold">Document Name</th>
                  <th className="py-sm font-bold">Date Uploaded</th>
                  <th className="py-sm font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 text-body-sm text-on-surface-variant dark:text-surface-variant">
                {prescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-surface-container-low/30">
                    <td className="py-md font-semibold text-on-surface flex items-center gap-xs">
                      <span className="material-symbols-outlined text-outline">description</span>
                      {rx.name}
                    </td>
                    <td className="py-md">{rx.date}</td>
                    <td className="py-md">
                      <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-xs font-semibold ${
                        rx.status === "Verified"
                          ? "bg-secondary-container/30 text-on-secondary-container"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rx.status === "Verified" ? "bg-secondary" : "bg-outline"}`}></span>
                        {rx.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default Profile;
