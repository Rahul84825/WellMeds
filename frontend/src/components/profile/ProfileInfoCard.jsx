import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Calendar, Loader2, CheckCircle2 } from "lucide-react";

const ProfileInfoCard = ({ className = "" }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setDob(user.dob || "");
      setGender(user.gender || "");
      setBloodGroup(user.bloodGroup || "");
    }
  }, [user]);

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setDob(user.dob || "");
      setGender(user.gender || "");
      setBloodGroup(user.bloodGroup || "");
    }
    setSuccessMsg("");
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    try {
      await updateProfile({
        name: name.trim(),
        dob: dob || undefined,
        gender: gender || undefined,
        bloodGroup: bloodGroup || undefined,
      });
      setSuccessMsg("Profile information saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to update profile info:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-xs space-y-6 text-left select-none ${className}`}>
      
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-100 font-sans tracking-tight">
          Profile Information
        </h3>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-5 py-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 text-white dark:text-zinc-200 text-xs font-bold hover:bg-slate-400 dark:hover:bg-zinc-600 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-1.5 rounded-full bg-[#157a6d] hover:bg-[#0f5c52] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-[fade-in_0.2s_ease-out]">
          <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        
        {/* Row 1, Col 1: Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-[#f4f5f7] dark:bg-zinc-800/80 border border-transparent focus:border-[#157a6d] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
          />
        </div>

        {/* Row 1, Col 2: BIRTH DATE (DOB) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            BIRTH DATE (DOB)
          </label>
          <div className="relative flex items-center">
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#f4f5f7] dark:bg-zinc-800/80 border border-transparent focus:border-[#157a6d] rounded-2xl px-4 py-3 pr-10 text-xs font-semibold text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
            <Calendar size={16} className="absolute right-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Row 2, Col 1: Gender */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-[#f4f5f7] dark:bg-zinc-800/80 border border-transparent focus:border-[#157a6d] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all cursor-pointer"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        {/* Row 2, Col 2: Blood Group */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
            Blood Group
          </label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full bg-[#f4f5f7] dark:bg-zinc-800/80 border border-transparent focus:border-[#157a6d] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 transition-all cursor-pointer"
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfoCard;
