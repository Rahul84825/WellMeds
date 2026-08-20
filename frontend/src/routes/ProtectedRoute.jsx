import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

const ProtectedRoute = ({ children }) => {
  const { user, loading, profileComplete, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // If user is authenticated customer but required profile info (mobile) is incomplete
  if (!isAdmin && !profileComplete) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/complete-profile?returnTo=${returnTo}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
