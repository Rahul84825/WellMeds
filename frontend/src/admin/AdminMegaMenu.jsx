import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  EyeOff,
  Link as LinkIcon,
  HelpCircle,
  PhoneCall,
  Activity,
  Handshake,
  Percent,
  FileText
} from "lucide-react";

const AdminMegaMenu = () => {
  const [menuData, setMenuData] = useState({
    conditions: [],
    specialities: [],
    sources: [],
    quickLinks: []
  });
  const [categories, setCategories] = useState([]);
  const [specialitiesList, setSpecialitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("conditions"); // "conditions" | "specialities" | "sources" | "quickLinks"

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null means adding

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [visible, setVisible] = useState(true);
  const [linkedCategory, setLinkedCategory] = useState("");
  const [linkedSpeciality, setLinkedSpeciality] = useState("");
  const [queryParam, setQueryParam] = useState("");
  const [route, setRoute] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [isHelpCard, setIsHelpCard] = useState(false);
  const [helpSubtext, setHelpSubtext] = useState("");

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminMegaMenu();
      setMenuData(data || { conditions: [], specialities: [], sources: [], quickLinks: [] });
    } catch (err) {
      console.error("Failed to load mega menu cms data", err);
      toast.error("Failed to load mega menu items.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportingData = async () => {
    try {
      const [cats, specs] = await Promise.all([
        api.getCategories(),
        api.getSpecialities()
      ]);
      setCategories(cats || []);
      setSpecialitiesList(specs || []);
    } catch (err) {
      console.error("Failed to load supporting categories/specialities", err);
    }
  };

  useEffect(() => {
    fetchMenuData();
    fetchSupportingData();
  }, []);

  const getActiveList = () => {
    if (activeTab === "conditions") return menuData.conditions;
    if (activeTab === "specialities") return menuData.specialities;
    if (activeTab === "sources") return menuData.sources;
    return menuData.quickLinks;
  };

  const getSectionTitle = () => {
    if (activeTab === "conditions") return "Medicines By Condition";
    if (activeTab === "specialities") return "Super Specialities";
    if (activeTab === "sources") return "Source Parameters";
    return "Quick Links";
  };

  const getItemType = () => {
    if (activeTab === "conditions") return "condition";
    if (activeTab === "specialities") return "speciality";
    if (activeTab === "sources") return "source";
    return "quick-link";
  };

  const openAddMode = () => {
    setEditingItem(null);
    setName("");
    setSlug("");
    setIcon("");
    setVisible(true);
    setLinkedCategory("");
    setLinkedSpeciality("");
    setQueryParam("");
    setRoute("");
    setIsExternal(false);
    setOpenInNewTab(false);
    setIsHelpCard(false);
    setHelpSubtext("");
    setEditorOpen(true);
  };

  const openEditMode = (item) => {
    setEditingItem(item);
    setName(item.name || "");
    setSlug(item.slug || "");
    setIcon(item.icon || "");
    setVisible(item.visible !== undefined ? item.visible : true);
    setLinkedCategory(item.linkedCategory || "");
    setLinkedSpeciality(item.linkedSpeciality || "");
    setQueryParam(item.queryParam || "");
    setRoute(item.route || "");
    setIsExternal(item.isExternal || false);
    setOpenInNewTab(item.openInNewTab || false);
    setIsHelpCard(item.isHelpCard || false);
    setHelpSubtext(item.helpSubtext || "");
    setEditorOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name/Title is required");
      return;
    }

    const type = getItemType();
    const payload = {
      type,
      name: name.trim(),
      slug: slug.trim() || undefined,
      icon: icon.trim(),
      visible,
      linkedCategory: type === "condition" ? linkedCategory : undefined,
      linkedSpeciality: type === "speciality" ? linkedSpeciality : undefined,
      queryParam: type === "source" ? queryParam.trim() : undefined,
      route: type === "quick-link" ? route.trim() : undefined,
      isExternal: type === "quick-link" ? isExternal : undefined,
      openInNewTab: type === "quick-link" ? openInNewTab : undefined,
      isHelpCard: type === "quick-link" ? isHelpCard : undefined,
      helpSubtext: type === "quick-link" && isHelpCard ? helpSubtext.trim() : undefined
    };

    setSaving(true);
    try {
      if (editingItem) {
        await api.updateMegaMenuItem(editingItem._id || editingItem.id, payload);
        toast.success("Item updated successfully.");
      } else {
        await api.createMegaMenuItem(payload);
        toast.success("Item added successfully.");
      }
      setEditorOpen(false);
      fetchMenuData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save menu item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id, title) => {
    toast.warning(`Are you sure you want to delete "${title}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.deleteMegaMenuItem(id);
            toast.success("Item deleted successfully.");
            fetchMenuData();
          } catch (err) {
            console.error("Delete failed", err);
            toast.error("Failed to delete item.");
          }
        }
      }
    });
  };

  const handleToggleVisible = async (item) => {
    const nextVal = !item.visible;
    try {
      await api.updateMegaMenuItem(item._id || item.id, { visible: nextVal });
      toast.success(`${item.name} is now ${nextVal ? "Visible" : "Hidden"}`);
      fetchMenuData();
    } catch (err) {
      console.error("Toggle visibility failed", err);
      toast.error("Failed to update visibility.");
    }
  };

  const handleMove = async (index, direction) => {
    const list = [...getActiveList()];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === list.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap items in local array
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Extract list of sorted IDs
    const ids = list.map(item => item._id || item.id);
    
    try {
      await api.reorderMegaMenuItems(ids);
      fetchMenuData();
    } catch (err) {
      console.error("Failed to reorder items", err);
      toast.error("Failed to save sorting order.");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-2">
            <Globe className="text-[#004782]" />
            <span>Medicines Mega Menu Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the conditions, super specialities, sources, and quick links rendered in the Medicines mega menu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMenuData}
            className="p-2 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-slate-600 dark:text-zinc-300 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={openAddMode}
            className="flex items-center gap-2 bg-[#004782] hover:bg-[#003866] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.98] shadow-sm select-none cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-2">
        {[
          { id: "conditions", label: "By Condition" },
          { id: "specialities", label: "Super Specialities" },
          { id: "sources", label: "Sources" },
          { id: "quickLinks", label: "Quick Links" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all whitespace-nowrap outline-none cursor-pointer ${
              activeTab === tab.id
                ? "border-[#004782] text-[#004782] dark:text-[#a4c9ff]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 select-none">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">{getSectionTitle()}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-zinc-900/30 select-none">
                  <th className="px-6 py-3">Sorting</th>
                  <th className="px-6 py-3">Title / Name</th>
                  <th className="px-6 py-3">Target Details</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-zinc-800 text-sm">
                {getActiveList().length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 select-none font-medium">
                      No items configured in this section. Click "Add Item" to create one.
                    </td>
                  </tr>
                ) : (
                  getActiveList().map((item, index) => (
                    <tr key={item._id || item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      {/* Reordering column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMove(index, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                              index === 0 ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMove(index, "down")}
                            disabled={index === getActiveList().length - 1}
                            className={`p-1 rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                              index === getActiveList().length - 1 ? "opacity-30 cursor-not-allowed" : ""
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                            {item.name}
                            {item.isHelpCard && (
                              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-50 text-emerald-700 font-extrabold rounded-md">Help Card</span>
                            )}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Slug: {item.slug || "n/a"}</span>
                        </div>
                      </td>

                      {/* Target configuration details */}
                      <td className="px-6 py-4">
                        {item.type === "condition" && (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-500">Linked Category: </span>
                            <span className="font-bold text-[#004782]">{item.linkedCategory || "None"}</span>
                          </div>
                        )}
                        {item.type === "speciality" && (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-500">Linked Speciality Slug: </span>
                            <span className="font-bold text-[#004782]">{item.linkedSpeciality || "None"}</span>
                          </div>
                        )}
                        {item.type === "source" && (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-500">Query Parameter: </span>
                            <span className="font-bold text-[#004782]">{item.queryParam || "None"}</span>
                          </div>
                        )}
                        {item.type === "quick-link" && (
                          <div className="flex flex-col gap-0.5 text-xs">
                            <div>
                              <span className="font-semibold text-slate-500">Route / Link: </span>
                              <span className="font-bold text-[#004782]">{item.route || "None"}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.isExternal ? "External Link" : "Internal Route"} 
                                {item.openInNewTab && " • Opens in new tab"}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 select-none">
                        <button
                          onClick={() => handleToggleVisible(item)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black cursor-pointer transition-colors ${
                            item.visible
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {item.visible ? (
                            <>
                              <Eye size={12} />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditMode(item)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                            title="Edit item"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id || item.id, item.name)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingItem ? `Edit ${getSectionTitle()} Item` : `Add ${getSectionTitle()} Item`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-left p-1">
          {/* Common Field: Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">
              {activeTab === "quickLinks" ? "Link Title" : "Item Name"}
            </label>
            <input
              type="text"
              required
              placeholder={activeTab === "quickLinks" ? "e.g. Upload Prescription" : "e.g. Cardiac Care"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
            />
          </div>

          {/* Common Field: Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">Slug (Optional)</label>
            <input
              type="text"
              placeholder="e.g. cardiac-care"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
            />
          </div>

          {/* Common Field: Icon */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide">Icon Name (optional)</label>
            <input
              type="text"
              placeholder="e.g. Heart, Globe, Handshake, Percent, FileText"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
            />
            <p className="text-[10px] text-slate-400 font-medium">Lucide icon name identifier (e.g. Globe, Activity, Heart, Handshake).</p>
          </div>

          {/* Condition specific: Linked Category selection */}
          {activeTab === "conditions" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide font-black">Linked Storefront Category</label>
              <select
                value={linkedCategory}
                onChange={(e) => setLinkedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
              >
                <option value="">-- Select Storefront Category --</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speciality specific: Linked Speciality selection */}
          {activeTab === "specialities" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide font-black">Linked Storefront Speciality</label>
              <select
                value={linkedSpeciality}
                onChange={(e) => setLinkedSpeciality(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
              >
                <option value="">-- Select Storefront Speciality --</option>
                {specialitiesList.map((s) => (
                  <option key={s._id || s.id} value={s.slug}>
                    {s.name} ({s.slug})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Source specific: Query Parameter text */}
          {activeTab === "sources" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide font-black">Query Parameter</label>
              <input
                type="text"
                placeholder="e.g. isImported=true"
                value={queryParam}
                onChange={(e) => setQueryParam(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
              />
            </div>
          )}

          {/* Quick Link specific fields */}
          {activeTab === "quickLinks" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wide font-black">Route / Link URL</label>
                <input
                  type="text"
                  placeholder="e.g. /offers or tel:+917420909445"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    id="isExternal"
                    checked={isExternal}
                    onChange={(e) => setIsExternal(e.target.checked)}
                    className="h-4 w-4 text-[#004782] border-slate-200 focus:ring-[#004782] rounded"
                  />
                  <label htmlFor="isExternal" className="text-xs font-bold text-slate-700 dark:text-zinc-300">External URL</label>
                </div>

                <div className="flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    id="openInNewTab"
                    checked={openInNewTab}
                    onChange={(e) => setOpenInNewTab(e.target.checked)}
                    className="h-4 w-4 text-[#004782] border-slate-200 focus:ring-[#004782] rounded"
                  />
                  <label htmlFor="openInNewTab" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Open in New Tab</label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    id="isHelpCard"
                    checked={isHelpCard}
                    onChange={(e) => setIsHelpCard(e.target.checked)}
                    className="h-4 w-4 text-[#004782] border-slate-200 focus:ring-[#004782] rounded"
                  />
                  <label htmlFor="isHelpCard" className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                    <span>Render as "Need Help" Card at Bottom</span>
                  </label>
                </div>

                {isHelpCard && (
                  <div className="flex flex-col gap-1.5 mt-2 animate-in slide-in-from-top-2 duration-150">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Help Subtext</label>
                    <input
                      type="text"
                      placeholder="e.g. Free support from licensed pharmacists."
                      value={helpSubtext}
                      onChange={(e) => setHelpSubtext(e.target.value)}
                      className="px-3 py-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#004782] focus:border-[#004782]"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Visibility toggle */}
          <div className="flex items-center gap-2 select-none pt-2">
            <input
              type="checkbox"
              id="visible"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="h-4 w-4 text-[#004782] border-slate-200 focus:ring-[#004782] rounded"
            />
            <label htmlFor="visible" className="text-xs font-bold text-slate-700 dark:text-zinc-300">Visible on Storefront Mega Menu</label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-zinc-800 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="px-4 py-2 border border-slate-250 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#004782] hover:bg-[#003866] text-white rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] outline-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              {saving ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminMegaMenu;
