import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Layers, 
  CheckCircle, 
  Image as ImageIcon,
  Sparkles,
  Info,
  RefreshCw,
  FolderMinus
} from "lucide-react";

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null means adding

  // Form Fields
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("pill");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("Active");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load admin categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddMode = () => {
    setEditingCategory(null);
    setName("");
    setIcon("pill");
    setDescription("");
    setImage("");
    setStatus("Active");
    setEditorOpen(true);
  };

  const openEditMode = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setIcon(cat.icon || "pill");
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setStatus(cat.status || "Active");
    setEditorOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setUploading(true);
    try {
      const secureUrl = await api.uploadImage(file);
      setImage(secureUrl);
    } catch (err) {
      console.error("Category image upload failed", err);
      alert("Failed to upload category image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = () => {
    setImage("");
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      icon,
      description: description.trim(),
      image,
      status,
      isActive: status === "Active"
    };

    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id || editingCategory._id, payload);
        alert("Category updated successfully.");
      } else {
        await api.createCategory(payload);
        alert("Category added successfully.");
      }
      setEditorOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const newStatus = cat.status === "Active" ? "Inactive" : "Active";
    try {
      await api.updateCategory(cat.id || cat._id, { 
        status: newStatus,
        isActive: newStatus === "Active"
      });
      setCategories(prev => prev.map(c => (c.id === cat.id || c._id === cat._id) ? { ...c, status: newStatus, isActive: newStatus === "Active" } : c));
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"? All assigned products will be unlinked.`)) {
      try {
        await api.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id && c._id !== id));
        alert("Category deleted successfully.");
      } catch (err) {
        console.error("Failed to delete category", err);
        alert("Failed to delete category.");
      }
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Layers className="text-[#004782]" />
            Product Categories
          </h1>
          <p className="text-xs text-slate-400 font-medium">Configure store sections, customize section illustrations, and view catalog inventory distribution.</p>
        </div>
        <button
          onClick={openAddMode}
          className="bg-primary text-white px-lg py-sm rounded-xl font-bold text-xs flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10 select-none cursor-pointer"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {categories.map((c) => {
          const categoryId = c.id || c._id;
          return (
            <div 
              key={categoryId} 
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-md shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all"
            >
              <div>
                {/* Header card with status/icon */}
                <div className="flex items-center justify-between mb-sm">
                  <span className="material-symbols-outlined text-[26px] text-primary dark:text-[#a4c9ff] bg-slate-50 dark:bg-zinc-950 p-xs rounded-xl border border-slate-100 dark:border-zinc-800">
                    {c.icon || "category"}
                  </span>
                  
                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                    c.status === "Active" || c.isActive
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}>
                    {c.status || "Active"}
                  </span>
                </div>

                {/* Body details */}
                <div className="flex gap-sm items-start mb-md">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {c.image ? (
                      <img src={c.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <ImageIcon size={20} className="text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-xs truncate">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 truncate">{c.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.count || 0} catalog products</p>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2" title={c.description}>
                      {c.description || "No description provided. Add one to describe this product category."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex items-center justify-between pt-sm border-t border-slate-100 dark:border-zinc-800/60 mt-sm">
                
                {/* Status Toggle */}
                <button
                  onClick={() => handleToggleStatus(c)}
                  className="flex items-center gap-xs text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  title="Toggle active state"
                >
                  {(c.status === "Active" || c.isActive) ? (
                    <>
                      <ToggleRight className="text-[#086b53] h-5 w-5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="text-slate-300 dark:text-zinc-700 h-5 w-5" />
                      <span>Inactive</span>
                    </>
                  )}
                </button>

                {/* Edit / Delete actions */}
                <div className="flex items-center gap-xs">
                  <button
                    onClick={() => openEditMode(c)}
                    className="p-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#004782] rounded-lg transition-colors"
                    title="Edit Category Details"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(categoryId, c.name)}
                    className="p-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal popup */}
      {editorOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl p-lg flex flex-col gap-md text-left animate-[scale-up_0.15s_ease-out]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-sm">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
                <Sparkles className="text-primary" size={18} />
                {editingCategory ? `Edit Category Settings` : "Create Product Category"}
              </h3>
              <button 
                onClick={() => setEditorOpen(false)}
                className="p-xs hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveCategory} className="space-y-md text-xs">
              
              {/* Category Name */}
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wellness Supplements"
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                />
              </div>

              {/* Icon & Status */}
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Icon Symbol</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
                  >
                    <option value="pill">Pill Capsule</option>
                    <option value="medical_services">Medical Case</option>
                    <option value="monitor_heart">Heart Rate</option>
                    <option value="medical_information">First Aid Info</option>
                    <option value="face">Skincare / Face</option>
                    <option value="spa">Wellness / Spa</option>
                    <option value="science">Lab / Science</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Default Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Section Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what medicines or healthcare supplies this section includes..."
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                />
              </div>

              {/* Category Image upload */}
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Illustration Image</label>
                <div className="flex gap-sm items-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative group">
                    {image ? (
                      <>
                        <img src={image} className="w-full h-full object-cover" alt="" />
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <ImageIcon size={20} className="text-slate-300" />
                    )}
                  </div>
                  
                  <div className="flex-grow flex flex-col gap-xs">
                    {uploading ? (
                      <div className="flex items-center gap-xs text-[10px] text-slate-400 animate-pulse font-bold">
                        <RefreshCw size={12} className="animate-spin" />
                        Uploading to Cloudinary...
                      </div>
                    ) : (
                      <>
                        <label className="bg-primary text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer w-fit">
                          Choose Image
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[9px] text-slate-400">PNG, JPG, WEBP. Max 10MB.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-sm pt-md border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-[#086b53] hover:bg-emerald-700 text-white font-bold py-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs"
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-bold py-sm rounded-xl transition-colors select-none"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCategories;
