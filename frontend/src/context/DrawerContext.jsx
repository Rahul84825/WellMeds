import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api";

const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [menuData, setMenuData] = useState({
    conditions: [],
    specialities: [],
    sources: [],
    quickLinks: []
  });
  const [menuLoading, setMenuLoading] = useState(true);
  const location = useLocation();

  // Automatically close drawer when the route changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Fetch mega menu data once on mount (cache it)
  useEffect(() => {
    let active = true;
    const fetchMenu = async () => {
      try {
        const data = await api.getMegaMenu();
        if (active && data) {
          setMenuData(data);
        }
      } catch (err) {
        console.error("Failed to fetch Medicines mega menu", err);
      } finally {
        if (active) setMenuLoading(false);
      }
    };
    fetchMenu();
    return () => { active = false; };
  }, []);

  return (
    <DrawerContext.Provider value={{ isDrawerOpen, setIsDrawerOpen, menuData, menuLoading }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
};
