import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Star, 
  MoveUp, 
  MoveDown, 
  Plus, 
  Check, 
  X, 
  HelpCircle,
  Sparkles,
  PackageCheck,
  RefreshCw
} from "lucide-react";

const AddNewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vitamins");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [requiresRx, setRequiresRx] = useState(false);
  const [description, setDescription] = useState("");
  
  // Image list (contains URLs)
  const [images, setImages] = useState([]);
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null); // null or percentage
  const [dragOver, setDragOver] = useState(false);

  // Fetch product if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProductData = async () => {
        try {
          const product = await api.getProduct(id);
          if (product) {
            setName(product.name || "");
            setCategory(product.category || "Vitamins");
            setBrand(product.brand || "");
            setSku(product.sku || "");
            setPrice(product.price || "");
            setOriginalPrice(product.originalPrice || "");
            setStock(product.stock || "");
            setRequiresRx(product.requiresRx || false);
            setDescription(product.description || "");
            
            if (product.images && product.images.length > 0) {
              setImages(product.images);
              const idx = product.images.indexOf(product.image);
              setPrimaryImageIdx(idx !== -1 ? idx : 0);
            } else if (product.image) {
              setImages([product.image]);
              setPrimaryImageIdx(0);
            }
          }
        } catch (err) {
          console.error("Failed to load product data", err);
          toast.error("Failed to load product details.");
        } finally {
          setLoading(false);
        }
      };
      fetchProductData();
    }
  }, [id, isEditMode]);

  const allCategories = ["Prescription", "Vitamins", "Medical Devices", "First Aid", "Personal Care", "Supplements"];

  // Image Upload Action (Cloudinary via Backend controller)
  const handleImageFileChange = async (e, replaceIndex = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadProgress(10);
    try {
      const uploadedUrls = [];
      let step = Math.ceil(90 / files.length);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.warning(`File "${file.name}" exceeds 10MB limit.`);
          continue;
        }

        const secureUrl = await api.uploadImage(file);
        uploadedUrls.push(secureUrl);
        setUploadProgress(prev => Math.min(95, (prev || 10) + step));
      }

      if (uploadedUrls.length > 0) {
        if (replaceIndex !== null) {
          // Replace specific image
          setImages(prev => prev.map((url, idx) => idx === replaceIndex ? uploadedUrls[0] : url));
        } else {
          // Append new images
          setImages(prev => [...prev, ...uploadedUrls]);
        }
      }
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Failed to upload image. Please verify local environment.");
    } finally {
      setUploadProgress(null);
    }
  };

  // Drag and drop event handlers
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setUploadProgress(20);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.warning(`File "${file.name}" exceeds 10MB limit.`);
          continue;
        }
        const secureUrl = await api.uploadImage(file);
        uploadedUrls.push(secureUrl);
      }
      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to drop and upload image.");
    } finally {
      setUploadProgress(null);
    }
  };

  const deleteImage = (indexToDelete) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToDelete));
    if (primaryImageIdx === indexToDelete) {
      setPrimaryImageIdx(0);
    } else if (primaryImageIdx > indexToDelete) {
      setPrimaryImageIdx(prev => prev - 1);
    }
  };

  const reorderImage = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newImages = [...images];
    
    // Swap images
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);

    // Adjust primary image pointer
    if (primaryImageIdx === index) {
      setPrimaryImageIdx(targetIndex);
    } else if (primaryImageIdx === targetIndex) {
      setPrimaryImageIdx(index);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !brand || !price || !stock) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    const primaryImageUrl = images[primaryImageIdx] || "";
    if (!primaryImageUrl) {
      toast.warning("Please upload at least one image.");
      return;
    }

    const productData = {
      name: name.trim(),
      category,
      brand: brand.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      stock: parseInt(stock),
      requiresRx,
      image: primaryImageUrl,
      images: images,
      description: description.trim()
    };

    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.updateProduct(id, productData);
        toast.success("Product updated successfully!");
      } else {
        await api.createProduct(productData);
        toast.success("Product added successfully!");
      }
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
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
      
      {/* Back navigation */}
      <div className="flex items-center gap-xs">
        <Link to="/admin/products" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 flex items-center gap-xs font-semibold">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Header */}
      <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
        <Sparkles className="text-primary" size={24} />
        {isEditMode ? `Modify product: ${name}` : "Add New Catalog Product"}
      </h1>

      <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-lg items-start">
        
        {/* Left Form Panel */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
          
          <div className="space-y-xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
              placeholder="e.g. Paracetamol tablets 500mg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand Name *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="e.g. Cipla"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-md">
            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SKU Number</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono"
                placeholder="Auto-generated if blank"
              />
            </div>
            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">MRP Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="Show original price for discount comparison"
              />
            </div>
            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Count *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical Formulation / Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
              placeholder="Provide active formulation, strengths, precautions..."
            />
          </div>

          {/* requires prescription toggle option */}
          <div className="flex items-center gap-sm pt-sm border-t border-slate-100 dark:border-zinc-800">
            <input
              type="checkbox"
              id="requiresRx"
              checked={requiresRx}
              onChange={(e) => setRequiresRx(e.target.checked)}
              className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
            />
            <label htmlFor="requiresRx" className="text-xs font-bold text-slate-700 dark:text-zinc-200 select-none flex items-center gap-xs">
              Requires Prescription upload for dispensing (Rx verified supplement)
            </label>
          </div>
        </div>

        {/* Right Image Management Panel */}
        <div className="w-full lg:w-[350px] space-y-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl shadow-sm text-xs">
          
          <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Product Images</h4>
            <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-sm py-0.5 rounded text-slate-400 font-bold">Cloudinary</span>
          </div>

          {/* Drag & drop upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver 
                ? "border-primary bg-[#004782]/5" 
                : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
            }`}
          >
            <Upload size={24} className="text-slate-400 mb-xs" />
            <p className="font-semibold text-slate-700 dark:text-zinc-300">Drag & Drop Images here</p>
            <p className="text-[10px] text-slate-400 mt-xs mb-sm">Supports PNG, JPG, JPEG, WEBP up to 10MB</p>
            
            <label className="bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer">
              Choose Files
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => handleImageFileChange(e)}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="space-y-xs animate-pulse">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>Compressing & uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}

          {/* Thumbnail preview list */}
          <div className="space-y-sm">
            {images.map((url, index) => {
              const isPrimary = primaryImageIdx === index;
              return (
                <div 
                  key={index} 
                  className={`flex gap-sm p-xs rounded-xl border relative group transition-all ${
                    isPrimary 
                      ? "border-emerald-500 bg-emerald-500/[0.03]" 
                      : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20"
                  }`}
                >
                  <img src={url} className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-zinc-800" alt="" />
                  
                  <div className="flex-1 flex flex-col justify-between py-xs truncate">
                    <div className="flex justify-between items-center gap-xs truncate">
                      <span className="text-[10px] text-slate-400 font-bold truncate">Image #{index + 1}</span>
                      
                      {/* Reorder / Delete buttons */}
                      <div className="flex items-center gap-xs opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => reorderImage(index, "up")}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 rounded disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp size={12} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => reorderImage(index, "down")}
                          disabled={index === images.length - 1}
                          className="p-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 rounded disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown size={12} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => deleteImage(index)}
                          className="p-0.5 hover:bg-red-100 text-red-500 rounded"
                          title="Delete image reference"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-sm">
                      {/* Set as Primary toggle */}
                      <button
                        type="button"
                        onClick={() => setPrimaryImageIdx(index)}
                        className={`flex items-center gap-0.5 px-sm py-0.5 rounded text-[9px] font-black uppercase transition-colors ${
                          isPrimary 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-200 dark:bg-zinc-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-zinc-700"
                        }`}
                      >
                        <Star size={9} fill={isPrimary ? "white" : "none"} />
                        {isPrimary ? "Primary" : "Select Primary"}
                      </button>

                      {/* Replace option */}
                      <label className="text-[9px] font-bold text-primary dark:text-[#a4c9ff] hover:underline cursor-pointer select-none">
                        Replace
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={(e) => handleImageFileChange(e, index)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}

            {images.length === 0 && (
              <p className="text-[10px] text-slate-400 text-center py-sm">No images uploaded yet. Primary photo will represent this medicine card.</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-sm pt-md border-t border-slate-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#086b53] hover:bg-emerald-700 text-white font-bold py-sm rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Saving product...
                </>
              ) : (
                <>
                  <PackageCheck size={14} />
                  {isEditMode ? "Save Product Settings" : "Publish Product"}
                </>
              )}
            </button>
            <Link
              to="/admin/products"
              className="w-full text-center border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 font-bold py-sm rounded-xl text-xs transition-colors select-none"
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
