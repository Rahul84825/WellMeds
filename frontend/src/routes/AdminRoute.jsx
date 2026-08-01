import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

const isMaintenanceMode =
  import.meta.env.VITE_MAINTENANCE_MODE === "true" ||
  import.meta.env.MAINTENANCE_MODE === "true";

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    const loginPath = isMaintenanceMode ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
