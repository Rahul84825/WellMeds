import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { api, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  X, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const AdminSpecialities = () => {
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // --- Form States ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [iconImage, setIconImage] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [richContentSections, setRichContentSections] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});

  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Fetch all specialities (paginated)
  const fetchSpecialities = async (page = currentPage) => {
    setLoading(true);
    try {
      const data = await api.adminGetSpecialities({
        search: searchQuery,
        page,
        limit: ITEMS_PER_PAGE,
      });
      setSpecialities(data.specialities);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to load specialities", err);
      toast.error("Failed to load specialities list.");
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        fetchSpecialities(currentPage);
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const openCreateModal = () => {
    setEditingSpec(null);
    setName("");
    setSlug("");
    setBannerImage("");
    setIconImage("");
    setShortDescription("");
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords("");
    setDisplayOrder(0);
    setActive(true);
    setRichContentSections([]);
    setCollapsedSections({});
    setIsModalOpen(true);
  };

  const openEditModal = (spec) => {
    setEditingSpec(spec);
    setName(spec.name || "");
    setSlug(spec.slug || "");
    setBannerImage(spec.bannerImage || "");
    setIconImage(spec.iconImage || "");
    setShortDescription(spec.shortDescription || "");
    setSeoTitle(spec.seoTitle || "");
    setSeoDescription(spec.seoDescription || "");
    setSeoKeywords(spec.seoKeywords || "");
    setDisplayOrder(spec.displayOrder || 0);
    setActive(spec.active !== false);
    setRichContentSections(spec.richContentSections || []);
    
    // Collapse all loaded sections by default
    const collapseMap = {};
    (spec.richContentSections || []).forEach((_, idx) => {
      collapseMap[idx] = true;
    });
    setCollapsedSections(collapseMap);
    
    setIsModalOpen(true);
  };

  // Image upload triggers
  const handleUploadImage = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.warning(`File size must not exceed ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    if (type === "icon") setUploadingIcon(true);
    else setUploadingBanner(true);

    try {
      const secureUrl = await api.uploadImage(file);
      if (type === "icon") {
        setIconImage(secureUrl);
        toast.success("Icon uploaded successfully!");
      } else {
        setBannerImage(secureUrl);
        toast.success("Banner image uploaded successfully!");
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || "Failed to upload image.";
      toast.error(errMsg);
    } finally {
      setUploadingIcon(false);
      setUploadingBanner(false);
    }
  };

  // --- Rich Content Repeater Helpers ---
  const addRichSection = () => {
    setRichContentSections(prev => [
      ...prev,
      { heading: "", richTextDescription: "", displayOrder: prev.length }
    ]);
    // Set the new section as expanded
    setCollapsedSections(prev => ({
      ...prev,
      [richContentSections.length]: false
    }));
  };

  const updateRichSection = (index, field, value) => {
    setRichContentSections(prev => 
      prev.map((sec, idx) => idx === index ? { ...sec, [field]: value } : sec)
    );
  };

  const deleteRichSection = (index) => {
    setRichContentSections(prev => prev.filter((_, idx) => idx !== index));
    // Readjust collapsed state map
    setCollapsedSections(prev => {
      const nextMap = {};
      Object.keys(prev).forEach(k => {
        const keyInt = parseInt(k);
        if (keyInt < index) nextMap[keyInt] = prev[keyInt];
        else if (keyInt > index) nextMap[keyInt - 1] = prev[keyInt];
      });
      return nextMap;
    });
  };

  const moveRichSection = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === richContentSections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newList = [...richContentSections];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    // Readjust display orders
    newList.forEach((item, idx) => {
      item.displayOrder = idx;
    });

    setRichContentSections(newList);

    // Swap collapse states
    setCollapsedSections(prev => ({
      ...prev,
      [index]: prev[targetIndex],
      [targetIndex]: prev[index]
    }));
  };

  const toggleSectionCollapse = (index) => {
    setCollapsedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Save speciality — refresh the current page
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.warning("Please provide both Name and Slug.");
      return;
    }

    // Clean rich content sections
    const cleanSections = richContentSections.filter(
      sec => sec.heading.trim() && sec.richTextDescription.trim()
    );

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      bannerImage,
      iconImage,
      shortDescription: shortDescription.trim(),
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoKeywords: seoKeywords.trim(),
      displayOrder: parseInt(displayOrder) || 0,
      active,
      richContentSections: cleanSections
    };

    try {
      if (editingSpec) {
        await api.updateSpeciality(editingSpec.id || editingSpec._id, payload);
        toast.success("Speciality updated successfully!");
      } else {
        await api.createSpeciality(payload);
        toast.success("Speciality created successfully!");
      }
      setIsModalOpen(false);
      fetchSpecialities();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save speciality.");
    }
  };

  // Toggle active inline
  const handleToggleActive = async (spec) => {
    try {
      await api.updateSpeciality(spec.id || spec._id, { active: !spec.active });
      setSpecialities(prev =>
        prev.map(s => (s._id === spec._id ? { ...s, active: !s.active } : s))
      );
      toast.success(`Speciality ${!spec.active ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle status.");
    }
  };

  // Delete Speciality
  const handleDelete = async (id, name) => {
    toast.warning(`Are you sure you want to permanently delete Speciality "${name}"? This removes its reference from all tagged products.`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.deleteSpeciality(id);
            setSpecialities(prev => prev.filter(s => s._id !== id && s.id !== id));
            toast.success("Speciality deleted successfully.");
          } catch (err) {
            console.error("Failed to delete speciality", err);
            toast.error("Failed to delete speciality.");
          }
        }
      }
    });
  };

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-slate-100 dark:border-zinc-800 pb-sm">
        <div>
          <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
            <Layers className="text-[#004782]" />
            Medical Specialities
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Configure dynamic, SEO-driven Clinical Speciality pages, upload custom medical icons/banners, and build rich-text medical content sections.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs flex items-center gap-xs hover:opacity-90 active:scale-95 transition-all shadow-md select-none cursor-pointer"
        >
          <Plus size={16} />
          Add Speciality
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm gap-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search specialities by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-xl pr-md py-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl text-xs outline-none"
          />
        </div>
        {totalCount > 0 && (
          <p className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">
            {totalCount} Specialit{totalCount === 1 ? "y" : "ies"}
          </p>
        )}
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : specialities.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-xl text-center shadow-sm">
          <Layers className="mx-auto text-slate-300 dark:text-zinc-700 mb-sm" size={48} />
          <h3 className="font-bold text-slate-700 dark:text-zinc-300 text-sm">No Specialities Found</h3>
          <p className="text-xs text-slate-400 mt-xs">Add a new medical speciality to configure structured storefront pages.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-md">Speciality</th>
                  <th className="p-md">Slug</th>
                  <th className="p-md">Display Order</th>
                  <th className="p-md">Product Count</th>
                  <th className="p-md">Status</th>
                  <th className="p-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-300">
                {specialities.map((s) => (
                  <tr key={s._id || s.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-md">
                      <div className="flex items-center gap-md">
                        {s.iconImage ? (
                          <div className="w-8 h-8 bg-slate-100 dark:bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200/55 dark:border-zinc-850 p-1">
                            <img alt={s.name} className="w-full h-full object-contain" src={s.iconImage} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-[#004782]/10 text-[#004782] rounded-lg flex items-center justify-center font-bold">
                            {s.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 dark:text-zinc-100">{s.name}</p>
                          {s.shortDescription && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{s.shortDescription}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-md font-mono text-[10px] text-slate-400">{s.slug}</td>
                    <td className="p-md font-semibold">{s.displayOrder}</td>
                    <td className="p-md">
                      <span className="bg-slate-100 dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 px-sm py-0.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                        {s.productCount} Products
                      </span>
                    </td>
                    <td className="p-md">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors select-none ${
                          s.active
                            ? "bg-emerald-50 border-emerald-200/50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400"
                            : "bg-slate-50 border-slate-200/50 text-slate-400 dark:bg-zinc-950/20 dark:border-zinc-800 dark:text-zinc-600"
                        }`}
                      >
                        <CheckCircle size={10} />
                        {s.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-sm text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-[#004782] dark:hover:text-[#a4c9ff] rounded-lg"
                          title="Edit Speciality"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id || s._id, s.name)}
                          className="p-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 px-lg py-md select-none text-xs font-bold text-slate-400">
              <p className="text-[10px]">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-xs">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="flex items-center gap-xs">
                  {getPageNumbers().map((pNum) => (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                        currentPage === pNum
                          ? "bg-[#004782] text-white shadow-md shadow-[#004782]/10"
                          : "hover:bg-slate-50 dark:hover:bg-zinc-950 text-slate-500"
                      }`}
                    >
                      {pNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-8 h-8 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  title="Last Page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSpec ? `Modify Speciality: ${editingSpec?.name}` : "Create Medical Speciality"}
        maxWidth="max-w-2xl"
      >
        {/* Form Body Scrollable */}
        <form onSubmit={handleSave} className="space-y-lg text-xs pt-1">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-md">
                  <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider pb-xs border-b border-slate-100 dark:border-zinc-800">
                    Basic Configuration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div className="space-y-xs">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speciality Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setName(val);
                          if (!editingSpec) {
                            const generatedSlug = val
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)+/g, "");
                            setSlug(generatedSlug);
                          }
                        }}
                        placeholder="e.g. Cardiology"
                        className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-xs">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Page Slug *</label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. cardiology"
                        className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Clinical Overview</label>
                    <textarea
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief overview explaining this medical specialty..."
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-md items-center pt-xs">
                    <div className="space-y-xs">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Order</label>
                      <input
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                        className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-xs pl-sm mt-md">
                      <input
                        type="checkbox"
                        id="activeCheckbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
                      />
                      <label htmlFor="activeCheckbox" className="font-bold text-slate-700 dark:text-zinc-200 select-none">
                        Active & Enabled in Site
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 3: Rich Content Repeater Builder */}
                <div className="space-y-md">
                  <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                    <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                      Rich Content Sections
                    </h3>
                    <button
                      type="button"
                      onClick={addRichSection}
                      className="flex items-center gap-xs bg-[#004782] text-white px-md py-1 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all cursor-pointer"
                    >
                      <Plus size={10} /> Add Block
                    </button>
                  </div>

                  {richContentSections.length === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-md text-center text-slate-400 text-[10px]">
                      No custom clinical blocks defined. Add sections below to write rich descriptions.
                    </div>
                  ) : (
                    <div className="space-y-sm">
                      {richContentSections.map((sec, idx) => {
                        const isCollapsed = collapsedSections[idx] !== false;
                        return (
                          <div 
                            key={idx} 
                            className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden transition-all duration-200"
                          >
                            {/* Accordion Trigger Header */}
                            <div className="px-md py-sm bg-slate-100/60 dark:bg-zinc-950 flex items-center justify-between border-b border-slate-200/40 dark:border-zinc-800/40">
                              <div className="flex items-center gap-xs flex-1 cursor-pointer select-none" onClick={() => toggleSectionCollapse(idx)}>
                                {isCollapsed ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronUp size={14} className="text-slate-400" />}
                                <span className="font-bold text-slate-700 dark:text-zinc-200 truncate">
                                  {sec.heading ? `Section ${idx + 1}: ${sec.heading}` : `New Section ${idx + 1}`}
                                </span>
                              </div>

                              {/* Action Items */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => moveRichSection(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-850 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-all"
                                  title="Move Up"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveRichSection(idx, "down")}
                                  disabled={idx === richContentSections.length - 1}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-850 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-all"
                                  title="Move Down"
                                >
                                  <ArrowDown size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteRichSection(idx)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500 transition-all"
                                  title="Delete Block"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Section Fields */}
                            {!isCollapsed && (
                              <div className="p-md space-y-md animate-[fade-in_0.2s_ease-out]">
                                <div className="space-y-xs">
                                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Heading *</label>
                                  <input
                                    type="text"
                                    required
                                    value={sec.heading}
                                    onChange={(e) => updateRichSection(idx, "heading", e.target.value)}
                                    placeholder="e.g. Core Indications & Usage"
                                    className="w-full p-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary rounded-xl outline-none"
                                  />
                                </div>
                                <div className="space-y-xs">
                                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rich Text Content * (Supports HTML/Paragraphs)</label>
                                  <textarea
                                    rows={4}
                                    required
                                    value={sec.richTextDescription}
                                    onChange={(e) => updateRichSection(idx, "richTextDescription", e.target.value)}
                                    placeholder="Detailed clinical explanation about this category section..."
                                    className="w-full p-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-primary rounded-xl outline-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 4: SEO Metadata */}
                <div className="space-y-md">
                  <h3 className="font-bold text-[11px] text-slate-400 uppercase tracking-wider pb-xs border-b border-slate-100 dark:border-zinc-800">
                    SEO & Meta Specifications
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div className="space-y-xs">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Meta Title</label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="e.g. Best Cardiology Drugs - WellMeds Store"
                        className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                      />
                    </div>

                    <div className="space-y-xs">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Meta Keywords</label>
                      <input
                        type="text"
                        value={seoKeywords}
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        placeholder="cardiology, heart medication, blood pressure, etc."
                        className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Meta Description</label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="e.g. Buy high-quality cardiology medications online. Get doctor-certified prescription heart medicines and blood pressure regulators delivered home..."
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                    />
                  </div>
                </div>

          {/* Modal Footer / Actions */}
          <div className="flex gap-sm pt-md border-t border-slate-100 dark:border-zinc-800 mt-md">
            <button
              type="submit"
              className="flex-1 bg-[#004782] hover:bg-opacity-95 text-white font-bold py-sm rounded-xl transition-all active:scale-95 select-none cursor-pointer flex items-center justify-center gap-xs"
            >
              {editingSpec ? "Update Speciality" : "Publish Speciality"}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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

export default AdminSpecialities;
