import apiInstance from "./api";

export const notificationService = {
  /**
   * Fetch public VAPID key from backend or environment
   */
  async getVapidPublicKey() {
    // Check client environment first
    const envKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (envKey) return envKey;

    try {
      const data = await apiInstance.get("/notifications/vapid-public-key");
      return data.publicKey || "";
    } catch (err) {
      console.warn("[PUSH] Failed to fetch VAPID key from server:", err.message);
      return "";
    }
  },

  /**
   * Register push subscription with authenticated backend user
   */
  async registerPushSubscription(subscription) {
    const data = await apiInstance.post("/notifications/push-subscribe", subscription);
    return data;
  },

  /**
   * Remove push subscription for this browser
   */
  async deletePushSubscription(endpoint) {
    const data = await apiInstance.post("/notifications/unsubscribe", { endpoint });
    return data;
  },

  /**
   * Fetch user notification preferences
   */
  async getNotificationPreferences() {
    const data = await apiInstance.get("/notifications/preferences");
    return data.preferences || { orderPush: true };
  },

  /**
   * Update user notification preferences
   */
  async updateNotificationPreferences(preferences) {
    const data = await apiInstance.put("/notifications/preferences", preferences);
    return data.preferences;
  },
};
