import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import Loader from "../../components/Loader";

const ProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState("pill");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setIsSaving(true);
    try {
      const newCat = await api.createCategory(catName.trim(), catIcon);
      setCategories(prev => [...prev, newCat]);
      setCatName("");
      alert("Category added successfully!");
    } catch (err) {
      console.error("Failed to add category", err);
      alert("Failed to add category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await api.deleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
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
      <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Product Categories</h1>

      <div className="flex flex-col md:flex-row gap-xl items-start">
        {/* Left: Categories List Table */}
        <div className="flex-grow w-full bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant/60 mb-lg">
            Active Categories
          </h3>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant font-bold text-xs uppercase">
                  <th className="py-sm">Icon</th>
                  <th className="py-sm">Category Name</th>
                  <th className="py-sm">Items Count</th>
                  <th className="py-sm text-right text-xs">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 text-body-sm text-on-surface-variant dark:text-surface-variant">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/30">
                    <td className="py-md text-primary dark:text-primary-fixed-dim">
                      <span className="material-symbols-outlined text-[24px]">{c.icon}</span>
                    </td>
                    <td className="py-md font-bold text-on-surface">{c.name}</td>
                    <td className="py-md font-semibold">{c.count} items</td>
                    <td className="py-md text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-sm hover:bg-error-container/20 rounded-lg text-error transition-colors"
                        title="Delete Category"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Add Category Form */}
        <div className="w-full md:w-80 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <h3 className="font-label-md text-label-md text-on-surface font-bold pb-md border-b border-outline-variant/60 mb-lg">
            Add New Category
          </h3>
          <form onSubmit={handleAddCategory} className="space-y-md">
            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Category Name *</label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                placeholder="e.g. Antibiotics"
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Icon Symbol</label>
              <select
                value={catIcon}
                onChange={(e) => setCatIcon(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm dark:bg-inverse-surface"
              >
                <option value="pill">Pill Capsule (pill)</option>
                <option value="medical_services">Medical Case (medical_services)</option>
                <option value="monitor_heart">Heart Rate (monitor_heart)</option>
                <option value="medical_information">First Aid Info (medical_information)</option>
                <option value="face">Skincare / Face (face)</option>
                <option value="spa">Wellness / Spa (spa)</option>
                <option value="science">Lab / Science (science)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSaving || !catName.trim()}
              className="w-full bg-primary text-on-primary font-bold py-sm rounded-lg font-label-md hover:bg-primary-container active:scale-95 transition-all flex items-center justify-center gap-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader size="sm" color="white" />
                  Adding...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add Category</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductCategories;
