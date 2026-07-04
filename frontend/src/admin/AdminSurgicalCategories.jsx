import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  Layers, 
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical
} from "lucide-react";

const AdminSurgicalCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = add

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("activity");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const fetchCategories = async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await api.adminGetSurgicalCategories({
        search: searchQuery,
        page,
        limit: ITEMS_PER_PAGE
      });
      setCategories(data.categories);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to load admin surgical categories", err);
      toast.error("Failed to load surgical categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [searchQuery, currentPage]);

  const slugifyText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingCategory) {
      setSlug(slugifyText(val));
    }
  };

  const openAddMode = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setIcon("activity");
    setDescription("");
    setImage("");
    setBannerImage("");
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setSeoTitle("");
    setSeoDescription("");
    setEditorOpen(true);
  };

  const openEditMode = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setIcon(cat.icon || "activity");
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setBannerImage(cat.bannerImage || "");
    setDisplayOrder(cat.displayOrder || 0);
    setIsActive(cat.isActive !== false);
    setSeoTitle(cat.seoTitle || "");
    setSeoDescription(cat.seoDescription || "");
    setEditorOpen(true);
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("File size exceeds 10MB limit.");
      return;
    }

    if (type === "image") setUploadingImage(true);
    else setUploadingBanner(true);

    try {
      const secureUrl = await api.uploadImage(file);
      if (type === "image") setImage(secureUrl);
      else setBannerImage(secureUrl);
      toast.success(`${type === "image" ? "Category Image" : "Banner Image"} uploaded!`);
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
      setUploadingBanner(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      slug: slug.trim() || slugifyText(name),
      icon,
      description: description.trim(),
      image,
      bannerImage,
      displayOrder: parseInt(displayOrder) || 0,
      isActive,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim()
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

  const handleToggleStatus = async (cat) => {
    const newActive = !cat.isActive;
    try {
      await api.updateSurgicalCategory(cat.id || cat._id, { isActive: newActive });
      setCategories(prev => 
        prev.map(c => (c.id === cat.id || c._id === cat._id) ? { ...c, isActive: newActive } : c)
      );
      toast.success(`Category ${newActive ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      console.error("Failed to toggle status", err);
      toast.error("Failed to update status.");
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

  // --- Drag & Drop Reordering ---
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (sourceIndex === targetIndex) return;

    const newCategories = [...categories];
    const [removed] = newCategories.splice(sourceIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    // Readjust display order to 1-indexed positions
    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      displayOrder: idx + 1
    }));

    setCategories(updatedCategories);

    try {
      await api.reorderSurgicalCategories(
        updatedCategories.map(c => ({ id: c.id || c._id, displayOrder: c.displayOrder }))
      );
      toast.success("Display order updated.");
    } catch (err) {
      console.error("Failed to save reordered list", err);
      toast.error("Failed to update ordering on database.");
    }
  };

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Layers className="text-[#004782]" />
            Surgical Categories
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Manage surgical sections, assign dynamic icons, upload custom banners, configure SEO settings, and drag rows to adjust order.
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

      {/* Search Header */}
      <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl px-sm py-1.5 w-full max-w-md">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by category name..."
          className="bg-transparent border-none outline-none w-full text-xs ml-xs dark:text-zinc-200"
        />
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl">
          <Layers size={40} className="text-slate-300 mx-auto mb-xs" />
          <p className="text-slate-400 font-medium text-xs">No surgical categories found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
                <th className="p-md w-12 text-center"></th>
                <th className="p-md">Category</th>
                <th className="p-md">Slug</th>
                <th className="p-md">Display Order</th>
                <th className="p-md">Products</th>
                <th className="p-md">Status</th>
                <th className="p-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => {
                const categoryId = c.id || c._id;
                return (
                  <tr 
                    key={categoryId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 transition-all cursor-move group"
                  >
                    <td className="p-md text-center text-slate-300 group-hover:text-slate-400">
                      <GripVertical size={16} className="mx-auto" />
                    </td>
                    <td className="p-md">
                      <div className="flex gap-sm items-center">
                        <div className="w-10 h-10 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {c.image ? (
                            <img src={c.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <ImageIcon size={14} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-zinc-100">{c.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-xs">
                            <span className="material-symbols-outlined text-xs text-primary dark:text-[#a4c9ff]">
                              {c.icon || "activity"}
                            </span>
                            <span>{c.icon || "activity"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-md font-mono text-slate-400 text-[11px]">{c.slug}</td>
                    <td className="p-md font-bold text-slate-600 dark:text-zinc-400">{c.displayOrder}</td>
                    <td className="p-md font-semibold text-[#004782] dark:text-[#a4c9ff]">
                      {c.productCount || 0} items
                    </td>
                    <td className="p-md">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                        c.isActive
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500"
                      }`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className="p-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                          title="Toggle Status"
                        >
                          {c.isActive ? (
                            <ToggleRight className="text-[#086b53] h-5 w-5" />
                          ) : (
                            <ToggleLeft className="text-slate-300 dark:text-zinc-700 h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditMode(c)}
                          className="p-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:text-[#004782] rounded-lg transition-colors"
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-md mt-md">
          <div className="text-slate-400 text-xs font-semibold">
            Showing Page {currentPage} of {totalPages} ({totalCount} total categories)
          </div>
          <div className="flex items-center gap-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-xs rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-xs rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl p-lg flex flex-col gap-md text-left animate-[scale-up_0.15s_ease-out] max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-sm">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
                <Sparkles className="text-[#004782]" size={18} />
                {editingCategory ? `Edit Surgical Category` : "Create Surgical Category"}
              </h3>
              <button 
                onClick={() => setEditorOpen(false)}
                className="p-xs hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="space-y-md text-xs">
              
              {/* Name & Slug */}
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Respiratory Care"
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slug (Editable) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(slugifyText(e.target.value))}
                    placeholder="e.g. respiratory-care"
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Icon & Display Order & Status */}
              <div className="grid grid-cols-3 gap-md">
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Icon Symbol (Material Icon)</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
                  >
                    <option value="activity">Activity Monitor</option>
                    <option value="wheelchair">Wheelchair</option>
                    <option value="walking">Walking Aid</option>
                    <option value="bed">Hospital Bed</option>
                    <option value="lungs">Lungs / Respiratory</option>
                    <option value="bone">Bone / Orthopedic</option>
                    <option value="scissors">Scissors / Instruments</option>
                    <option value="shield">Shield / PPE</option>
                    <option value="band_aid">Bandage / Wound Care</option>
                    <option value="syringe">Syringe / Needles</option>
                    <option value="stethoscope">Stethoscope / Diagnostics</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Status</label>
                  <select
                    value={isActive ? "true" : "false"}
                    onChange={(e) => setIsActive(e.target.value === "true")}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a description of this surgical products category..."
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                />
              </div>

              {/* Category Image & Banner Image */}
              <div className="grid grid-cols-2 gap-md">
                
                {/* Category Thumbnail Image */}
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Icon/Illustration</label>
                  <div className="flex gap-sm items-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative group">
                      {image ? (
                        <>
                          <img src={image} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={() => setImage("")}
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
                      {uploadingImage ? (
                        <div className="flex items-center gap-xs text-[10px] text-slate-400 animate-pulse font-bold">
                          <RefreshCw size={12} className="animate-spin" />
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <label className="bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer w-fit">
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUpload(e, "image")}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[9px] text-slate-400 font-medium">PNG, JPG, WEBP. Max 10MB.</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category Large Banner Image */}
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Banner Background</label>
                  <div className="flex gap-sm items-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative group">
                      {bannerImage ? (
                        <>
                          <img src={bannerImage} className="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={() => setBannerImage("")}
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
                      {uploadingBanner ? (
                        <div className="flex items-center gap-xs text-[10px] text-slate-400 animate-pulse font-bold">
                          <RefreshCw size={12} className="animate-spin" />
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <label className="bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer w-fit">
                            Choose Banner
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUpload(e, "banner")}
                              className="hidden"
                            />
                          </label>
                          <p className="text-[9px] text-slate-400 font-medium">PNG, JPG, WEBP. Max 10MB.</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* SEO Block */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-md space-y-md">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-200">SEO Configuration</h4>
                
                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Title Tag</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="e.g. Clinical Wheelchairs & Mobility Support - WellMeds"
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Provide a search engine snippet description..."
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-sm pt-md border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="submit"
                  disabled={saving || uploadingImage || uploadingBanner}
                  className="flex-1 bg-[#086b53] hover:bg-emerald-700 text-white font-bold py-sm rounded-xl transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs"
                >
                  {saving ? "Saving..." : "Save Surgical Category"}
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

export default AdminSurgicalCategories;
