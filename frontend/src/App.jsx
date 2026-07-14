import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

// Context Providers
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { DrawerProvider } from "./context/DrawerContext";

import { Toaster } from "sonner";

// Routes
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";

/**
 * SyncBridge — registers cart sync callbacks with AuthContext
 * so they fire automatically after login/logout.
 * Must be rendered inside both providers.
 */
const SyncBridge = () => {
  const { registerLoginCallback, registerLogoutCallback } = useAuth();
  const { syncCartForUser, saveCartToLocalOnLogout } = useCart();

  useEffect(() => {
    const unsubCart = registerLoginCallback(syncCartForUser);
    const unsubCartLogout = registerLogoutCallback(saveCartToLocalOnLogout);

    return () => {
      unsubCart();
      unsubCartLogout();
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
      <CartProvider>
        <BrowserRouter>
          <DrawerProvider>
            <Toaster position="top-right" richColors closeButton />
            <ScrollToTop />
            <SyncBridge />
            <AppRoutes />
          </DrawerProvider>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
