import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import HealthcareInformation from "../components/layout/HealthcareInformation";
import WhyWellMedsBar from "../components/common/WhyWellMedsBar";

const MainLayout = () => {
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

    // library / blog pages
    if (pathname.startsWith("/library") || pathname.startsWith("/blog")) return true;

    return false;
  };

  const isSEOEnabled = showSEOAndTrustBar();

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background text-on-surface transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {isSEOEnabled && (
        <>
          <WhyWellMedsBar />
          <HealthcareInformation />
        </>
      )}
      <Footer />
      {/* Global floating WhatsApp support button — customer pages only */}
      <FloatingWhatsApp />
    </div>
  );
};

export default MainLayout;
