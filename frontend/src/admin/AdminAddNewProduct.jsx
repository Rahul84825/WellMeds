import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  Sparkles, 
  PackageCheck, 
  RefreshCw,
  Copy,
  ArrowUp,
  ArrowDown,
  Settings,
  AlertTriangle,
  Bookmark,
  BookOpen,
  FileText
} from "lucide-react";

const AddNewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // --- Basic Info States ---
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vitamins");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [requiresRx, setRequiresRx] = useState(false);
  const [description, setDescription] = useState("");
  const [allSpecialities, setAllSpecialities] = useState([]);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  
  // Images
  const [images, setImages] = useState([]);
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // --- CMS States ---
  const [medicalSections, setMedicalSections] = useState([]);
  const [composition, setComposition] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [usageInstructions, setUsageInstructions] = useState([]);
  const [storageInstructions, setStorageInstructions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [sideEffects, setSideEffects] = useState([]);
  const [safetyCards, setSafetyCards] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [references, setReferences] = useState([]);
  
  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImage, setOgImage] = useState("");

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

            // Set CMS fields
            if (product.medicalSections) setMedicalSections(product.medicalSections);
            if (product.composition) setComposition(product.composition);
            if (product.benefits) setBenefits(product.benefits);
            if (product.usageInstructions) setUsageInstructions(product.usageInstructions);
            if (product.storageInstructions) setStorageInstructions(product.storageInstructions);
            if (product.warnings) setWarnings(product.warnings);
            if (product.sideEffects) setSideEffects(product.sideEffects);
            if (product.safetyCards) setSafetyCards(product.safetyCards);
            if (product.faqs) setFaqs(product.faqs);
            if (product.specifications) setSpecifications(product.specifications);
            if (product.references) setReferences(product.references);
            
            if (product.seo) {
              setMetaTitle(product.seo.metaTitle || "");
              setMetaDescription(product.seo.metaDescription || "");
              setKeywords(product.seo.keywords || "");
              setCanonicalUrl(product.seo.canonicalUrl || "");
              setOgImage(product.seo.ogImage || "");
            }

            if (product.specialities) {
              setSelectedSpecialities(product.specialities.map(s => s._id || s.id || s));
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

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const list = await api.getSpecialities();
        setAllSpecialities(list);
      } catch (err) {
        console.error("Failed to fetch specialities in product form", err);
      }
    };
    fetchSpecialities();
  }, []);

  const allCategories = ["Prescription", "Vitamins", "Medical Devices", "First Aid", "Personal Care", "Supplements"];

  // Image Upload Action
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
          setImages(prev => prev.map((url, idx) => idx === replaceIndex ? uploadedUrls[0] : url));
        } else {
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
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);

    if (primaryImageIdx === index) {
      setPrimaryImageIdx(targetIndex);
    } else if (primaryImageIdx === targetIndex) {
      setPrimaryImageIdx(index);
    }
  };

  // --- CMS Helper Actions ---

  // Medical Sections
  const addMedicalSection = () => {
    setMedicalSections(prev => [...prev, { title: "", content: "" }]);
  };
  const updateMedicalSection = (index, key, val) => {
    setMedicalSections(prev => prev.map((sec, idx) => idx === index ? { ...sec, [key]: val } : sec));
  };
  const deleteMedicalSection = (index) => {
    setMedicalSections(prev => prev.filter((_, idx) => idx !== index));
  };
  const duplicateMedicalSection = (index) => {
    const secToCopy = medicalSections[index];
    setMedicalSections(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, { title: `${secToCopy.title} (Copy)`, content: secToCopy.content });
      return copy;
    });
  };
  const reorderMedicalSection = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === medicalSections.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    setMedicalSections(prev => {
      const nextList = [...prev];
      const temp = nextList[index];
      nextList[index] = nextList[targetIdx];
      nextList[targetIdx] = temp;
      return nextList;
    });
  };

  // Composition
  const addCompositionRow = () => {
    setComposition(prev => [...prev, { ingredient: "", strength: "", purpose: "" }]);
  };
  const updateCompositionRow = (index, key, val) => {
    setComposition(prev => prev.map((row, idx) => idx === index ? { ...row, [key]: val } : row));
  };
  const deleteCompositionRow = (index) => {
    setComposition(prev => prev.filter((_, idx) => idx !== index));
  };

  // Benefits
  const addBenefit = () => {
    setBenefits(prev => [...prev, { title: "", description: "" }]);
  };
  const updateBenefit = (index, key, val) => {
    setBenefits(prev => prev.map((item, idx) => idx === index ? { ...item, [key]: val } : item));
  };
  const deleteBenefit = (index) => {
    setBenefits(prev => prev.filter((_, idx) => idx !== index));
  };

  // Checklist builders (Usage, Storage, Warnings, Side Effects, References)
  const addChecklistItem = (setter) => {
    setter(prev => [...prev, ""]);
  };
  const updateChecklistItem = (setter, index, val) => {
    setter(prev => prev.map((item, idx) => idx === index ? val : item));
  };
  const deleteChecklistItem = (setter, index) => {
    setter(prev => prev.filter((_, idx) => idx !== index));
  };

  // Safety Cards
  const addSafetyCard = () => {
    setSafetyCards(prev => [...prev, { icon: "Pregnancy", title: "Pregnancy", status: "Consult Doctor", description: "" }]);
  };
  const updateSafetyCard = (index, key, val) => {
    setSafetyCards(prev => prev.map((card, idx) => idx === index ? { ...card, [key]: val } : card));
  };
  const deleteSafetyCard = (index) => {
    setSafetyCards(prev => prev.filter((_, idx) => idx !== index));
  };

  // FAQs
  const addFaq = () => {
    setFaqs(prev => [...prev, { question: "", answer: "" }]);
  };
  const updateFaq = (index, key, val) => {
    setFaqs(prev => prev.map((faq, idx) => idx === index ? { ...faq, [key]: val } : faq));
  };
  const deleteFaq = (index) => {
    setFaqs(prev => prev.filter((_, idx) => idx !== index));
  };

  // Specifications
  const addSpecification = () => {
    setSpecifications(prev => [...prev, { label: "", value: "" }]);
  };
  const updateSpecification = (index, key, val) => {
    setSpecifications(prev => prev.map((spec, idx) => idx === index ? { ...spec, [key]: val } : spec));
  };
  const deleteSpecification = (index) => {
    setSpecifications(prev => prev.filter((_, idx) => idx !== index));
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

    // Clean up empty records
    const cleanMedicalSections = medicalSections.filter(s => s.title.trim() && s.content.trim());
    const cleanComposition = composition.filter(c => c.ingredient.trim() && c.strength.trim());
    const cleanBenefits = benefits.filter(b => b.title.trim());
    const cleanUsage = usageInstructions.filter(i => i.trim());
    const cleanStorage = storageInstructions.filter(i => i.trim());
    const cleanWarnings = warnings.filter(w => w.trim());
    const cleanSideEffects = sideEffects.filter(s => s.trim());
    const cleanSafetyCards = safetyCards.filter(c => c.title.trim() && c.status.trim());
    const cleanFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());
    const cleanSpecs = specifications.filter(s => s.label.trim() && s.value.trim());
    const cleanRefs = references.filter(r => r.trim());

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
      description: description.trim(),
      specialities: selectedSpecialities,
      
      // CMS Arrays
      medicalSections: cleanMedicalSections,
      composition: cleanComposition,
      benefits: cleanBenefits,
      usageInstructions: cleanUsage,
      storageInstructions: cleanStorage,
      warnings: cleanWarnings,
      sideEffects: cleanSideEffects,
      safetyCards: cleanSafetyCards,
      faqs: cleanFaqs,
      specifications: cleanSpecs,
      references: cleanRefs,
      
      // SEO Metadata
      seo: {
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        keywords: keywords.trim() || undefined,
        canonicalUrl: canonicalUrl.trim() || undefined,
        ogImage: ogImage.trim() || undefined
      }
    };

    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.updateProduct(id, productData);
        toast.success("Product content updated successfully!");
      } else {
        await api.createProduct(productData);
        toast.success("Product content published successfully!");
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
      <div className="flex items-center justify-between">
        <Link to="/admin/products" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 flex items-center gap-xs font-semibold">
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Header */}
      <h1 className="font-bold text-2xl text-slate-800 dark:text-zinc-100 flex items-center gap-xs">
        <Sparkles className="text-[#004782]" size={24} />
        {isEditMode ? `Product CMS: ${name}` : "Create Catalog Product & Medical Article"}
      </h1>

      {/* Custom Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-md scrollbar-none">
        {[
          { id: "basic", label: "Basic Info & Media", icon: Settings },
          { id: "medical", label: "Medical Content Sections", icon: BookOpen },
          { id: "clinical", label: "Clinical & Specifications", icon: FileText },
          { id: "safety", label: "Safety & Instructions", icon: AlertTriangle },
          { id: "seo", label: "FAQs & SEO Metadata", icon: Bookmark }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-xs py-sm px-md border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "border-[#004782] text-primary dark:text-[#a4c9ff]"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-lg items-start">
        
        {/* Left Form Panel */}
        <div className="flex-1 w-full space-y-lg">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
              <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                General Product Information
              </h3>
              
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

              <div className="space-y-xs pt-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Associated Specialities (Select Multiple)
                </label>
                <div className="flex flex-wrap gap-xs pt-xs">
                  {allSpecialities.map((spec) => {
                    const specId = spec._id || spec.id;
                    const isSelected = selectedSpecialities.includes(specId);
                    return (
                      <button
                        type="button"
                        key={specId}
                        onClick={() => {
                          setSelectedSpecialities(prev => 
                            prev.includes(specId)
                              ? prev.filter(id => id !== specId)
                              : [...prev, specId]
                          );
                        }}
                        className={`flex items-center gap-xs px-sm py-1.5 rounded-xl border text-[11px] font-semibold transition-all select-none cursor-pointer ${
                          isSelected
                            ? "bg-[#004782]/10 border-[#004782] text-primary dark:text-[#a4c9ff] dark:border-[#a4c9ff]"
                            : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {isSelected && <Check size={10} />}
                        {spec.name}
                      </button>
                    );
                  })}
                  {allSpecialities.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic">No active specialities configured in the system.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price (₹) *</label>
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Price (₹)</label>
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Legacy / Short Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="Provide a quick summary. Will be converted to 'Overview' if no medical sections are created."
                />
              </div>

              <div className="flex items-center gap-sm pt-sm border-t border-slate-100 dark:border-zinc-800">
                <input
                  type="checkbox"
                  id="requiresRx"
                  checked={requiresRx}
                  onChange={(e) => setRequiresRx(e.target.checked)}
                  className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
                />
                <label htmlFor="requiresRx" className="text-xs font-bold text-slate-700 dark:text-zinc-200 select-none">
                  Requires Prescription upload for dispensing (Rx verified item)
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICAL CONTENT SECTIONS */}
          {activeTab === "medical" && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
              <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Medical Article Builder</h3>
                  <p className="text-[10px] text-slate-400 mt-xs">Create custom sections (e.g. Uses, How it Works, Side Effects) that will display on the product page.</p>
                </div>
                <button
                  type="button"
                  onClick={addMedicalSection}
                  className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all"
                >
                  <Plus size={12} /> Add Section
                </button>
              </div>

              <div className="space-y-md">
                {medicalSections.map((sec, index) => (
                  <div 
                    key={index}
                    className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-md bg-slate-50/30 dark:bg-zinc-950/10 space-y-sm relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section #{index + 1}</span>
                      
                      <div className="flex items-center gap-xs">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => reorderMedicalSection(index, "up")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === medicalSections.length - 1}
                          onClick={() => reorderMedicalSection(index, "down")}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateMedicalSection(index)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600"
                          title="Duplicate Section"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMedicalSection(index)}
                          className="p-1 hover:bg-red-100 text-red-500 rounded"
                          title="Delete Section"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-md">
                      <div className="space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section Title</label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => updateMedicalSection(index, "title", e.target.value)}
                          placeholder="e.g. How It Works, Precautions, Dosage"
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-primary rounded-xl outline-none"
                        />
                      </div>
                      <div className="space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content (Rich Text / Details)</label>
                        <textarea
                          rows={6}
                          value={sec.content}
                          onChange={(e) => updateMedicalSection(index, "content", e.target.value)}
                          placeholder="Type details about this section..."
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:border-primary rounded-xl outline-none font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {medicalSections.length === 0 && (
                  <div className="text-center py-xl border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                    <BookOpen size={32} className="text-slate-300 mx-auto mb-xs" />
                    <p className="font-bold text-slate-500">No custom medical sections yet</p>
                    <p className="text-[10px] text-slate-400 mt-xs mb-sm">Click "Add Section" to begin writing clinical information.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLINICAL & SPECIFICATIONS */}
          {activeTab === "clinical" && (
            <div className="space-y-lg text-xs">
              
              {/* Composition Repeater */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Chemical Composition / Ingredients</h3>
                    <p className="text-[10px] text-slate-400 mt-xs">List active salts, ingredients, strengths, and purposes.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addCompositionRow}
                    className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all"
                  >
                    <Plus size={12} /> Add Ingredient
                  </button>
                </div>

                <div className="space-y-sm">
                  {composition.map((row, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-md items-end p-sm bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-slate-200/50 dark:border-zinc-800/50">
                      <div className="flex-1 space-y-xs w-full">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingredient / Salt Name</label>
                        <input
                          type="text"
                          value={row.ingredient}
                          onChange={(e) => updateCompositionRow(index, "ingredient", e.target.value)}
                          placeholder="e.g. Paracetamol"
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                      <div className="w-full sm:w-32 space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strength</label>
                        <input
                          type="text"
                          value={row.strength}
                          onChange={(e) => updateCompositionRow(index, "strength", e.target.value)}
                          placeholder="e.g. 650mg"
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex-1 space-y-xs w-full">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose / Action</label>
                        <input
                          type="text"
                          value={row.purpose}
                          onChange={(e) => updateCompositionRow(index, "purpose", e.target.value)}
                          placeholder="e.g. Pain Relief"
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteCompositionRow(index)}
                        className="p-sm bg-red-50 text-red-500 hover:bg-red-100 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {composition.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-sm">No composition details listed. Highly recommended for medicines.</p>
                  )}
                </div>
              </div>

              {/* Key Benefits Repeater */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Key Health Benefits</h3>
                    <p className="text-[10px] text-slate-400 mt-xs">Highlight primary clinical and health advantages.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all"
                  >
                    <Plus size={12} /> Add Benefit
                  </button>
                </div>

                <div className="space-y-sm">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="p-sm bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-slate-200/50 dark:border-zinc-800/50 space-y-sm">
                      <div className="flex justify-between items-start gap-md">
                        <div className="flex-1 space-y-xs">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Benefit Title</label>
                          <input
                            type="text"
                            value={benefit.title}
                            onChange={(e) => updateBenefit(index, "title", e.target.value)}
                            placeholder="e.g. Reduces high fever quickly"
                            className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteBenefit(index)}
                          className="p-sm bg-red-50 text-red-500 hover:bg-red-100 rounded-xl mt-6"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
                        <textarea
                          rows={2}
                          value={benefit.description}
                          onChange={(e) => updateBenefit(index, "description", e.target.value)}
                          placeholder="Provide details or evidence..."
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  {benefits.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-sm">No benefits listed yet.</p>
                  )}
                </div>
              </div>

              {/* Specifications Repeater */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Dynamic Product Specifications</h3>
                    <p className="text-[10px] text-slate-400 mt-xs">Add manufacturer details, country of origin, storage temperature, packaging, etc.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all"
                  >
                    <Plus size={12} /> Add Specification
                  </button>
                </div>

                <div className="space-y-sm">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-md items-end p-sm bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-slate-200/50 dark:border-zinc-800/50">
                      <div className="flex-1 space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specification Label</label>
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => updateSpecification(index, "label", e.target.value)}
                          placeholder="e.g. Country of Origin, Storage Temp"
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                      <div className="flex-1 space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value</label>
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => updateSpecification(index, "value", e.target.value)}
                          placeholder="e.g. India, Below 30°C"
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteSpecification(index)}
                        className="p-sm bg-red-50 text-red-500 hover:bg-red-100 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {specifications.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-sm">No specifications added yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SAFETY & INSTRUCTIONS */}
          {activeTab === "safety" && (
            <div className="space-y-lg text-xs">
              
              {/* Checklist Builders */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Dosage, Warnings & Side Effects lists
                </h3>
                
                {/* Usage Instructions */}
                <div className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usage & Dosage Instructions</label>
                    <button type="button" onClick={() => addChecklistItem(setUsageInstructions)} className="text-primary dark:text-[#a4c9ff] font-bold hover:underline">Add Row</button>
                  </div>
                  <div className="space-y-xs">
                    {usageInstructions.map((item, idx) => (
                      <div key={idx} className="flex gap-xs items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChecklistItem(setUsageInstructions, idx, e.target.value)}
                          placeholder="e.g. Take one tablet twice daily after meals"
                          className="flex-1 p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                        <button type="button" onClick={() => deleteChecklistItem(setUsageInstructions, idx)} className="text-red-500 p-xs"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Instructions */}
                <div className="space-y-xs pt-md border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Instructions</label>
                    <button type="button" onClick={() => addChecklistItem(setStorageInstructions)} className="text-primary dark:text-[#a4c9ff] font-bold hover:underline">Add Row</button>
                  </div>
                  <div className="space-y-xs">
                    {storageInstructions.map((item, idx) => (
                      <div key={idx} className="flex gap-xs items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChecklistItem(setStorageInstructions, idx, e.target.value)}
                          placeholder="e.g. Store in a cool dry place, away from sunlight"
                          className="flex-1 p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                        <button type="button" onClick={() => deleteChecklistItem(setStorageInstructions, idx)} className="text-red-500 p-xs"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                <div className="space-y-xs pt-md border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Warnings & Precautions</label>
                    <button type="button" onClick={() => addChecklistItem(setWarnings)} className="text-primary dark:text-[#a4c9ff] font-bold hover:underline">Add Row</button>
                  </div>
                  <div className="space-y-xs">
                    {warnings.map((item, idx) => (
                      <div key={idx} className="flex gap-xs items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChecklistItem(setWarnings, idx, e.target.value)}
                          placeholder="e.g. Do not exceed the recommended daily dose"
                          className="flex-1 p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                        <button type="button" onClick={() => deleteChecklistItem(setWarnings, idx)} className="text-red-500 p-xs"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side Effects */}
                <div className="space-y-xs pt-md border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Common Side Effects</label>
                    <button type="button" onClick={() => addChecklistItem(setSideEffects)} className="text-primary dark:text-[#a4c9ff] font-bold hover:underline">Add Row</button>
                  </div>
                  <div className="space-y-xs">
                    {sideEffects.map((item, idx) => (
                      <div key={idx} className="flex gap-xs items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChecklistItem(setSideEffects, idx, e.target.value)}
                          placeholder="e.g. Nausea, dizziness, mild headache"
                          className="flex-1 p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                        <button type="button" onClick={() => deleteChecklistItem(setSideEffects, idx)} className="text-red-500 p-xs"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Safety Cards Builder */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Safety Information Cards</h3>
                    <p className="text-[10px] text-slate-400 mt-xs">Safety parameters for Pregnancy, Alcohol, Driving, Liver, Kidney, etc.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addSafetyCard}
                    className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all"
                  >
                    <Plus size={12} /> Add Safety Card
                  </button>
                </div>

                <div className="space-y-md">
                  {safetyCards.map((card, index) => (
                    <div key={index} className="p-sm bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-slate-200/50 dark:border-zinc-800/50 space-y-sm relative">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                        <div className="space-y-xs">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Category / Icon</label>
                          <select
                            value={card.icon}
                            onChange={(e) => {
                              updateSafetyCard(index, "icon", e.target.value);
                              updateSafetyCard(index, "title", e.target.value);
                            }}
                            className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                          >
                            {["Pregnancy", "Alcohol", "Driving", "Kidney", "Liver", "Breastfeeding", "Lactation"].map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-xs">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status / Warning Label</label>
                          <input
                            type="text"
                            value={card.status}
                            onChange={(e) => updateSafetyCard(index, "status", e.target.value)}
                            placeholder="e.g. Consult Doctor, Avoid, Safe"
                            className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                          />
                        </div>
                        <div className="flex items-end justify-end">
                          <button
                            type="button"
                            onClick={() => deleteSafetyCard(index)}
                            className="p-sm bg-red-50 text-red-500 hover:bg-red-100 rounded-xl"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                        <textarea
                          rows={2}
                          value={card.description}
                          onChange={(e) => updateSafetyCard(index, "description", e.target.value)}
                          placeholder="e.g. Side effects might occur. Consult your physician before using this medication during pregnancy..."
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  {safetyCards.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-sm">No safety parameter cards configured.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: FAQS & SEO METADATA */}
          {activeTab === "seo" && (
            <div className="space-y-lg text-xs">
              
              {/* FAQ Builder */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Patient FAQs</h3>
                    <p className="text-[10px] text-slate-400 mt-xs">Frequently asked questions by patients regarding this medicine.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all"
                  >
                    <Plus size={12} /> Add FAQ
                  </button>
                </div>

                <div className="space-y-md">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-sm bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-slate-200/50 dark:border-zinc-800/50 space-y-sm relative">
                      <div className="flex justify-between items-start gap-md">
                        <div className="flex-1 space-y-xs">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(index, "question", e.target.value)}
                            placeholder="e.g. Is it safe to take Paracetamol on an empty stomach?"
                            className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteFaq(index)}
                          className="p-sm bg-red-50 text-red-500 hover:bg-red-100 rounded-xl mt-6"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="space-y-xs">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Answer</label>
                        <textarea
                          rows={3}
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, "answer", e.target.value)}
                          placeholder="Provide a detailed, helpful answer..."
                          className="w-full p-sm bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  {faqs.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-sm">No FAQs configured yet.</p>
                  )}
                </div>
              </div>

              {/* SEO Builder */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Search Engine Optimization (SEO)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="e.g. Buy Dolo 650 Online | WellMeds"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g. paracetamol, dolo 650, pain relief"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta Description</label>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Provide a concise summary of the medicine for Google search snippets..."
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Canonical URL Override</label>
                    <input
                      type="text"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                      placeholder="e.g. https://wellmeds.com/products/dolo-650"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">OpenGraph Image (URL)</label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="Override OG Image URL"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                    />
                  </div>
                </div>

                {/* References List */}
                <div className="space-y-xs pt-md border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical References / Citations</label>
                    <button type="button" onClick={() => addChecklistItem(setReferences)} className="text-primary dark:text-[#a4c9ff] font-bold hover:underline">Add Citation</button>
                  </div>
                  <div className="space-y-xs">
                    {references.map((item, idx) => (
                      <div key={idx} className="flex gap-xs items-center">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateChecklistItem(setReferences, idx, e.target.value)}
                          placeholder="e.g. WHO Model List of Essential Medicines..."
                          className="flex-1 p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
                        />
                        <button type="button" onClick={() => deleteChecklistItem(setReferences, idx)} className="text-red-500 p-xs"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Right Media & Publishing Panel */}
        <div className="w-full lg:w-[350px] space-y-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-lg rounded-2xl shadow-sm text-xs">
          
          <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
            <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Product Images</h4>
            <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-sm py-0.5 rounded text-slate-400 font-bold">Media Hub</span>
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
            
            <label className="bg-[#004782] text-white px-lg py-3 rounded-xl font-bold text-xs hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer min-h-[48px] inline-flex items-center justify-center">
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
          <div className="space-y-sm max-h-[300px] overflow-y-auto pr-xs">
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
                  <img src={url} className="w-20 h-20 rounded-lg object-cover border border-slate-200 dark:border-zinc-800 shrink-0" alt="" />
                  
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
                          <ArrowUp size={12} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => reorderImage(index, "down")}
                          disabled={index === images.length - 1}
                          className="p-0.5 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 rounded disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
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
                      <button
                        type="button"
                        onClick={() => setPrimaryImageIdx(index)}
                        className={`flex items-center gap-0.5 px-sm py-0.5 rounded text-[9px] font-black uppercase transition-colors ${
                          isPrimary 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-200 dark:bg-zinc-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-zinc-700"
                        }`}
                      >
                        <Check size={9} />
                        {isPrimary ? "Primary" : "Select Primary"}
                      </button>

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
              <p className="text-[10px] text-slate-400 text-center py-sm">No images uploaded yet.</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-sm pt-md border-t border-slate-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#086b53] hover:bg-[#055746] text-white font-bold py-sm rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-xs"
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
