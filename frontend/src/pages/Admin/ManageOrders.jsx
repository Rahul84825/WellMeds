import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import Loader from "../../components/Loader";
import Modal from "../../components/Shared/Modal";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rx validation modal state
  const [selectedOrderForRx, setSelectedOrderForRx] = useState(null);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [rxVerifiedOrders, setRxVerifiedOrders] = useState(() => {
    const saved = localStorage.getItem("medishop_verified_rx_orders");
    return saved ? JSON.parse(saved) : {};
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load admin orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      alert(`Order status updated to: ${status}`);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update order status.");
    }
  };

  const handleVerifyRx = (orderId) => {
    const updated = { ...rxVerifiedOrders, [orderId]: true };
    setRxVerifiedOrders(updated);
    localStorage.setItem("medishop_verified_rx_orders", JSON.stringify(updated));
    setRxModalOpen(false);
    alert(`Prescription for Order ${orderId} has been verified!`);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Manage Orders</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">
            Dispense prescription items, inspect patient Rx sheets, and ship packages.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant dark:border-outline/40 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low dark:bg-surface-container-high border-b border-outline-variant dark:border-outline/40">
              <tr className="text-label-sm text-on-surface-variant uppercase tracking-wider text-xs">
                <th className="p-md">Order ID</th>
                <th className="p-md">Date Placed</th>
                <th className="p-md">Customer info</th>
                <th className="p-md">Items</th>
                <th className="p-md">Total Paid</th>
                <th className="p-md">Prescription (Rx)</th>
                <th className="p-md">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-outline/40 text-body-sm text-on-surface-variant dark:text-surface-variant">
              {orders.map((order) => {
                const isRxVerified = rxVerifiedOrders[order.id];
                return (
                  <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-md font-bold text-on-surface">{order.id}</td>
                    <td className="p-md">{order.date}</td>
                    <td className="p-md">
                      <p className="font-semibold text-on-surface">{order.customer}</p>
                      <p className="text-[11px] opacity-75 truncate max-w-[150px]">{order.email}</p>
                    </td>
                    <td className="p-md">
                      <div className="max-w-[200px] truncate">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="block text-xs truncate">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-md font-semibold text-on-surface">${order.total.toFixed(2)}</td>
                    <td className="p-md">
                      {order.rxUploaded ? (
                        <div className="space-y-xs">
                          <button
                            onClick={() => {
                              setSelectedOrderForRx(order);
                              setRxModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-xs px-sm py-0.5 rounded text-xs font-semibold hover:scale-102 transition-transform ${
                              isRxVerified
                                ? "bg-secondary-container/30 text-on-secondary-container"
                                : "bg-primary-container/20 text-primary animate-pulse"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isRxVerified ? "verified" : "prescriptions"}
                            </span>
                            <span>{isRxVerified ? "Rx Verified" : "Review Rx"}</span>
                          </button>
                          <p className="text-[10px] text-outline truncate max-w-[120px]" title={order.rxFile || "prescription.pdf"}>
                            {order.rxFile || "prescription.pdf"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-outline/50 text-xs">No Rx Needed</span>
                      )}
                    </td>
                    <td className="p-md">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg border-none focus:ring-1 py-1 pl-2 pr-6 cursor-pointer dark:bg-inverse-surface ${
                          order.status === "Delivered"
                            ? "bg-secondary-container/30 text-on-secondary-container focus:ring-secondary"
                            : order.status === "Processing"
                            ? "bg-primary-container/20 text-primary focus:ring-primary"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rx Viewer Verification Modal */}
      {selectedOrderForRx && (
        <Modal
          isOpen={rxModalOpen}
          onClose={() => setRxModalOpen(false)}
          title={`Verify Prescription: Order ${selectedOrderForRx.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-md text-left">
            <div className="bg-surface-container p-md rounded-xl space-y-sm border border-outline-variant/60">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider leading-none">Prescription Information</p>
              <h4 className="font-bold text-on-surface">{selectedOrderForRx.customer}</h4>
              <p className="text-body-sm text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px] text-outline">description</span>
                File Name: <span className="font-medium text-on-surface">{selectedOrderForRx.rxFile || "prescription.pdf"}</span>
              </p>
              <p className="text-body-sm text-on-surface-variant flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px] text-outline">calendar_today</span>
                Date Uploaded: <span className="font-medium text-on-surface">{selectedOrderForRx.date}</span>
              </p>
            </div>

            <div className="space-y-sm p-sm border border-outline-variant rounded-lg bg-surface-container-low/50">
              <h4 className="font-label-sm text-label-sm font-bold text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">assignment_turned_in</span>
                Verification Checklist
              </h4>
              <ul className="text-body-sm text-on-surface-variant space-y-xs list-disc pl-md text-[13px]">
                <li>Patient name matches shipping destination details.</li>
                <li>Prescription signed by a certified practitioner.</li>
                <li>Prescribed medication matches ordered prescription items.</li>
                <li>Dosage strength aligns with package specifications.</li>
              </ul>
            </div>

            <div className="flex gap-sm pt-sm border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setRxModalOpen(false)}
                className="flex-1 py-sm border border-outline-variant rounded-lg font-label-md text-sm hover:bg-surface-container-low transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleVerifyRx(selectedOrderForRx.id)}
                className="flex-1 bg-secondary text-white py-sm rounded-lg font-label-md text-sm font-bold hover:bg-on-secondary-container transition-all active:scale-95 flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Approve Rx
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageOrders;
