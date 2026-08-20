import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import HealthcareInformation from "../components/layout/HealthcareInformation";
import AuthModal from "../components/auth/AuthModal";
import GlobalDrawer from "../components/GlobalDrawer";
import { useMedicineHelp } from "../hooks/useMedicineHelp";
import MedicineHelpPopup from "../components/MedicineHelpPopup";

const MainLayout = () => {
  const { isOpen, handleClose, lastSearchQuery } = useMedicineHelp();
  const location = useLocation();

  const showSEOAndTrustBar = () => {
    const pathname = location.pathname;

    // exact home page
    if (pathname === "/") return true;

    // category pages
    if (
      pathname.includes("/category/") ||
      pathname.includes("/surgical/") ||
      pathname.includes("/speciality") ||
      pathname === "/super-speciality"
    ) {
      return true;
    }

    // product details pages: matches "/products/:slug" (but not exactly "/products")
    if (pathname.startsWith("/products/") && pathname !== "/products") return true;

    // molecule detail pages
    if (pathname.startsWith("/molecules/") || pathname.startsWith("/molecule/")) return true;

    // library / blog pages
    if (pathname.startsWith("/library") || pathname.startsWith("/blog")) return true;

    return false;
  };

  const isSEOEnabled = showSEOAndTrustBar();
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/complete-profile" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/sign-in";

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background text-on-surface transition-colors duration-300">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {isSEOEnabled && (
        <>
          <HealthcareInformation />
        </>
      )}
      {!isAuthPage && <Footer />}
      {/* Global floating Auth Modal */}
      <AuthModal />
      {/* Global floating WhatsApp support button — customer pages only */}
      {!isAuthPage && <FloatingWhatsApp />}
      {/* Global App Drawer */}
      <GlobalDrawer />
      {/* Smart WhatsApp Medicine Assistance Popup */}
      <MedicineHelpPopup
        isOpen={isOpen}
        onClose={handleClose}
        lastSearchQuery={lastSearchQuery}
      />
    </div>
  );
};

export default MainLayout;
