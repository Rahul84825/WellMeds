/* eslint-disable no-restricted-globals */
/**
 * WellMeds Production Service Worker
 * Handles Web Push notifications and secure notification click navigation.
 */

// Safe fallback URL validation to prevent open-redirect or phishing
function getSafeInternalUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "/";
  }

  const trimmed = rawUrl.trim();

  // Safe relative paths (e.g. /profile?tab=orders, /admin/orders)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  // Same-origin absolute URLs
  try {
    const parsed = new URL(trimmed, self.location.origin);
    if (parsed.origin === self.location.origin) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch (err) {
    // Malformed URL, fall back safely
  }

  return "/";
}

// ─── 1. Push Event Listener ──────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || "WellMeds";
  const safeTargetUrl = getSafeInternalUrl(data.url);

  const options = {
    body: data.body || "You have a new notification from WellMeds.",
    icon: data.icon || "/favicon.png",
    badge: data.badge || "/favicon.png",
    vibrate: [100, 50, 100],
    data: {
      url: safeTargetUrl,
      type: data.type || "GENERAL",
      entityId: data.entityId || "",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── 2. Notification Click Listener ──────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetPath = getSafeInternalUrl(event.notification.data?.url);
  const targetFullUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Find if an existing WellMeds window is already open
        for (const client of clientList) {
          try {
            const clientUrl = new URL(client.url);
            if (clientUrl.origin === self.location.origin && "focus" in client) {
              return client.focus().then((focusedClient) => {
                if (focusedClient && "navigate" in focusedClient) {
                  return focusedClient.navigate(targetFullUrl);
                }
              });
            }
          } catch (err) {
            // Ignore cross-origin error
          }
        }

        // Otherwise open a new tab/window to the safe internal URL
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetFullUrl);
        }
      })
  );
});
