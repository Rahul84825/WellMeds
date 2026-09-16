import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  isPushNotificationSupported,
  getNotificationPermissionState,
  getExistingPushSubscription,
  subscribeBrowserPush,
  unsubscribeBrowserPush,
} from "../../utils/pushNotification";
import { api } from "../../services/api";

/**
 * NotificationSettingsCard
 * Handles browser Web Push permission, backend subscription synchronization,
 * and user transactional notification preferences.
 *
 * States handled:
 * - NOT_SUPPORTED: Browser lacks Push/Notification/SW API
 * - DEFAULT: Permission not requested yet
 * - DENIED: Browser permission blocked by user
 * - SUBSCRIBED: Permission granted + active subscription registered in backend
 * - UNSUBSCRIBED: Permission granted but device not registered
 * - ERROR: Subscription attempt failed
 */
const NotificationSettingsCard = ({
  isAdmin = false,
  title,
  description,
}) => {
  const isSupported = isPushNotificationSupported();

  const [permissionState, setPermissionState] = useState(() =>
    getNotificationPermissionState()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(() => isSupported);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }
  const [orderPushPreference, setOrderPushPreference] = useState(true);

  // Sync current device state with backend on mount
  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      if (!isSupported) return;

      try {
        const currentPermission = getNotificationPermissionState();
        if (!cancelled) setPermissionState(currentPermission);

        if (currentPermission === "granted") {
          const existingSub = await getExistingPushSubscription();
          if (!cancelled) setIsSubscribed(Boolean(existingSub));
        } else {
          if (!cancelled) setIsSubscribed(false);
        }

        // Fetch user preferences
        if (!isAdmin) {
          try {
            const prefs = await api.getNotificationPreferences();
            if (!cancelled && prefs && typeof prefs.orderPush === "boolean") {
              setOrderPushPreference(prefs.orderPush);
            }
          } catch {
            // Ignore preferences load error
          }
        }
      } catch (err) {
        console.warn("[PUSH] Status check error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, [isSupported, isAdmin]);

  // Handle Enable Notifications click (explicit user gesture)
  const handleEnablePush = async () => {
    setActionLoading(true);
    setStatusMessage(null);

    try {
      // 1. Fetch public VAPID key
      const vapidKey = await api.getVapidPublicKey();
      if (!vapidKey) {
        throw new Error("Unable to retrieve public notification credentials from server.");
      }

      // 2. Request browser permission and subscribe via PushManager
      const { permission, subscription } = await subscribeBrowserPush(vapidKey);
      setPermissionState(permission);

      if (permission === "denied") {
        setStatusMessage({
          type: "error",
          text: "Notifications are blocked. You can re-enable them anytime from your browser's site settings.",
        });
        setIsSubscribed(false);
        return;
      }

      if (permission === "granted" && subscription) {
        // 3. Register subscription with authenticated user in backend
        await api.registerPushSubscription(subscription);
        setIsSubscribed(true);
        setStatusMessage({
          type: "success",
          text: isAdmin
            ? "Operational alerts enabled successfully for this browser."
            : "Order updates enabled successfully for this browser.",
        });
      }
    } catch (err) {
      console.error("[PUSH] Enable failed:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to enable notifications. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Disable Notifications click
  const handleDisablePush = async () => {
    setActionLoading(true);
    setStatusMessage(null);

    try {
      // 1. Unsubscribe from browser PushManager
      const endpoint = await unsubscribeBrowserPush();

      // 2. Notify backend to remove this device's subscription
      if (endpoint) {
        await api.deletePushSubscription(endpoint);
      }

      setIsSubscribed(false);
      setStatusMessage({
        type: "info",
        text: "Notifications have been disabled on this browser.",
      });
    } catch (err) {
      console.error("[PUSH] Disable failed:", err);
      setStatusMessage({
        type: "error",
        text: "Could not completely remove subscription. Please refresh and try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle preference toggle (Order Updates ON/OFF)
  const handleToggleOrderPreference = async (e) => {
    const newValue = e.target.checked;
    setOrderPushPreference(newValue);
    try {
      await api.updateNotificationPreferences({ orderPush: newValue });
    } catch (err) {
      console.error("[PUSH] Failed to update preference:", err);
      // Revert on failure
      setOrderPushPreference(!newValue);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4 text-left">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={17} className="text-[#157A6D] shrink-0" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
            {title || (isAdmin ? "Admin Operational Web Push" : "Web Push Notifications")}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          {description ||
            (isAdmin
              ? "Receive real-time browser alerts on this device for new customer orders and prescription uploads."
              : "Receive instant updates on your orders and prescriptions even when WellMeds is in the background.")}
        </p>
      </div>

      {/* Inline Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-[fade-in_0.2s_ease-out] ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 text-emerald-800 dark:text-emerald-200"
              : statusMessage.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 text-rose-800 dark:text-rose-200"
              : "bg-slate-50 dark:bg-zinc-800 border border-slate-200 text-slate-700 dark:text-zinc-300"
          }`}
        >
          {statusMessage.type === "success" && (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          {statusMessage.type === "error" && (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Content States */}
      {!isSupported ? (
        // State 1: Browser Not Supported
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Push notifications aren't supported by this browser.</p>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              Your browser does not support the Web Push API. You will still receive all important
              updates via email and in your account dashboard.
            </p>
          </div>
        </div>
      ) : loading ? (
        // Loading skeleton
        <div className="py-3 flex items-center gap-2 text-xs text-slate-400">
          <RefreshCw size={13} className="animate-spin text-[#157A6D]" />
          <span>Checking device notification status...</span>
        </div>
      ) : permissionState === "denied" ? (
        // State 2: Permission Denied
        <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-200">
            <AlertCircle size={15} className="text-amber-500 shrink-0" />
            <span>Browser notifications are blocked</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            Notifications have been blocked in this browser. To enable them, open your browser's
            site settings for this page, set Notifications to "Allow", and reload the page.
          </p>
        </div>
      ) : (
        // State 3: Ready / Granted / Subscribed
        <div className="space-y-3">
          {/* Customer Preference Toggle (Only on customer profile) */}
          {!isAdmin && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-xl gap-3">
              <div className="min-w-0 pr-1">
                <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Order & Prescription Push Updates
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block mt-0.5 leading-tight">
                  Receive notifications when orders are confirmed, dispatched, or delivered.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={orderPushPreference}
                  onChange={handleToggleOrderPreference}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#157A6D]"></div>
              </label>
            </div>
          )}

          {/* Browser Device Registration Control */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Smartphone size={15} className="text-[#157A6D] shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                  This Browser / Device
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                  isSubscribed
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/50"
                    : "bg-slate-200/70 text-slate-600 dark:bg-zinc-700/60 dark:text-zinc-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSubscribed ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {isSubscribed ? "Active" : "Disabled"}
              </span>
            </div>

            {isSubscribed ? (
              <button
                type="button"
                onClick={handleDisablePush}
                disabled={actionLoading}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {actionLoading ? (
                  <RefreshCw size={13} className="animate-spin text-slate-500" />
                ) : (
                  <span>Disable on this device</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={actionLoading}
                className="w-full bg-[#157A6D] hover:bg-[#116459] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <Bell size={14} />
                    <span>Enable Notifications</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-zinc-500 pt-0.5">
        <ShieldCheck size={14} className="shrink-0 text-[#157A6D] mt-0.5" />
        <span className="leading-snug">
          WellMeds never sends promotional spam. Push alerts are strictly transactional.
        </span>
      </div>
    </div>
  );
};

export default NotificationSettingsCard;
