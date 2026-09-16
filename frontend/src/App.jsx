import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { DrawerProvider } from "./context/DrawerContext";
import { AddressProvider } from "./context/AddressContext";
import { LocationProvider } from "./context/LocationContext";

// Routes
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";

import { isPushNotificationSupported, getExistingPushSubscription } from "./utils/pushNotification";
import { api } from "./services/api";

/**
 * SyncBridge — registers cart and push notification sync callbacks with AuthContext
 * so they fire automatically after login/logout for account-switching safety.
 * Must be rendered inside both providers.
 */
const SyncBridge = () => {
  const { registerLoginCallback, registerLogoutCallback } = useAuth();
  const { syncCartForUser, saveCartToLocalOnLogout } = useCart();

  useEffect(() => {
    const unsubCart = registerLoginCallback(syncCartForUser);
    const unsubCartLogout = registerLogoutCallback(saveCartToLocalOnLogout);

    // Reassign browser push subscription to the newly logged-in account
    const syncPushOnLogin = async () => {
      try {
        if (isPushNotificationSupported() && Notification.permission === "granted") {
          const sub = await getExistingPushSubscription();
          if (sub) {
            const rawJson = sub.toJSON();
            await api.registerPushSubscription({
              endpoint: sub.endpoint,
              keys: {
                p256dh: rawJson.keys?.p256dh || "",
                auth: rawJson.keys?.auth || "",
              },
            });
          }
        }
      } catch (err) {
        console.warn("[PUSH] Post-login sync notice:", err.message);
      }
    };

    // Remove subscription from logged-out user to prevent cross-account notification leaks
    const cleanupPushOnLogout = async () => {
      try {
        if (isPushNotificationSupported()) {
          const sub = await getExistingPushSubscription();
          if (sub) {
            await api.deletePushSubscription(sub.endpoint);
          }
        }
      } catch (err) {
        console.warn("[PUSH] Logout cleanup notice:", err.message);
      }
    };

    const unsubPushLogin = registerLoginCallback(syncPushOnLogin);
    const unsubPushLogout = registerLogoutCallback(cleanupPushOnLogout);

    return () => {
      unsubCart();
      unsubCartLogout();
      unsubPushLogin();
      unsubPushLogout();
    };
  }, [
    registerLoginCallback,
    registerLogoutCallback,
    syncCartForUser,
    saveCartToLocalOnLogout,
  ]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <AddressProvider>
        <LocationProvider>
          <CartProvider>
            <BrowserRouter>
              <DrawerProvider>
                <ScrollToTop />
                <SyncBridge />
                <AppRoutes />
              </DrawerProvider>
            </BrowserRouter>
          </CartProvider>
        </LocationProvider>
      </AddressProvider>
    </AuthProvider>
  );
}

export default App;
