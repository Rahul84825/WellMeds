import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import Loader from "../../components/Loader";

const AddNewProduct = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vitamins");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !brand || !price || !stock || !image) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        name,
        category,
        brand,
        sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        price: parseFloat(price),
        stock: parseInt(stock),
        image,
        description
      };
      await api.createProduct(productData);
      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to add product.");
    } finally {
      setIsSaving(false);
    }
  };

  const allCategories = ["Prescription", "Vitamins", "Medical Devices", "First Aid", "Personal Care", "Supplements"];

  // Helper to load a dummy image URL for convenience
  const handleLoadPlaceholderImage = () => {
    setImage("https://lh3.googleusercontent.com/aida-public/AB6AXuBTt69PeIekAYrX5N8-YNwzS7BH5whbNSoyHZoTbwUKAD9PiRHhWb74WPdjkvHOvZIZeQB9Y3oTaNM8m7AreEk6RDEPKBaCT_AyHvi6-ejwKXmBMn8PRFZEhzERtvy1flJSykHMU83GvnicZJIvmI11I5htJiZ16XrMLf6az8UVqFZm0qpj1PGeZvYjhK5yVrit55XUfjphy30bqFNjK4ZREhtObZJ-9UZZgHxUp6ssis_MpTI9a27wx-iI-4IFDECyYGZ_KWVQPkRp");
  };

  return (
    <div className="space-y-xl animate-[fade-in_0.3s_ease-out] text-left">
      <div className="flex items-center gap-xs">
        <Link to="/admin/products" className="text-body-sm text-primary dark:text-primary-fixed-dim hover:underline flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Back to Products</span>
        </Link>
      </div>

      <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Add New Product</h1>

      <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-xl items-start">
        {/* Main Details Fields */}
        <div className="flex-1 w-full bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-lg shadow-sm space-y-md">
          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
              placeholder="e.g. Advanced Multi-Vitamin Complex"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm dark:bg-inverse-surface"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Brand Name *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                placeholder="e.g. HealthGuard"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">SKU Number</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                placeholder="e.g. VIT-HG-001 (Auto-gen if empty)"
              />
            </div>
            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-xs">
              <label className="block text-label-sm font-semibold text-on-surface">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <div className="flex justify-between items-center">
              <label className="block text-label-sm font-semibold text-on-surface">Product Image URL *</label>
              <button
                type="button"
                onClick={handleLoadPlaceholderImage}
                className="text-[12px] text-primary dark:text-primary-fixed-dim hover:underline"
              >
                Use Demo Placeholder Image
              </button>
            </div>
            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-xs">
            <label className="block text-label-sm font-semibold text-on-surface">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-sm bg-surface-container-low border border-outline-variant rounded-lg font-body-sm text-on-surface focus:ring-1 focus:ring-primary text-sm"
              placeholder="Enter product description and active medical formulation..."
            />
          </div>
        </div>

        {/* Right Panel Actions */}
        <div className="w-full lg:w-72 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline/40 rounded-xl p-md shadow-sm space-y-sm">
          <h4 className="font-label-md text-label-md text-on-surface font-bold">Actions</h4>
          
          {image && (
            <div className="border border-outline-variant/60 rounded-lg p-sm bg-surface-container-low text-center">
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-xs">Preview</p>
              <div className="aspect-square rounded overflow-hidden w-full h-36 bg-white flex items-center justify-center">
                <img
                  alt="Preview"
                  src={image}
                  className="max-w-full max-h-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/150?text=No+Image";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-sm pt-sm">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-secondary text-white font-bold py-md rounded-lg hover:bg-on-secondary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
            >
              {isSaving ? (
                <>
                  <Loader size="sm" color="white" />
                  Saving Product...
                </>
              ) : (
                "Save Product"
              )}
            </button>
            <Link
              to="/admin/products"
              className="block w-full text-center border border-outline-variant rounded-lg py-md text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddNewProduct;
