import React from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { Lock } from "lucide-react";

const LoginRequiredModal = ({ 
  isOpen, 
  onClose, 
  fromPath = "/checkout", 
  message = "Please login to continue checkout.",
  cancelText = "Continue Browsing"
}) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login", { state: { from: fromPath } });
    onClose();
  };

  const handleRegisterClick = () => {
    navigate("/register", { state: { from: fromPath } });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true} title="Login Required">
      <div className="flex flex-col items-center text-center space-y-4 py-4 select-none">
        {/* Icon wrapper */}
        <div className="w-14 h-14 rounded-full bg-[#038076]/10 dark:bg-[#038076]/20 text-[#038076] dark:text-[#84d6b9] flex items-center justify-center animate-pulse">
          <Lock className="w-6 h-6" />
        </div>
        
        {/* Title / Description */}
        <p className="font-body-md text-sm leading-relaxed text-slate-500 dark:text-zinc-400 px-2 font-medium">
          {message}
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2 pt-2">
          <button
            onClick={handleLoginClick}
            className="w-full bg-[#038076] hover:bg-[#02655f] text-white py-2.5 px-4 rounded-xl text-[13px] font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
          >
            Login
          </button>
          <button
            onClick={handleRegisterClick}
            className="w-full bg-secondary-container/20 text-[#038076] hover:bg-[#038076]/10 py-2.5 px-4 rounded-xl text-[13px] font-bold border border-[#038076]/25 transition-all cursor-pointer active:scale-[0.98]"
          >
            Create Account
          </button>
          <button
            onClick={onClose}
            className="w-full border border-slate-200 dark:border-zinc-800 text-slate-550 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/50 py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all cursor-pointer active:scale-[0.98]"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginRequiredModal;
