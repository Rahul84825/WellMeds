import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { getStatusConfig } from "../components/PrescriptionCard";
import { formatDate } from "../utils/date";

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected prescription for review
  const [selectedRx, setSelectedRx] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all prescriptions
  const fetchAllPrescriptions = async () => {
    setLoading(true);
    try {
      // Using the backend getAllPrescriptions endpoint
      const data = await api.getAllPrescriptions();
      setPrescriptions(data);
      if (data.length > 0 && !selectedRx) {
        setSelectedRx(data[0]);
        setAdminNotes(data[0].adminNotes || "");
      }
    } catch (err) {
      console.error("Failed to load admin prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPrescriptions();
  }, []);

  const handleSelectRx = (rx) => {
    setSelectedRx(rx);
    setAdminNotes(rx.adminNotes || "");
  };

  // Status transition handlers
  const handleApprove = async () => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      const updatedRx = await api.approvePrescription(selectedRx.id || selectedRx._id, adminNotes);
      alert(`Prescription for ${updatedRx.user?.name || "Patient"} approved successfully.`);
      
      // Update local state
      setPrescriptions((prev) =>
        prev.map((rx) => ((rx.id || rx._id) === (updatedRx.id || updatedRx._id) ? { ...rx, ...updatedRx } : rx))
      );
      setSelectedRx({ ...selectedRx, ...updatedRx });
    } catch (err) {
      console.error("Failed to approve prescription", err);
      alert("Failed to approve prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRx) return;
    if (!adminNotes.trim()) {
      alert("Please provide pharmacist/admin review notes explaining the rejection reason.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedRx = await api.rejectPrescription(selectedRx.id || selectedRx._id, adminNotes);
      alert(`Prescription for ${updatedRx.user?.name || "Patient"} rejected.`);
      
      // Update local state
      setPrescriptions((prev) =>
        prev.map((rx) => ((rx.id || rx._id) === (updatedRx.id || updatedRx._id) ? { ...rx, ...updatedRx } : rx))
      );
      setSelectedRx({ ...selectedRx, ...updatedRx });
    } catch (err) {
      console.error("Failed to reject prescription", err);
      alert("Failed to reject prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenericStatusUpdate = async (status) => {
    if (!selectedRx) return;
    setIsSubmitting(true);
    try {
      const updatedRx = await api.updatePrescriptionStatus(selectedRx.id || selectedRx._id, status, adminNotes);
      alert(`Prescription status updated to ${status}.`);
      setPrescriptions((prev) =>
        prev.map((rx) => ((rx.id || rx._id) === (updatedRx.id || updatedRx._id) ? { ...rx, ...updatedRx } : rx))
      );
      setSelectedRx({ ...selectedRx, ...updatedRx });
    } catch (err) {
      console.error("Failed to update prescription status", err);
      alert("Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered prescriptions list
  const filteredPrescriptions = prescriptions.filter((rx) => {
    // 1. Search text match (user name, email, or filename)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = rx.user?.name?.toLowerCase().includes(query);
      const matchEmail = rx.user?.email?.toLowerCase().includes(query);
      const matchFileName = rx.name?.toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchFileName) return false;
    }

    // 2. Status match
    if (statusFilter !== "all") {
      if (rx.status !== statusFilter) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const activeConfig = selectedRx ? getStatusConfig(selectedRx.status) : null;
  const isPDFSelected = selectedRx?.fileType === "application/pdf" || selectedRx?.name?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      {/* Page Header */}
      <div className="flex items-center gap-md mb-lg">
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Prescription Dispensing</h1>
        <span className="bg-surface-container-high dark:bg-surface-container text-on-surface-variant dark:text-surface-variant px-sm py-xs rounded-full font-label-sm text-label-sm">
          {prescriptions.length} Total Uploads
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md bg-surface-container-lowest dark:bg-inverse-surface p-lg rounded-xl shadow-sm border border-outline-variant dark:border-outline/40">
        <div className="flex flex-wrap items-center gap-sm flex-grow">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              placeholder="Search by patient name, email, or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-xl pr-md py-sm bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-lg font-body-sm text-sm text-on-surface w-full focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-md pr-xl py-sm bg-surface-container-low dark:bg-surface-container border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface focus:ring-primary dark:bg-inverse-surface"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Left (List of Uploads), Right (Preview & Review Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        {/* Left Column: Table List (60% approx) */}
        <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant dark:border-outline/40 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low dark:bg-surface-container-high border-b border-outline-variant dark:border-outline/40">
                <tr className="text-label-sm text-on-surface-variant uppercase tracking-wider text-xs">
                  <th className="p-md">Prescription ID</th>
                  <th className="p-md">Patient Details</th>
                  <th className="p-md">Date Uploaded</th>
                  <th className="p-md">Status</th>
                  <th className="p-md text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-outline/40 text-body-sm text-on-surface-variant dark:text-surface-variant">
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-xxl text-center">
                      <span className="material-symbols-outlined text-4xl text-outline mb-xs">inventory_2</span>
                      <p className="font-semibold text-on-surface">No Prescriptions Found</p>
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((rx) => {
                    const displayId = rx.id || rx._id;
                    const config = getStatusConfig(rx.status);
                    const isSelected = selectedRx && (selectedRx.id || selectedRx._id) === displayId;
                    const displayDate = rx.date || (rx.createdAt
                      ? formatDate(rx.createdAt)
                      : "—");
                    return (
                      <tr
                        key={displayId}
                        onClick={() => handleSelectRx(rx)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#004782]/5 border-l-4 border-[#004782]"
                            : "hover:bg-surface-container-low/30"
                        }`}
                      >
                        <td className="p-md font-bold text-on-surface font-mono text-xs">{displayId?.substring(0, 8)}...</td>
                        <td className="p-md">
                          <p className="font-semibold text-on-surface">{rx.user?.name || "Unknown Patient"}</p>
                          <p className="text-[11px] opacity-75">{rx.user?.email || "—"}</p>
                        </td>
                        <td className="p-md">{displayDate}</td>
                        <td className="p-md">
                          <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
                            {config.label}
                          </span>
                        </td>
                        <td className="p-md text-right font-semibold text-primary">Review →</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Review Details & Document Preview */}
        {selectedRx ? (
          <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/60 dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md text-left">
            <div className="flex justify-between items-start pb-sm border-b border-outline-variant/60">
              <div>
                <h3 className="font-label-md text-label-md font-bold text-on-surface">Review Prescription</h3>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">ID: {selectedRx.id || selectedRx._id}</p>
              </div>
              <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-xs font-semibold ${activeConfig.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeConfig.dot}`}></span>
                {activeConfig.label}
              </span>
            </div>

            {/* Document Preview Window */}
            <div className="border border-outline-variant/60 rounded-xl bg-surface-container-low overflow-hidden aspect-video flex flex-col items-center justify-center relative group">
              {isPDFSelected ? (
                <div className="flex flex-col items-center justify-center p-md">
                  <span className="material-symbols-outlined text-error text-5xl mb-sm">picture_as_pdf</span>
                  <p className="font-bold text-sm text-on-surface">{selectedRx.name}</p>
                  <a
                    href={selectedRx.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-md inline-flex items-center gap-xs px-md py-sm bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <>
                  <img
                    alt="Prescription Document"
                    className="w-full h-full object-contain"
                    src={selectedRx.fileUrl}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <a
                      href={selectedRx.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-xs px-md py-sm bg-white text-on-surface rounded-lg text-xs font-bold shadow"
                    >
                      <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                      View Full Size
                    </a>
                  </div>
                </>
              )}
            </div>

            {/* Patient Info */}
            <div className="bg-surface-container-low p-sm rounded-lg text-body-sm text-on-surface-variant space-y-1">
              <p>Patient Name: <span className="font-bold text-on-surface">{selectedRx.user?.name || "—"}</span></p>
              <p>Patient Email: <span className="font-bold text-on-surface">{selectedRx.user?.email || "—"}</span></p>
            </div>

            {/* Doctor Checklist verification block */}
            <div className="space-y-sm p-sm border border-outline-variant rounded-lg bg-surface-container-low/50">
              <h4 className="font-label-sm text-label-sm font-bold text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">assignment_turned_in</span>
                Physician Verification Checklist
              </h4>
              <ul className="text-body-sm text-on-surface-variant space-y-xs list-disc pl-md text-[12px]">
                <li>Doctor Full Name & Stamp present.</li>
                <li>Certified Registration Number readable.</li>
                <li>Patient Full Name matches account record.</li>
                <li>Prescribed medication names and strengths are legible.</li>
              </ul>
            </div>

            {/* Review Notes Area */}
            <div className="space-y-xs">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wide">Review Notes / Remarks</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter approval details or reason for rejection..."
                rows={3}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Decision Action buttons */}
            <div className="space-y-sm pt-sm border-t border-outline-variant/60">
              <div className="flex gap-sm">
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 bg-error text-white font-bold py-sm rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Reject Rx
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 bg-secondary text-white font-bold py-sm rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Approve Rx
                </button>
              </div>
              
              <div className="flex gap-sm pt-xs">
                <button
                  onClick={() => handleGenericStatusUpdate("Under Verification")}
                  disabled={isSubmitting}
                  className="flex-1 border border-outline-variant text-on-surface py-xs rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all"
                >
                  Mark Under Verification
                </button>
                <button
                  onClick={() => handleGenericStatusUpdate("Expired")}
                  disabled={isSubmitting}
                  className="flex-1 border border-outline-variant text-on-surface py-xs rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all"
                >
                  Mark Expired
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-xl bg-surface-container-low/30 rounded-xl border border-dashed border-outline-variant">
            <p className="text-on-surface-variant">Select a prescription to begin review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrescriptions;
