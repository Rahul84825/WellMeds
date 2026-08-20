import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { api, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../services/api";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Check,
  Sparkles,
  Scissors,
  Layers,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertTriangle,
  FileText,
  ShieldCheck,
  CheckCircle,
  Info,
  PackageCheck
} from "lucide-react";

/**
 * AdminAddNewSurgicalProduct - Two-Column Layout (Left Form Content + Sticky Right Image Gallery & Save Actions)
 * Brand, Subcategory, Short Summary, and Stock input removed as requested.
 * Stock is fixed to 999 and controlled exclusively via In-Stock / Out-of-Stock toggle button.
 */
const AdminAddNewSurgicalProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  // Loading & Submission states
  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Surgical Categories list
  const [categoriesList, setCategoriesList] = useState([]);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    manufacturer: "",
    surgicalCategory: "",
    description: "",
    sku: "",
    inStock: true,
    isActive: true,
    isFeatured: false,
    tags: "",
    seoTitle: "",
    seoDescription: "",
  });

  // Images state: Array of string URLs
  const [images, setImages] = useState([]);
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);

  // Variants state: Array of { _id, name, mrp, sellingPrice, stock, sku }
  const [variants, setVariants] = useState([
    { name: "Standard", mrp: "", sellingPrice: "", stock: 999, sku: "" }
  ]);

  // Dynamic Highlights: Array of { label, value }
  const [highlights, setHighlights] = useState([
    { label: "Material", value: "" },
    { label: "Sterility", value: "Sterile" },
    { label: "Usage", value: "Clinical / Hospital" },
  ]);

  // Dynamic Specifications: Array of { label, value }
  const [specifications, setSpecifications] = useState([
    { label: "Grade", value: "Medical Grade" },
    { label: "Pack Size", value: "" },
  ]);

  // Fetch Surgical Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await api.getSurgicalCategories();
        setCategoriesList(cats || []);
      } catch (err) {
        console.error("Failed to load surgical categories", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Existing Product Data on Edit Mode
  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const prod = await api.getProduct(id);
        if (!isMounted || !prod) return;

        setFormData({
          name: prod.name || "",
          slug: prod.slug || "",
          manufacturer: prod.manufacturer || prod.brand || "",
          surgicalCategory: prod.surgicalCategory?._id || prod.surgicalCategory || "",
          description: prod.description || "",
          sku: prod.sku || "",
          inStock: prod.inStock !== false,
          isActive: prod.isActive !== false,
          isFeatured: Boolean(prod.isFeatured),
          tags: Array.isArray(prod.tags) ? prod.tags.join(", ") : (prod.tags || ""),
          seoTitle: prod.seo?.metaTitle || "",
          seoDescription: prod.seo?.metaDescription || "",
        });

        // Set Images
        const imgList = Array.isArray(prod.images) && prod.images.length > 0
          ? prod.images.filter(Boolean)
          : prod.image ? [prod.image] : [];
        setImages(imgList);

        const primIdx = prod.image ? imgList.indexOf(prod.image) : 0;
        setPrimaryImageIdx(primIdx >= 0 ? primIdx : 0);

        // Set Variants
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          setVariants(
            prod.variants.map((v) => ({
              _id: v._id,
              name: v.name || "",
              mrp: v.mrp !== undefined && v.mrp !== null ? String(v.mrp) : "",
              sellingPrice: v.sellingPrice !== undefined && v.sellingPrice !== null ? String(v.sellingPrice) : v.price !== undefined ? String(v.price) : "",
              stock: 999,
              sku: v.sku || "",
            }))
          );
        } else if (prod.price !== undefined) {
          setVariants([
            {
              name: "Standard",
              mrp: prod.originalPrice !== undefined ? String(prod.originalPrice) : "",
              sellingPrice: String(prod.price || ""),
              stock: 999,
              sku: prod.sku || "",
            }
          ]);
        }

        // Set Highlights
        if (Array.isArray(prod.highlights) && prod.highlights.length > 0) {
          setHighlights(prod.highlights.map(h => ({ label: h.label || "", value: h.value || "" })));
        }

        // Set Specifications
        if (Array.isArray(prod.specifications) && prod.specifications.length > 0) {
          setSpecifications(prod.specifications.map(s => ({ label: s.label || "", value: s.value || "" })));
        }
      } catch (err) {
        console.error("Failed to load surgical product for editing", err);
        setErrorMessage("Could not load surgical product details. Please try again.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [id, isEditMode]);

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ── Image Handling Actions ──
  const handleImageFileChange = async (e, replaceIndex = null) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`File "${file.name}" exceeds maximum allowed size of ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
    }

    setUploadProgress(15);
    setErrorMessage("");

    try {
      const uploadedUrls = [];
      const step = Math.ceil(80 / files.length);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const secureUrl = await api.uploadImage(file);
        if (secureUrl) uploadedUrls.push(secureUrl);
        setUploadProgress(prev => Math.min(95, (prev || 15) + step));
      }

      if (uploadedUrls.length > 0) {
        if (replaceIndex !== null) {
          setImages(prev => prev.map((url, idx) => idx === replaceIndex ? uploadedUrls[0] : url));
        } else {
          setImages(prev => [...prev, ...uploadedUrls]);
        }
      }
    } catch (err) {
      console.error("Image upload failed", err);
      setErrorMessage("Failed to upload image(s). Please check network or file format.");
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    setUploadProgress(20);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) continue;
        const secureUrl = await api.uploadImage(file);
        if (secureUrl) uploadedUrls.push(secureUrl);
      }
      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      console.error("Drop upload error", err);
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
    setImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });

    if (primaryImageIdx === index) {
      setPrimaryImageIdx(targetIndex);
    } else if (primaryImageIdx === targetIndex) {
      setPrimaryImageIdx(index);
    }
  };

  // ── Variant Actions ──
  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      { name: "", mrp: "", sellingPrice: "", stock: 999, sku: "" }
    ]);
  };

  const handleUpdateVariant = (index, field, value) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (indexToRemove) => {
    if (variants.length <= 1) {
      alert("At least one variant row is required.");
      return;
    }
    setVariants(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ── Dynamic Highlights Actions ──
  const handleAddHighlight = () => {
    setHighlights(prev => [...prev, { label: "", value: "" }]);
  };

  const handleUpdateHighlight = (index, field, value) => {
    setHighlights(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveHighlight = (indexToRemove) => {
    setHighlights(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ── Dynamic Specifications Actions ──
  const handleAddSpecification = () => {
    setSpecifications(prev => [...prev, { label: "", value: "" }]);
  };

  const handleUpdateSpecification = (index, field, value) => {
    setSpecifications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveSpecification = (indexToRemove) => {
    setSpecifications(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ── Save Form ──
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }
    if (!formData.surgicalCategory) {
      setErrorMessage("Please select a Surgical Category.");
      return;
    }
    if (variants.length === 0) {
      setErrorMessage("At least one variant is required.");
      return;
    }

    const validatedVariants = [];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name || !v.name.trim()) {
        setErrorMessage(`Variant #${i + 1}: Name is required.`);
        return;
      }
      const mrpNum = parseFloat(v.mrp);
      const priceNum = parseFloat(v.sellingPrice);

      if (isNaN(priceNum) || priceNum < 0) {
        setErrorMessage(`Variant "${v.name}": Selling price must be a valid non-negative number.`);
        return;
      }
      if (!isNaN(mrpNum) && mrpNum >= 0 && priceNum > mrpNum) {
        setErrorMessage(`Variant "${v.name}": Selling price (₹${priceNum}) cannot exceed MRP (₹${mrpNum}).`);
        return;
      }

      const effectiveMrp = !isNaN(mrpNum) && mrpNum >= 0 ? mrpNum : priceNum;
      const discount = effectiveMrp > priceNum ? Math.round(((effectiveMrp - priceNum) / effectiveMrp) * 100) : 0;

      validatedVariants.push({
        _id: v._id,
        name: v.name.trim(),
        mrp: effectiveMrp,
        price: priceNum,
        sellingPrice: priceNum,
        stock: formData.inStock ? 999 : 0,
        discount,
        sku: v.sku?.trim() || "",
      });
    }

    const tagsArray = formData.tags
      ? formData.tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    const cleanHighlights = highlights.filter(h => h.label.trim() && h.value.trim());
    const cleanSpecifications = specifications.filter(s => s.label.trim() && s.value.trim());

    const resolvedPrimaryImage = images[primaryImageIdx] || images[0] || "";
    const primarySellingPrice = validatedVariants[0].sellingPrice;
    const primaryMrp = validatedVariants[0].mrp;

    const manufacturerClean = formData.manufacturer.trim() || "WellMeds";

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug?.trim() || undefined,
      brand: manufacturerClean,
      manufacturer: manufacturerClean,
      surgicalCategory: formData.surgicalCategory,
      description: formData.description.trim(),
      sku: formData.sku.trim() || undefined,
      price: primarySellingPrice,
      originalPrice: primaryMrp,
      stock: formData.inStock ? 999 : 0,
      inStock: Boolean(formData.inStock),
      isActive: Boolean(formData.isActive),
      isFeatured: Boolean(formData.isFeatured),
      isSurgical: true,
      image: resolvedPrimaryImage,
      images: images.length > 0 ? images : resolvedPrimaryImage ? [resolvedPrimaryImage] : [],
      variants: validatedVariants,
      highlights: cleanHighlights,
      specifications: cleanSpecifications,
      tags: tagsArray,
      seo: {
        metaTitle: formData.seoTitle.trim(),
        metaDescription: formData.seoDescription.trim(),
      },
    };

    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.updateProduct(id, payload);
        setSuccessMessage("Surgical product updated successfully!");
        setTimeout(() => {
          navigate("/admin/surgical-products");
        }, 800);
      } else {
        await api.createProduct(payload);
        setSuccessMessage("Surgical product created successfully!");
        setTimeout(() => {
          navigate("/admin/surgical-products");
        }, 800);
      }
    } catch (err) {
      console.error("Failed to save surgical product", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw size={28} className="animate-spin text-[#157a6d]" />
        <p className="text-sm font-semibold text-slate-500">Loading surgical product details...</p>
      </div>
    );
  }

  // Selected Category name
  const selectedCatObj = categoriesList.find(c => (c._id || c.id) === formData.surgicalCategory);

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out] text-left w-full max-w-full overflow-x-hidden pb-24 lg:pb-8">
      {/* ── DESKTOP BACK LINK & HEADER ── */}
      <div className="flex items-center justify-between">
        <Link
          to={`/admin/surgical-products${location.search || ""}`}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 flex items-center gap-1.5 font-semibold transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Surgical Products</span>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-bold text-xl sm:text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
          <Scissors className="text-[#157a6d] shrink-0" size={24} />
          <span className="break-words">
            {isEditMode ? `Edit Surgical Product: ${formData.name || id}` : "Create Surgical Product & Specifications"}
          </span>
        </h1>
      </div>

      {/* ── NOTIFICATIONS ── */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-[shake_0.2s_ease-in-out]">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TWO-COLUMN MAIN FORM LAYOUT
          - LEFT: Form Content (Basic Info, Variants, Highlights, Specs, SEO)
          - RIGHT: Sticky Upload Image Option & Save Actions (Sticky on Scroll)
      ═════════════════════════════════════════════════════════════════════ */}
      <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ── LEFT SIDE: CONTENT CARDS (FLEX-1) ── */}
        <div className="flex-1 w-full space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <Info size={18} className="text-[#157a6d]" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100">
                1. Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-[#157a6d] rounded-xl outline-none text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Surgical Category */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Surgical Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="surgicalCategory"
                  value={formData.surgicalCategory}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-[#157a6d] rounded-xl outline-none text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="">Select Surgical Category</option>
                  {categoriesList.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manufacturer */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-[#157a6d] rounded-xl outline-none text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Full Description */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Product Description
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-[#157a6d] rounded-xl outline-none text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Surgical Product Variants */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#157a6d]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100">
                  2. Surgical Product Variants
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#157a6d] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Variant</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Define size, packaging, or dimension variations (e.g. Small, Medium, Large, Pack of 100).
            </p>

            <div className="space-y-3">
              {variants.map((v, idx) => {
                const mrpNum = parseFloat(v.mrp) || 0;
                const priceNum = parseFloat(v.sellingPrice) || 0;
                const discount = mrpNum > priceNum && mrpNum > 0 ? Math.round(((mrpNum - priceNum) / mrpNum) * 100) : 0;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center gap-3 text-xs"
                  >
                    {/* Variant Name */}
                    <div className="flex-1 min-w-[130px] space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        Variant Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(idx, "name", e.target.value)}
                        required
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-bold text-slate-900 dark:text-white focus:border-[#157a6d] outline-none"
                      />
                    </div>

                    {/* MRP */}
                    <div className="w-full md:w-28 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        MRP (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.mrp}
                        onChange={(e) => handleUpdateVariant(idx, "mrp", e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white focus:border-[#157a6d] outline-none"
                      />
                    </div>

                    {/* Selling Price */}
                    <div className="w-full md:w-28 space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        Selling Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.sellingPrice}
                        onChange={(e) => handleUpdateVariant(idx, "sellingPrice", e.target.value)}
                        required
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-[#157a6d] dark:text-emerald-400 focus:border-[#157a6d] outline-none"
                      />
                    </div>

                    {/* Discount Pill */}
                    <div className="w-full md:w-20 flex items-center justify-center md:pt-4">
                      {discount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#15803d] dark:text-emerald-300 font-bold text-[10px]">
                          {discount}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </div>

                    {/* Remove */}
                    <div className="flex justify-end md:pt-4">
                      <button
                        type="button"
                        disabled={variants.length <= 1}
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-20 transition-colors cursor-pointer"
                        title="Remove Variant"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Dynamic Highlights */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#157a6d]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100">
                  3. Key Highlights (Key / Value)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#157a6d] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Highlight</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {highlights.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={h.label}
                    onChange={(e) => handleUpdateHighlight(idx, "label", e.target.value)}
                    className="w-1/3 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-slate-900 dark:text-white outline-none focus:border-[#157a6d]"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => handleUpdateHighlight(idx, "value", e.target.value)}
                    className="flex-1 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#157a6d]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Technical Specifications */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#157a6d]" />
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100">
                  4. Technical Specifications
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddSpecification}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[#157a6d] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Specification</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {specifications.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => handleUpdateSpecification(idx, "label", e.target.value)}
                    className="w-1/3 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl font-semibold text-slate-900 dark:text-white outline-none focus:border-[#157a6d]"
                  />
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => handleUpdateSpecification(idx, "value", e.target.value)}
                    className="flex-1 p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#157a6d]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Stock Availability, Status & SEO */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <ShieldCheck size={18} className="text-[#157a6d]" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100">
                5. Stock Availability, Status & SEO
              </h2>
            </div>

            {/* Stock Availability Toggle Control */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="block font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-100">
                  Stock Availability Status
                </span>
                <span className="text-[11px] text-slate-400">
                  {formData.inStock ? "Product is in stock and available for ordering (999 units)" : "Product is currently marked Out of Stock"}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#157a6d]"></div>
                <span className="ml-2.5 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  {formData.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Custom URL Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#157a6d]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  Search Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#157a6d]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  SEO Meta Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#157a6d]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-[#157a6d]"
                />
              </div>
            </div>

            {/* Status Toggles */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-6 text-xs">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#157a6d] focus:ring-[#157a6d]"
                />
                <span className="font-bold text-slate-800 dark:text-zinc-200">Active (Publicly Visible)</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#157a6d] focus:ring-[#157a6d]"
                />
                <span className="font-bold text-slate-800 dark:text-zinc-200">Featured on Surgical Landing</span>
              </label>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            RIGHT SIDEBAR: STICKY IMAGE GALLERY & SAVE ACTIONS
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-80 lg:sticky lg:top-20 space-y-5 shrink-0">
          {/* Card: Image Gallery Management */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Upload size={16} className="text-[#157a6d]" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Product Images</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{images.length} images</span>
            </div>

            {/* Drag & Drop Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#157a6d] bg-[#157a6d]/5"
                  : "border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 bg-slate-50/50 dark:bg-zinc-950/30"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#157a6d]/10 text-[#157a6d] flex items-center justify-center mb-1.5">
                <Upload size={18} />
              </div>
              <p className="font-bold text-slate-700 dark:text-zinc-200 text-xs">Drag & Drop Images</p>
              <p className="text-[10px] text-slate-400 mt-0.5 mb-2.5">PNG, JPG, WEBP (Max {MAX_FILE_SIZE_MB}MB)</p>

              <label className="bg-[#157a6d] hover:bg-[#0f6157] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all select-none cursor-pointer inline-flex items-center justify-center gap-1.5">
                <span>Choose Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => handleImageFileChange(e)}
                  className="hidden"
                />
              </label>
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="space-y-1 animate-pulse">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Uploading to Cloudinary...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#157a6d] h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {/* Thumbnail Preview List */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {images.map((url, index) => {
                const isPrimary = primaryImageIdx === index;
                return (
                  <div
                    key={index}
                    className={`flex gap-2.5 p-2 rounded-xl border relative group transition-all ${
                      isPrimary
                        ? "border-[#157a6d] bg-[#157a6d]/[0.04] ring-1 ring-[#157a6d]/30"
                        : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/20"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 dark:border-zinc-700 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="max-h-full max-w-full object-contain select-none"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-0.5 truncate">
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-bold">Image #{index + 1}</span>

                        {/* Controls (Move Up/Down, Delete) */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => reorderImage(index, "up")}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 rounded disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => reorderImage(index, "down")}
                            disabled={index === images.length - 1}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 rounded disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteImage(index)}
                            className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer"
                            title="Delete image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <button
                          type="button"
                          onClick={() => setPrimaryImageIdx(index)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                            isPrimary
                              ? "bg-[#157a6d] text-white"
                              : "bg-slate-200 dark:bg-zinc-800 text-slate-600 hover:bg-slate-300"
                          }`}
                        >
                          <Check size={9} />
                          <span>{isPrimary ? "Primary" : "Set Primary"}</span>
                        </button>

                        <label className="text-[9px] font-bold text-[#157a6d] hover:underline cursor-pointer select-none">
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
                <p className="text-[10px] text-slate-400 text-center py-3">No images uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Card: Sticky Save / Publish Actions */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            {/* Quick In Stock Toggle in sidebar */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Stock Status:</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#157a6d]"></div>
                <span className="ml-2 font-bold text-[10px] uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  {formData.inStock ? "In Stock" : "Out"}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <PackageCheck size={16} />
                  <span>{isEditMode ? "Save Changes" : "Publish Surgical Product"}</span>
                </>
              )}
            </button>

            <Link
              to={`/admin/surgical-products${location.search || ""}`}
              className="w-full text-center border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors select-none min-h-[40px] inline-flex items-center justify-center"
            >
              Cancel / Discard
            </Link>

            {/* Quick Status Pill */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">{selectedCatObj?.name || "Not Selected"}</span>
              </div>
              <div className="flex justify-between">
                <span>Variants:</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">{variants.length} configured</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold ${formData.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                  {formData.isActive ? "Active" : "Inactive (Draft)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── MOBILE STICKY BOTTOM SAVE ACTION BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 p-3 shadow-lg flex items-center justify-between gap-3 pb-safe">
        <Link
          to={`/admin/surgical-products${location.search || ""}`}
          className="flex-1 text-center border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all min-h-[44px] inline-flex items-center justify-center"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 bg-[#157a6d] hover:bg-[#0f6157] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isSaving ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <PackageCheck size={15} />
          )}
          <span>{isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Publish Product"}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminAddNewSurgicalProduct;
