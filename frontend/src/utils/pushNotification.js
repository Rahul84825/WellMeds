/**
 * Browser Web Push Utilities
 * Safely handles feature detection, service worker registration, and PushManager subscription.
 */

// Convert a base64url string into a Uint8Array required by applicationServerKey
export function urlBase64ToUint8Array(base64String) {
  if (!base64String || typeof base64String !== "string") {
    throw new Error("Invalid VAPID public key string.");
  }
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if browser supports Web Push, Service Worker, and Notification APIs
export function isPushNotificationSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Get the current permission state
export function getNotificationPermissionState() {
  if (!isPushNotificationSupported()) {
    return "NOT_SUPPORTED";
  }
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

// Register or get active service worker
export async function getOrRegisterServiceWorker() {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported by this browser.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });

  // Ensure service worker is ready
  await navigator.serviceWorker.ready;
  return registration;
}

// Get the current browser PushSubscription if one already exists
export async function getExistingPushSubscription() {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (err) {
    console.warn("[PUSH] Could not retrieve existing subscription:", err.message);
    return null;
  }
}

/**
 * Request notification permission and subscribe to browser PushManager.
 * Does NOT assume permission granted = subscription stored; returns serialized payload.
 */
export async function subscribeBrowserPush(vapidPublicKey) {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported on this browser.");
  }

  if (!vapidPublicKey) {
    throw new Error("VAPID public key is missing.");
  }

  // Explicit user permission prompt
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { permission, subscription: null };
  }

  const registration = await getOrRegisterServiceWorker();
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  // Check if an existing subscription already exists
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const rawJson = subscription.toJSON();
  const serialized = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: rawJson.keys?.p256dh || "",
      auth: rawJson.keys?.auth || "",
    },
  };

  return { permission: "granted", subscription: serialized };
}

/**
 * Unsubscribe current browser subscription from the PushManager.
 */
export async function unsubscribeBrowserPush() {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      return endpoint;
    }
    return null;
  } catch (err) {
    console.warn("[PUSH] Unsubscribe error in browser:", err.message);
    return null;
  }
}
