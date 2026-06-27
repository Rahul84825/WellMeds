import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FloatingWhatsApp from "../components/FloatingWhatsApp";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background text-on-surface transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* Global floating WhatsApp support button — customer pages only */}
      <FloatingWhatsApp />
    </div>
  );
};

export default MainLayout;
