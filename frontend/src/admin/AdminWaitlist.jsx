import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import Loader from "../components/Loader";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Mail,
  Download,
  Send,
  RefreshCw,
  Clock,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  X,
} from "lucide-react";

const AdminWaitlist = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifiedFilter, setNotifiedFilter] = useState("all"); // 'all' | 'notified' | 'pending'
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  // Broadcast email modal state
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("WellMeds Platform Launch & Early Access 🎉");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "We are excited to inform you that WellMeds is officially live! You can now browse super speciality medicines, upload prescriptions, and order online."
  );
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      let notifiedParam = "";
      if (notifiedFilter === "notified") notifiedParam = "true";
      if (notifiedFilter === "pending") notifiedParam = "false";

      const data = await api.getSubscribers({
        page,
        limit: 15,
        search: searchQuery,
        notified: notifiedParam,
      });

      setSubscribers(data.subscribers || []);
      setTotalPages(data.pages || 1);
      setTotalSubscribers(data.total || 0);
    } catch (err) {
      console.error("Failed to load waitlist subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page, notifiedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  const handleToggleNotified = async (id, currentStatus, email) => {
    try {
      await api.markSubscriberNotified(id);
      setSubscribers((prev) =>
        prev.map((sub) => (sub._id === id ? { ...sub, notified: !currentStatus } : sub))
      );
    } catch (err) {
      console.error("Failed to update subscriber status:", err);
    }
  };

  const handleDeleteSubscriber = async (id, email) => {
    try {
      await api.deleteSubscriber(id);
      setSubscribers((prev) => prev.filter((sub) => sub._id !== id));
      setSelectedIds((prev) => prev.filter((sId) => sId !== id));
    } catch (err) {
      console.error("Failed to delete subscriber:", err);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map((s) => s._id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.bulkDeleteSubscribers(selectedIds);
      setSelectedIds([]);
      fetchSubscribers();
    } catch (err) {
      console.error("Failed to delete selected subscribers:", err);
    }
  };

  const handleSendBroadcast = async () => {
    if (selectedIds.length === 0 || !broadcastSubject || !broadcastMessage) {
      return;
    }

    setSendingBroadcast(true);
    try {
      await api.bulkNotifySubscribers({
        ids: selectedIds,
        subject: broadcastSubject,
        message: broadcastMessage,
      });
      setIsNotifyModalOpen(false);
      setSelectedIds([]);
      fetchSubscribers();
    } catch (err) {
      console.error("Failed to send broadcast emails:", err);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      await api.exportSubscribersCSV();
    } catch (err) {
      console.error("Failed to export subscribers CSV:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-[#038076] dark:text-teal-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Waitlist Subscribers
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Manage early access waitlist users, send launch notifications, and export subscriber lists.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchSubscribers}
            className="p-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#157A6D]"
          />
        </form>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400">
            <Filter className="w-4 h-4" />
            <span>Status:</span>
          </div>
          <select
            value={notifiedFilter}
            onChange={(e) => {
              setNotifiedFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Subscribers ({totalSubscribers})</option>
            <option value="pending">Pending Notification</option>
            <option value="notified">Notified</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-950/40 border border-[#157A6D]/30 p-4 rounded-2xl animate-[fade-in_0.2s_ease-out]">
          <span className="text-xs font-semibold text-[#157A6D] dark:text-teal-400">
            {selectedIds.length} subscriber(s) selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsNotifyModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#157A6D] hover:bg-[#116459] text-white rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Bulk Notify</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Mail className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
              No waitlist subscribers found.
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              Subscribers will appear here when visitors submit their email on the coming-soon page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === subscribers.length && subscribers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 dark:border-zinc-700 text-[#157A6D] focus:ring-[#157A6D] cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Subscribed On</th>
                  <th className="p-4">Notification Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {subscribers.map((sub) => {
                  const isSelected = selectedIds.includes(sub._id);
                  return (
                    <tr
                      key={sub._id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition ${
                        isSelected ? "bg-teal-50/40 dark:bg-teal-900/10" : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(sub._id)}
                          className="rounded border-slate-300 dark:border-zinc-700 text-[#157A6D] focus:ring-[#157A6D] cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {sub.email}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-zinc-400 capitalize">
                        {sub.source?.replace("_", " ") || "Maintenance"}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-zinc-400">
                        {new Date(sub.createdAt || sub.subscribedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4">
                        {sub.notified ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Notified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleToggleNotified(sub._id, sub.notified, sub.email)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                            title={sub.notified ? "Mark as Pending" : "Mark as Notified"}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>
              Page {page} of {totalPages} ({totalSubscribers} total)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg font-medium disabled:opacity-50 transition cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg font-medium disabled:opacity-50 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Email Modal */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-zinc-800 relative">
            <button
              onClick={() => setIsNotifyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-900/30 text-[#157A6D] rounded-xl">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Send Launch Announcement
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Broadcasting email to {selectedIds.length} selected waitlist subscriber(s).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#157A6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Message Content (HTML Supported)
                </label>
                <textarea
                  rows={5}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#157A6D]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                disabled={sendingBroadcast}
                onClick={handleSendBroadcast}
                className="flex items-center space-x-1.5 px-4 py-2 bg-[#157A6D] hover:bg-[#116459] text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                {sendingBroadcast ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Broadcast Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWaitlist;
