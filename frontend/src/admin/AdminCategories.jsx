import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { api, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../services/api";
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
  const [uploadError, setUploadError] = useState(null);

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
    setUploadError(null);
    setEditorOpen(true);
  };

  const openEditMode = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setIcon(cat.icon || "pill");
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setStatus(cat.status || "Active");
    setUploadError(null);
    setEditorOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid image format. Please select a JPG, PNG, or WEBP file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`Image size too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const secureUrl = await api.uploadImage(file);
      if (secureUrl) {
        setImage(secureUrl);
        setUploadError(null);
      } else {
        throw new Error("No image URL returned");
      }
    } catch (err) {
      console.error("Category image upload failed", err);
      const errMsg = err?.response?.data?.message || err?.message || "Image upload failed. Please try again.";
      setUploadError(errMsg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteImage = () => {
    setImage("");
    setUploadError(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      image
    };

    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id || editingCategory._id, payload);
      } else {
        await api.createCategory(payload);
      }
      setEditorOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
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
      const targetId = cat._id || cat.id;
      setCategories(prev => prev.map(c => (c._id === targetId || c.id === targetId) ? { ...c, status: newStatus, isActive: newStatus === "Active" } : c));
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id && c._id !== id));
    } catch (err) {
      console.error("Failed to delete category", err);
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
    <div className="space-y-xl text-left">

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Layers className="text-[#157A6D]" />
            Product Categories
          </h1>
          <p className="text-xs text-slate-400 font-medium">Configure store sections, customize section illustrations, and view catalog inventory distribution.</p>
        </div>
        <button
          onClick={openAddMode}
          className="bg-[#157A6D] hover:bg-[#116459] text-white px-lg py-sm rounded-xl font-bold text-xs flex items-center gap-xs active:scale-95 transition-all shadow-md select-none cursor-pointer"
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
                {/* Body details */}
                <div className="flex gap-sm items-center mb-md">
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
      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingCategory ? "Edit Category Settings" : "Create Product Category"}
        maxWidth="max-w-lg"
      >
        {/* Form body */}
        <form onSubmit={handleSaveCategory} className="space-y-md text-xs pt-1">

          {/* Category Name */}
          <div className="space-y-xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                    <img src={image} className="w-full h-full object-cover" alt="Category illustration" />
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      title="Remove image"
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                  <div className="flex items-center gap-xs text-[11px] text-teal-600 dark:text-teal-400 animate-pulse font-bold">
                    <RefreshCw size={13} className="animate-spin" />
                    Optimizing & Uploading image...
                  </div>
                ) : (
                  <>
                    <label className="bg-[#157A6D] hover:bg-[#116459] text-white px-md py-1.5 rounded-xl font-bold text-[10px] active:scale-95 transition-all select-none cursor-pointer w-fit inline-flex items-center gap-1 shadow-sm">
                      <Upload size={12} />
                      Choose Image
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[9px] text-slate-400">PNG, JPG, WEBP. Max 10MB (Auto-compressed).</p>
                  </>
                )}
              </div>
            </div>
            {uploadError && (
              <div className="p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-[10px] font-medium mt-1">
                {uploadError}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-sm pt-md border-t border-slate-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 bg-[#157A6D] hover:bg-[#116459] text-white font-bold py-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs"
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
      </Modal>
    </div>
  );
};

export default ProductCategories;
