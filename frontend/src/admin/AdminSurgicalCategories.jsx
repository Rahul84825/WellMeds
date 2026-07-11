import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { api, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Image as ImageIcon,
  RefreshCw,
  Layers
} from "lucide-react";

/**
 * AdminSurgicalCategories
 * 
 * Simplified surgical category management page.
 * Displays a minimal list (Image, Title, Actions) and restricts input to Title + Image.
 */
const AdminSurgicalCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = add

  // Form Fields
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Fetch up to 100 items to avoid pagination UI for typical surgical categories lists
      const data = await api.adminGetSurgicalCategories({
        page: 1,
        limit: 100
      });
      setCategories(data.categories);
    } catch (err) {
      console.error("Failed to load admin surgical categories", err);
      toast.error("Failed to load surgical categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const slugifyText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const openAddMode = () => {
    setEditingCategory(null);
    setName("");
    setImage("");
    setEditorOpen(true);
  };

  const openEditMode = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setImage(cat.image || "");
    setEditorOpen(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.warning(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setUploadingImage(true);
    try {
      const secureUrl = await api.uploadImage(file);
      setImage(secureUrl);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to upload image.";
      toast.error(errMsg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      slug: editingCategory?.slug || slugifyText(name.trim()),
      image,
      // Default necessary schema fields to avoid validation errors
      icon: editingCategory?.icon || "activity",
      description: editingCategory?.description || "",
      bannerImage: editingCategory?.bannerImage || "",
      displayOrder: editingCategory?.displayOrder || 0,
      isActive: editingCategory ? editingCategory.isActive : true,
      seoTitle: editingCategory?.seoTitle || "",
      seoDescription: editingCategory?.seoDescription || ""
    };

    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateSurgicalCategory(editingCategory.id || editingCategory._id, payload);
        toast.success("Surgical category updated successfully.");
      } else {
        await api.createSurgicalCategory(payload);
        toast.success("Surgical category added successfully.");
      }
      setEditorOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, catName) => {
    toast.warning(`Are you sure you want to delete category "${catName}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.deleteSurgicalCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id && c._id !== id));
            toast.success("Surgical category deleted successfully.");
          } catch (err) {
            console.error("Failed to delete category", err);
            toast.error(err.response?.data?.message || "Failed to delete surgical category.");
          }
        }
      }
    });
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Layers className="text-[#004782]" />
            Surgical Categories
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage surgical sections, customize titles, upload images, and control catalog section contents.
          </p>
        </div>
        <button
          onClick={openAddMode}
          className="bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/10 select-none cursor-pointer"
        >
          <Plus size={16} />
          Create Surgical Category
        </button>
      </div>

      {/* Categories Minimal Table */}
      {categories.length === 0 ? (
        <div className="text-center py-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl">
          <Layers size={40} className="text-slate-300 mx-auto mb-xs" />
          <p className="text-slate-400 font-medium text-xs">No surgical categories found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                <th className="p-md w-24">Image</th>
                <th className="p-md">Title</th>
                <th className="p-md text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const categoryId = c.id || c._id;
                return (
                  <tr 
                    key={categoryId}
                    className="border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-all"
                  >
                    <td className="p-md">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {c.image ? (
                          <img src={c.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon size={16} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-md align-middle">
                      <span className="font-extrabold text-slate-800 dark:text-zinc-100 text-sm">
                        {c.name}
                      </span>
                    </td>
                    <td className="p-md text-right align-middle">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => openEditMode(c)}
                          className="p-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#004782] rounded-lg transition-colors"
                          title="Edit Category"
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal popup */}
      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingCategory ? "Edit Surgical Category" : "Create Surgical Category"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-md text-xs pt-1">
          
          {/* Category Title */}
          <div className="space-y-xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wheelchair"
              className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
            />
          </div>

          {/* Category Image upload */}
          <div className="space-y-xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image</label>
            <div className="flex gap-sm items-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative group">
                {image ? (
                  <>
                    <img src={image} className="w-full h-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => setImage("")}
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
                {uploadingImage ? (
                  <div className="flex items-center gap-xs text-[10px] text-slate-400 animate-pulse font-bold">
                    <RefreshCw size={12} className="animate-spin" />
                    Uploading Image...
                  </div>
                ) : (
                  <>
                    <label className="bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer w-fit">
                      Choose Image
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[9px] text-slate-400">PNG, JPG, WEBP. Max 10MB.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-sm pt-md border-t border-slate-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex-1 bg-[#086b53] hover:bg-emerald-700 text-white font-bold py-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs"
            >
              {saving ? "Saving..." : "Save"}
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

export default AdminSurgicalCategories;
