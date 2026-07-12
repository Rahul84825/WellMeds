import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { openLoginModal, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in, redirect straight to their target or home
    if (user) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      }
      return;
    }

    const from = location.state?.from || "/";
    // Check if the path is route-protected to avoid infinite loops
    const isProtected = from.startsWith("/profile") || from.startsWith("/orders") || from.startsWith("/admin");
    const redirectPath = isProtected ? "/" : from;

    navigate(redirectPath, { replace: true });
    
    // Open the login modal on the page we redirected to
    setTimeout(() => {
      openLoginModal(isProtected ? from : null);
    }, 150);
  }, [user, isAdmin, navigate, location, openLoginModal]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f7f9fb] dark:bg-zinc-950">
      <div className="animate-pulse flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#038076] border-t-transparent animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
          Redirecting to secure login...
        </p>
      </div>
    </div>
  );
};

export default Login;
