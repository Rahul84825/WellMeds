import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  UserCheck, 
  ShieldAlert, 
  Filter, 
  Trash2,
  Mail,
  Calendar,
  Lock,
  UserCog
} from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load admin users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole, name) => {
    toast.warning(`Are you sure you want to change role of "${name}" to "${newRole}"?`, {
      action: {
        label: "Confirm",
        onClick: async () => {
          try {
            await api.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success("Role updated successfully.");
          } catch (err) {
            console.error("Failed to change role", err);
            toast.error("Failed to update user role.");
          }
        }
      }
    });
  };

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "All" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title */}
      <div className="border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
          <Users className="text-[#004782]" />
          User Management
        </h1>
        <p className="text-xs text-slate-400 font-medium">Verify registered accounts, assign administrative access, or configure pharmacist verification roles.</p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-300">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
          />
        </div>

        <div className="flex items-center gap-sm self-end sm:self-auto">
          <Filter size={16} className="text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none text-slate-600 dark:text-zinc-300"
          >
            <option value="All">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-md">Name</th>
                <th className="p-md">Email Address</th>
                <th className="p-md">Registered Date</th>
                <th className="p-md">User ID</th>
                <th className="p-md">Authorization Role</th>
                <th className="p-md text-right">Assign Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-md">
                    <div className="flex items-center gap-sm">
                      <div className="h-8 w-8 rounded-full bg-[#004782]/10 text-[#004782] dark:text-[#a4c9ff] flex items-center justify-center font-bold">
                        {u.name?.slice(0, 2).toUpperCase() || "US"}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-zinc-100">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-md">
                    <div className="flex items-center gap-xs">
                      <Mail size={14} className="text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="p-md">
                    <div className="flex items-center gap-xs">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{new Date(u.createdAt || Date.now()).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="p-md font-mono text-[10px] text-slate-400">{u._id}</td>
                  <td className="p-md">
                    <span className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      u.role === "admin" 
                        ? "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}>
                      {u.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </td>
                  <td className="p-md text-right">
                    <div className="flex justify-end items-center gap-sm">
                      <UserCog size={14} className="text-slate-400" />
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value, u.name)}
                        className="p-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-[10px] outline-none text-slate-600 dark:text-zinc-300 focus:border-primary font-bold cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-lg text-center text-slate-400">No registered users match your query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
