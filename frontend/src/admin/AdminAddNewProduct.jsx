import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { api, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../services/api";
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

// --- CMS Parsing and Serialization Utilities ---

const parseLine = (line) => {
  let cleaned = line.trim();
  cleaned = cleaned.replace(/^\s*(?:[•\-*\u2022\u2219\u25e6\u25aa\u25ab\u2043\u2014]|\d+[\.)])\s*/, "");
  return cleaned.trim();
};

const parseTextareaToArray = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => parseLine(l)).filter(Boolean);
  return [...new Set(lines)];
};

const serializeStringArray = (arr) => {
  if (!arr || !arr.length) return "";
  return arr.join("\n");
};

const parseCompositionText = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  for (const line of lines) {
    const cleaned = parseLine(line);
    if (!cleaned) continue;

    let parts = [];
    if (cleaned.includes(" - ")) {
      parts = cleaned.split(" - ");
    } else if (cleaned.includes(" | ")) {
      parts = cleaned.split(" | ");
    } else if (cleaned.includes(",")) {
      parts = cleaned.split(",");
    } else {
      parts = [cleaned];
    }

    const ingredient = (parts[0] || "").trim();
    const strength = (parts[1] || "").trim();
    const purpose = (parts[2] || "").trim();

    if (ingredient) {
      parsed.push({
        ingredient,
        strength: strength || "N/A",
        purpose: purpose || "N/A"
      });
    }
  }
  return parsed;
};

const serializeComposition = (compList) => {
  if (!compList || !compList.length) return "";
  return compList.map(c => {
    const parts = [];
    if (c.ingredient) parts.push(c.ingredient);
    if (c.strength) parts.push(c.strength);
    if (c.purpose) parts.push(c.purpose);
    return parts.join(" - ");
  }).join("\n");
};

const parseBenefitsText = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  for (const line of lines) {
    const cleaned = parseLine(line);
    if (!cleaned) continue;

    const colonIdx = cleaned.indexOf(":");
    let title = "";
    let description = "";
    if (colonIdx !== -1) {
      title = cleaned.substring(0, colonIdx).trim();
      description = cleaned.substring(colonIdx + 1).trim();
    } else {
      title = cleaned;
    }

    if (title) {
      parsed.push({
        title,
        description: description || ""
      });
    }
  }
  return parsed;
};

const serializeBenefits = (benefitsList) => {
  if (!benefitsList || !benefitsList.length) return "";
  return benefitsList.map(b => {
    if (b.description) {
      return `${b.title || ""}: ${b.description || ""}`;
    }
    return b.title || "";
  }).join("\n");
};

const parseSpecificationsText = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];
  for (const line of lines) {
    const cleaned = parseLine(line);
    if (!cleaned) continue;

    const colonIdx = cleaned.indexOf(":");
    let label = "";
    let value = "";
    if (colonIdx !== -1) {
      label = cleaned.substring(0, colonIdx).trim();
      value = cleaned.substring(colonIdx + 1).trim();
    } else {
      label = cleaned;
    }

    if (label) {
      parsed.push({
        label,
        value: value || "N/A"
      });
    }
  }
  return parsed;
};

const serializeSpecifications = (specsList) => {
  if (!specsList || !specsList.length) return "";
  return specsList.map(s => {
    return `${s.label || ""}: ${s.value || ""}`;
  }).join("\n");
};

const parseFaqText = (text) => {
  if (!text) return [];
  const sections = text.split(/\r?\n\s*-{3,}\s*\r?\n/);
  const parsedFaqs = [];

  for (const section of sections) {
    if (!section.trim()) continue;

    const qIndex = section.toLowerCase().indexOf("question:");
    const aIndex = section.toLowerCase().indexOf("answer:");

    let question = "";
    let answer = "";

    if (qIndex !== -1 && aIndex !== -1) {
      if (qIndex < aIndex) {
        question = section.substring(qIndex + 9, aIndex).trim();
        answer = section.substring(aIndex + 7).trim();
      } else {
        answer = section.substring(aIndex + 7, qIndex).trim();
        question = section.substring(qIndex + 9).trim();
      }
    } else if (qIndex !== -1) {
      question = section.substring(qIndex + 9).trim();
    } else if (aIndex !== -1) {
      answer = section.substring(aIndex + 7).trim();
    } else {
      const lines = section.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        question = lines[0];
        answer = lines.slice(1).join("\n");
      }
    }

    if (question || answer) {
      parsedFaqs.push({
        question: question || "Untitled Question",
        answer: answer || ""
      });
    }
  }
  return parsedFaqs;
};

const serializeFaqs = (faqsArray) => {
  if (!faqsArray || !faqsArray.length) return "";
  return faqsArray.map(faq => {
    return `Question:\n${faq.question || ""}\n\nAnswer:\n${faq.answer || ""}`;
  }).join("\n\n------------------------\n\n");
};

// --- Custom CMS UI Accordion and Preview Components ---

const AccordionSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border border-slate-200 dark:border-zinc-850 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-zinc-955/10">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center p-md text-left font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer select-none"
      >
        <span>{title}</span>
        <span className="text-slate-400">
          {isOpen ? "▼" : "▶"}
        </span>
      </button>
      {isOpen && (
        <div className="p-md border-t border-slate-100 dark:border-zinc-850 bg-white dark:bg-zinc-900 space-y-md animate-[fade-in_0.2s_ease-out]">
          {children}
        </div>
      )}
    </div>
  );
};



const AddNewProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // --- Basic Info States ---
  const [existingProduct, setExistingProduct] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isNonRefundable, setIsNonRefundable] = useState(false);
  const [isPrescriptionRequired, setIsPrescriptionRequired] = useState(false);
  const [isColdChain, setIsColdChain] = useState(false);
  const [description, setDescription] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [allSpecialities, setAllSpecialities] = useState([]);
  const [selectedSpecialities, setSelectedSpecialities] = useState([]);
  const [productType, setProductType] = useState("medicine");
  const [isSurgical, setIsSurgical] = useState(false);
  const [surgicalCategory, setSurgicalCategory] = useState("");
  const [allSurgicalCategories, setAllSurgicalCategories] = useState([]);
  const [allMolecules, setAllMolecules] = useState([]);
  const [selectedMolecules, setSelectedMolecules] = useState([]);
  const [moleculeSearchQuery, setMoleculeSearchQuery] = useState("");
  const [moleculeDropdownOpen, setMoleculeDropdownOpen] = useState(false);

  // V2 Display & custom routing states
  const [displayOrder, setDisplayOrder] = useState("");
  const [isImported, setIsImported] = useState(false);
  const [slug, setSlug] = useState("");
  const [isTrending, setIsTrending] = useState(false);
  
  // Images
  const [images, setImages] = useState([]);
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // --- CMS States ---
  const [medicalSections, setMedicalSections] = useState([]);
  const [compositionText, setCompositionText] = useState("");
  const [benefitsText, setBenefitsText] = useState("");
  const [usageText, setUsageText] = useState("");
  const [storageText, setStorageText] = useState("");
  const [warningsText, setWarningsText] = useState("");
  const [sideEffectsText, setSideEffectsText] = useState("");
  const [safetyCards, setSafetyCards] = useState([]);
  const [faqsText, setFaqsText] = useState("");
  const [specificationsText, setSpecificationsText] = useState("");
  const [referencesText, setReferencesText] = useState("");

  // --- Product Specifications States ---
  const [specGenericName, setSpecGenericName] = useState("");
  const [specStrength, setSpecStrength] = useState("");
  const [specDosageForm, setSpecDosageForm] = useState("");
  const [specRoute, setSpecRoute] = useState("");
  const [specPrescription, setSpecPrescription] = useState("No");
  const [specManufacturer, setSpecManufacturer] = useState("");
  const [specStorage, setSpecStorage] = useState("");
  const [specColdChain, setSpecColdChain] = useState("No");

  // Sync Logic / Helpers for spec fields
  const [prevManufacturer, setPrevManufacturer] = useState("");
  useEffect(() => {
    if (manufacturer !== prevManufacturer) {
      if (!specManufacturer || specManufacturer === prevManufacturer) {
        setSpecManufacturer(manufacturer);
      }
      setPrevManufacturer(manufacturer);
    }
  }, [manufacturer, specManufacturer, prevManufacturer]);

  const [prevIsPrescriptionRequired, setPrevIsPrescriptionRequired] = useState(false);
  useEffect(() => {
    if (isPrescriptionRequired !== prevIsPrescriptionRequired) {
      setSpecPrescription(isPrescriptionRequired ? "Yes" : "No");
      setPrevIsPrescriptionRequired(isPrescriptionRequired);
    }
  }, [isPrescriptionRequired, prevIsPrescriptionRequired]);

  const [prevIsColdChain, setPrevIsColdChain] = useState(false);
  useEffect(() => {
    if (isColdChain !== prevIsColdChain) {
      setSpecColdChain(isColdChain ? "Yes" : "No");
      setPrevIsColdChain(isColdChain);
    }
  }, [isColdChain, prevIsColdChain]);

  const handleSpecPrescriptionChange = (val) => {
    setSpecPrescription(val);
    setIsPrescriptionRequired(val === "Yes");
  };

  const handleSpecColdChainChange = (val) => {
    setSpecColdChain(val);
    setIsColdChain(val === "Yes");
  };

  // --- Accordion Active States ---
  const [activeClinicalSection, setActiveClinicalSection] = useState("productSpecifications");
  const [activeSafetySection, setActiveSafetySection] = useState("usage");
  const [activeSeoCmsSection, setActiveSeoCmsSection] = useState("faqs");
  const [activeMedicalSecIdx, setActiveMedicalSecIdx] = useState(0);
  
  // SEO States
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImage, setOgImage] = useState("");

  const getSelectedCategoryId = () => {
    if (!category) return "";
    if (typeof category === "object") return category?._id || category?.id || "";
    const found = allCategories.find(c => c._id === category || c.id === category || c.name === category);
    return found ? (found._id || found.id) : category;
  };

  // Fetch product if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProductData = async () => {
        try {
          const product = await api.getProduct(id);
          if (product) {
            setExistingProduct(product);
            setName(product.name || "");
            setCategory(product.category?._id || product.category?.id || product.category?.name || product.category || "");
            setProductType(product.productType || "medicine");
            setPrice(product.price || "");
            setOriginalPrice(product.originalPrice || "");
            
            let initialInStock = true;
            if (product.stock === 0) {
              initialInStock = false;
            } else if (product.inStock !== undefined) {
              initialInStock = product.inStock;
            } else if (product.stock !== undefined) {
              initialInStock = product.stock > 0;
            }
            setInStock(initialInStock);
            setIsNonRefundable(product.isNonRefundable || product.prepaidOnly || false);
            setIsPrescriptionRequired(product.isPrescriptionRequired || product.requiresRx || false);
            setIsColdChain(product.isColdChain || false);
            setDescription(product.description || "");
            
            // V2 Fields
            setManufacturer(product.manufacturer || product.brand || "");
            setDisplayOrder(product.displayOrder !== undefined ? product.displayOrder : "");
            setIsImported(product.isImported || false);
            setSlug(product.slug || "");
            setIsTrending(product.isTrending || false);
            
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
            if (product.composition) setCompositionText(serializeComposition(product.composition));
            if (product.benefits) setBenefitsText(serializeBenefits(product.benefits));
            if (product.usageInstructions) setUsageText(serializeStringArray(product.usageInstructions));
            if (product.storageInstructions) setStorageText(serializeStringArray(product.storageInstructions));
            if (product.warnings) setWarningsText(serializeStringArray(product.warnings));
            if (product.sideEffects) setSideEffectsText(serializeStringArray(product.sideEffects));
            if (product.safetyCards) setSafetyCards(product.safetyCards);
            if (product.faqs) setFaqsText(serializeFaqs(product.faqs));
            if (product.specifications) setSpecificationsText(serializeSpecifications(product.specifications));
            if (product.references) setReferencesText(serializeStringArray(product.references));

            // Preload new specifications
            if (product.productSpecifications) {
              const ps = product.productSpecifications;
              setSpecGenericName(ps.genericName || "");
              setSpecStrength(ps.strength || "");
              setSpecDosageForm(ps.dosageForm || "");
              setSpecRoute(ps.route || "");
              setSpecPrescription(ps.prescription || "No");
              setSpecManufacturer(ps.manufacturer || "");
              setSpecStorage(ps.storage || "");
              setSpecColdChain(ps.coldChain || "No");
            } else {
              // Backward compatibility fallback from existing product fields
              setSpecGenericName("");
              setSpecStrength(product.strength || "");
              setSpecDosageForm("");
              setSpecRoute("");
              setSpecPrescription(product.isPrescriptionRequired || product.requiresRx ? "Yes" : "No");
              setSpecManufacturer(product.manufacturer || product.brand || "");
              setSpecStorage("");
              setSpecColdChain(product.isColdChain ? "Yes" : "No");
            }
            
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
            if (product.molecules) {
              setSelectedMolecules(product.molecules.map(m => m._id || m.id || m));
            }
            setIsSurgical(product.isSurgical || false);
            setSurgicalCategory(product.surgicalCategory?._id || product.surgicalCategory || "");
            setProductType(product.productType || "medicine");
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
    const fetchCategories = async () => {
      try {
        const list = await api.getCategories();
        const activeCategories = (list || []).filter(cat => cat.status === "Active" || cat.isActive === true);
        activeCategories.sort((a, b) => {
          if (a.displayOrder !== undefined && b.displayOrder !== undefined && a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
          }
          return a.name.localeCompare(b.name);
        });
        setAllCategories(activeCategories);
        if (!isEditMode && activeCategories.length > 0) {
          setCategory(activeCategories[0]._id || activeCategories[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch categories in product form", err);
      }
    };
    const fetchSpecialities = async () => {
      try {
        const list = await api.getSpecialities();
        setAllSpecialities(list);
      } catch (err) {
        console.error("Failed to fetch specialities in product form", err);
      }
    };
    const fetchMolecules = async () => {
      try {
        const list = await api.getMolecules();
        setAllMolecules(list);
      } catch (err) {
        console.error("Failed to fetch molecules in product form", err);
      }
    };
    const fetchSurgicalCategories = async () => {
      try {
        const list = await api.getSurgicalCategories();
        setAllSurgicalCategories(list);
      } catch (err) {
        console.error("Failed to fetch surgical categories in product form", err);
      }
    };
    fetchCategories();
    fetchSpecialities();
    fetchMolecules();
    fetchSurgicalCategories();
  }, [isEditMode]);

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
        if (file.size > MAX_FILE_SIZE) {
          toast.warning(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
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
      const errMsg = err.response?.data?.message || err.message || "Failed to upload image. Please verify local environment.";
      toast.error(errMsg);
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
        if (file.size > MAX_FILE_SIZE) {
          toast.warning(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
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
      const errMsg = err.response?.data?.message || err.message || "Failed to drop and upload image.";
      toast.error(errMsg);
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !name.trim() || !category || !price || !manufacturer || !manufacturer.trim()) {
      toast.warning("Please fill in all required fields (Name, Category, Selling Price, Manufacturer).");
      return;
    }

    const hasExistingImage = isEditMode && existingProduct && (
      existingProduct.image ||
      (existingProduct.images && existingProduct.images.length > 0) ||
      (existingProduct.imagesData && existingProduct.imagesData.length > 0)
    );

    const primaryImageUrl = images[primaryImageIdx] || "";
    if (!primaryImageUrl && !hasExistingImage) {
      toast.warning("Please upload at least one image.");
      return;
    }

    if (originalPrice && parseFloat(originalPrice) < parseFloat(price)) {
      toast.warning("Original Price cannot be less than Selling Price.");
      return;
    }

    if (specStrength && specStrength.length > 50) {
      toast.warning("Strength specification value should not exceed 50 characters.");
      return;
    }

    // Clean up empty records
    const cleanMedicalSections = medicalSections.filter(s => s.title.trim() && s.content.trim());
    const cleanComposition = parseCompositionText(compositionText).filter(c => c.ingredient.trim() && c.strength.trim());
    const cleanBenefits = parseBenefitsText(benefitsText).filter(b => b.title.trim());
    const cleanUsage = parseTextareaToArray(usageText);
    const cleanStorage = parseTextareaToArray(storageText);
    const cleanWarnings = parseTextareaToArray(warningsText);
    const cleanSideEffects = parseTextareaToArray(sideEffectsText);
    const cleanSafetyCards = safetyCards.filter(c => c.title.trim() && c.status.trim());
    const cleanFaqs = parseFaqText(faqsText).filter(f => f.question.trim() && f.answer.trim());
    const cleanSpecs = parseSpecificationsText(specificationsText).filter(s => s.label.trim() && s.value.trim());
    const cleanRefs = parseTextareaToArray(referencesText);

    const productData = {
      name: name.trim(),
      category: typeof category === "object" ? (category?.name || category?._id) : category,
      productType,
      brand: specManufacturer.trim() || manufacturer.trim(), // for DB required validation
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
      inStock,
      isNonRefundable,
      requiresRx: specPrescription === "Yes",
      isPrescriptionRequired: specPrescription === "Yes",
      isColdChain: specColdChain === "Yes",
      image: primaryImageUrl || (existingProduct ? existingProduct.image : ""),
      images: images.length > 0 ? images : (existingProduct ? (existingProduct.images || []) : []),
      imagesData: existingProduct ? existingProduct.imagesData : undefined,
      description: description.trim(),
      specialities: selectedSpecialities,
      molecules: selectedMolecules,
      isSurgical,
      surgicalCategory: isSurgical && surgicalCategory ? surgicalCategory : undefined,
      
      // V2 Fields
      manufacturer: specManufacturer.trim() || manufacturer.trim(),
      strength: specStrength.trim(),
      displayOrder: displayOrder !== "" ? parseInt(displayOrder) : 0,
      isImported,
      slug: slug.trim() || undefined,
      isTrending,
      
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
      
      // New Fixed Product Specifications
      productSpecifications: {
        genericName: specGenericName.trim(),
        strength: specStrength.trim(),
        dosageForm: specDosageForm,
        route: specRoute,
        prescription: specPrescription,
        manufacturer: specManufacturer.trim() || manufacturer.trim(),
        coldChain: specColdChain,
        storage: specStorage.trim()
      },
      
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
            <div className="space-y-lg w-full">
              
              {/* Section 1: Basic Information */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL Custom Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. paracetamol-500mg"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category *</label>
                    <select
                      value={getSelectedCategoryId()}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
                    >
                      {allCategories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-xs col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturer *</label>
                    <input
                      type="text"
                      required
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                      placeholder="e.g. Sun Pharma"
                    />
                  </div>
                </div>

                {/* Associated Molecules Searchable Multi-Select */}
                <div className="space-y-xs pt-xs relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Associated Molecules (Search &amp; Select Multiple)
                  </label>
                  
                  {/* Selected Molecule Badges */}
                  <div className="flex flex-wrap gap-xs pb-xs">
                    {selectedMolecules.map((molId) => {
                      const molObj = allMolecules.find(m => (m.id || m._id) === molId);
                      if (!molObj) return null;
                      return (
                        <span
                          key={molId}
                          className="inline-flex items-center gap-xs px-sm py-1 rounded-xl bg-[#038076]/10 border border-[#038076]/20 text-[#038076] dark:text-[#84d6b9] text-[10px] font-bold"
                        >
                          {molObj.name}
                          <button
                            type="button"
                            onClick={() => setSelectedMolecules(prev => prev.filter(id => id !== molId))}
                            className="hover:text-red-500 font-bold focus:outline-none"
                          >
                            &times;
                          </button>
                        </span>
                      );
                    })}
                    {selectedMolecules.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No molecules selected.</span>
                    )}
                  </div>

                  {/* Search Input for Dropdown */}
                  <div className="relative max-w-md">
                    <input
                      type="text"
                      placeholder="Search molecules to add..."
                      value={moleculeSearchQuery}
                      onChange={(e) => {
                        setMoleculeSearchQuery(e.target.value);
                        setMoleculeDropdownOpen(true);
                      }}
                      onFocus={() => setMoleculeDropdownOpen(true)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                    />
                    {moleculeDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setMoleculeDropdownOpen(false)}
                        />
                        <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                          {allMolecules
                            .filter(mol => {
                              const query = moleculeSearchQuery.toLowerCase().trim();
                              const matchesName = mol.name.toLowerCase().includes(query);
                              const matchesAlias = mol.aliases?.some(alias => alias.toLowerCase().includes(query));
                              return matchesName || matchesAlias;
                            })
                            .map((mol) => {
                              const molId = mol.id || mol._id;
                              const isSelected = selectedMolecules.includes(molId);
                              return (
                                <button
                                  key={molId}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedMolecules(prev => prev.filter(id => id !== molId));
                                    } else {
                                      setSelectedMolecules(prev => [...prev, molId]);
                                    }
                                    setMoleculeSearchQuery("");
                                  }}
                                  className="w-full text-left p-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-855 transition-colors"
                                >
                                  <div>
                                    <span className="font-bold text-slate-700 dark:text-zinc-200">{mol.name}</span>
                                    {mol.aliases && mol.aliases.length > 0 && (
                                      <span className="text-[10px] text-slate-400 ml-sm italic">({mol.aliases.join(", ")})</span>
                                    )}
                                  </div>
                                  {isSelected && <span className="text-[#038076] font-extrabold font-mono">✓</span>}
                                </button>
                              );
                            })}
                          {allMolecules.filter(mol => {
                            const query = moleculeSearchQuery.toLowerCase().trim();
                            const matchesName = mol.name.toLowerCase().includes(query);
                            const matchesAlias = mol.aliases?.some(alias => alias.toLowerCase().includes(query));
                            return matchesName || matchesAlias;
                          }).length === 0 && (
                            <div className="p-sm text-slate-400 italic text-center">No matching molecules found.</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-xs pt-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Introduction</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                    placeholder="Provide a quick introduction summary. Will be converted to 'Overview' if no medical sections are created."
                  />
                </div>
              </div>

              {/* Section 2: Pricing */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Pricing Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Original Price / MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selling Price (₹) *</label>
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
                  <div className="space-y-xs bg-slate-50 dark:bg-zinc-950/20 p-sm rounded-xl border border-slate-200/50 dark:border-zinc-800 flex flex-col justify-center">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Discount Calculator</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-450 mt-1">
                      {price && originalPrice && parseFloat(originalPrice) > parseFloat(price)
                        ? `${(((parseFloat(originalPrice) - parseFloat(price)) / parseFloat(originalPrice)) * 100).toFixed(2)}% Discount`
                        : "No Discount"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Inventory */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Inventory Settings
                </h3>
                <div className="flex items-center gap-md">
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">Stock Availability:</span>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    <span className="ml-sm font-bold text-xs text-slate-700 dark:text-zinc-200">
                      {inStock ? "IN STOCK" : "OUT OF STOCK"}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-xs pt-sm border-t border-slate-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-md">
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">Non-Refundable Product:</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isNonRefundable}
                        onChange={(e) => setIsNonRefundable(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ml-sm font-bold text-xs text-slate-700 dark:text-zinc-200">
                        {isNonRefundable ? "Non-Refundable" : "Refundable"}
                      </span>
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal mt-0.5">
                    When enabled, this product cannot be returned or refunded after purchase.
                  </p>
                </div>
              </div>

              {/* Section 4: Display Settings */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Display Settings
                </h3>
                <div className="max-w-xs space-y-xs">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                    placeholder="0 (Lower shows first)"
                  />
                </div>
              </div>

              {/* Section 5: Prescription & Medical */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Prescription &amp; Medical Rules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                  
                  {/* Rx Toggle */}
                  <div className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl">
                    <input
                      type="checkbox"
                      id="isPrescriptionRequired"
                      checked={isPrescriptionRequired}
                      onChange={(e) => setIsPrescriptionRequired(e.target.checked)}
                      className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isPrescriptionRequired" className="font-bold text-slate-700 dark:text-zinc-200 select-none cursor-pointer">
                      Rx Required
                    </label>
                  </div>

                  {/* Cold Chain Toggle */}
                  <div className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl">
                    <input
                      type="checkbox"
                      id="isColdChain"
                      checked={isColdChain}
                      onChange={(e) => setIsColdChain(e.target.checked)}
                      className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isColdChain" className="font-bold text-slate-700 dark:text-zinc-200 select-none cursor-pointer">
                      Cold Chain Shipped
                    </label>
                  </div>

                  {/* Imported Toggle */}
                  <div className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl">
                    <input
                      type="checkbox"
                      id="isImportedToggle"
                      checked={isImported}
                      onChange={(e) => setIsImported(e.target.checked)}
                      className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isImportedToggle" className="font-bold text-slate-700 dark:text-zinc-200 select-none cursor-pointer">
                      Imported Medicine
                    </label>
                  </div>

                  {/* Trending Toggle */}
                  <div className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl">
                    <input
                      type="checkbox"
                      id="isTrendingToggle"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isTrendingToggle" className="font-bold text-slate-700 dark:text-zinc-200 select-none cursor-pointer">
                      Trending Product (Storefront Search Recommendation)
                    </label>
                  </div>

                  {/* Wellness Toggle */}
                  <div className="flex items-center justify-between p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl">
                    <span className="font-bold text-slate-700 dark:text-zinc-200 select-none">
                      Wellness Product
                    </span>
                    <button
                      type="button"
                      id="isWellnessToggle"
                      onClick={() => setProductType(productType === "wellness" ? "medicine" : "wellness")}
                      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary ${
                        productType === "wellness" ? "bg-[#038076]" : "bg-slate-300 dark:bg-zinc-800"
                      }`}
                    >
                      <span className="sr-only">Toggle Wellness Product</span>
                      <span
                        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          productType === "wellness" ? "translate-x-6" : "translate-x-0"
                        }`}
                      >
                        <span
                          className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ${
                            productType === "wellness" ? "opacity-100 ease-in" : "opacity-0 ease-out"
                          }`}
                          aria-hidden="true"
                        >
                          <span className="text-[8px] font-extrabold text-[#038076]">ON</span>
                        </span>
                        <span
                          className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ${
                            productType === "wellness" ? "opacity-0 ease-out" : "opacity-100 ease-in"
                          }`}
                          aria-hidden="true"
                        >
                          <span className="text-[8px] font-extrabold text-slate-400">OFF</span>
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* Surgical Toggle */}
                  <div className="flex items-center gap-sm p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 rounded-xl">
                    <input
                      type="checkbox"
                      id="isSurgicalToggle"
                      checked={isSurgical}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setIsSurgical(val);
                        if (!val) setSurgicalCategory("");
                      }}
                      className="rounded border-slate-300 text-[#004782] focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isSurgicalToggle" className="font-bold text-slate-700 dark:text-zinc-200 select-none cursor-pointer">
                      Surgical Product
                    </label>
                  </div>

                  {/* Specialities Select */}
                  <div className="flex flex-col gap-sm col-span-full pt-sm border-t border-slate-100 dark:border-zinc-800">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Associated Specialities (Select Multiple)
                    </label>
                    <div className="flex flex-wrap gap-xs">
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
                                : "bg-slate-50 dark:bg-zinc-955 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900"
                            }`}
                          >
                            {isSelected && <Check size={10} />}
                            {spec.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Surgical Category select box */}
                  {isSurgical && (
                    <div className="space-y-xs col-span-full pt-sm border-t border-slate-100 dark:border-zinc-800 animate-[fade-in_0.2s_ease-out]">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surgical Category *</label>
                      <select
                        required={isSurgical}
                        value={surgicalCategory}
                        onChange={(e) => setSurgicalCategory(e.target.value)}
                        className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none dark:text-zinc-200"
                      >
                        <option value="">Select Surgical Category</option>
                        {allSurgicalCategories.map((cat) => {
                          const idVal = cat.id || cat._id;
                          return (
                            <option key={idVal} value={idVal}>{cat.name}</option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEDICAL CONTENT SECTIONS */}
          {activeTab === "medical" && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md text-xs animate-[fade-in_0.2s_ease-out]">
              <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Medical Article Builder</h3>
                  <p className="text-[10px] text-slate-400 mt-xs">Create custom sections (e.g. Uses, How it Works, Side Effects) that will display on the product page.</p>
                </div>
                <button
                  type="button"
                  onClick={addMedicalSection}
                  className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all cursor-pointer select-none"
                >
                  <Plus size={12} /> Add Section
                </button>
              </div>

              <div className="space-y-sm">
                {medicalSections.map((sec, index) => {
                  const isExpanded = activeMedicalSecIdx === index;
                  const parsedPreview = parseTextareaToArray(sec.content);

                  return (
                    <div 
                      key={index}
                      className="border border-slate-200 dark:border-zinc-850 rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-zinc-950/10 transition-all"
                    >
                      {/* Accordion Header */}
                      <div className="w-full flex justify-between items-center p-md bg-slate-50/50 dark:bg-zinc-950/30 border-b border-slate-155 dark:border-zinc-850 select-none">
                        <button
                          type="button"
                          onClick={() => setActiveMedicalSecIdx(isExpanded ? null : index)}
                          className="flex-1 flex items-center gap-xs text-left font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-350 hover:text-primary dark:hover:text-[#a4c9ff] transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? "▼" : "▶"}</span>
                          <span>Section #{index + 1}: {sec.title || <span className="italic text-slate-450">Untitled Section</span>}</span>
                        </button>

                        <div className="flex items-center gap-xs">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              reorderMedicalSection(index, "up");
                              if (activeMedicalSecIdx === index) setActiveMedicalSecIdx(index - 1);
                              else if (activeMedicalSecIdx === index - 1) setActiveMedicalSecIdx(index);
                            }}
                            className="p-1 hover:bg-slate-250 dark:hover:bg-zinc-850 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={index === medicalSections.length - 1}
                            onClick={() => {
                              reorderMedicalSection(index, "down");
                              if (activeMedicalSecIdx === index) setActiveMedicalSecIdx(index + 1);
                              else if (activeMedicalSecIdx === index + 1) setActiveMedicalSecIdx(index);
                            }}
                            className="p-1 hover:bg-slate-250 dark:hover:bg-zinc-850 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              duplicateMedicalSection(index);
                              setActiveMedicalSecIdx(index + 1);
                            }}
                            className="p-1 hover:bg-slate-250 dark:hover:bg-zinc-850 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Duplicate Section"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteMedicalSection(index);
                              setActiveMedicalSecIdx(null);
                            }}
                            className="p-1 hover:bg-red-100 text-red-500 rounded cursor-pointer"
                            title="Delete Section"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-md bg-white dark:bg-zinc-900 space-y-md animate-[fade-in_0.2s_ease-out]">
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
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content (Natural lines or detailed text)</label>
                            <textarea
                              rows={6}
                              value={sec.content}
                              onChange={(e) => updateMedicalSection(index, "content", e.target.value)}
                              placeholder="Type details about this section..."
                              className="w-full p-sm bg-white dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

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
            <div className="space-y-lg text-xs animate-[fade-in_0.2s_ease-out]">              {/* Accordion Group */}
              <div className="space-y-md">
                
                {/* Accordion Panel 1: Benefits */}
                <AccordionSection
                  title="Key Health Benefits"
                  isOpen={activeClinicalSection === "benefits"}
                  onToggle={() => setActiveClinicalSection(activeClinicalSection === "benefits" ? null : "benefits")}
                >
                  <div className="space-y-xs">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Benefits Editor</label>
                      <span className="text-[10px] text-slate-400 font-medium">Format: Title: Description (or just Title)</span>
                    </div>
                    <textarea
                      rows={6}
                      value={benefitsText}
                      onChange={(e) => setBenefitsText(e.target.value)}
                      placeholder="e.g.&#10;Reduces high fever quickly: Works on the temperature-regulating center of the brain&#10;Relieves mild to moderate pain"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </AccordionSection>

                {/* Accordion Panel 2: Product Specifications */}
                <AccordionSection
                  title="Product Specifications"
                  isOpen={activeClinicalSection === "productSpecifications"}
                  onToggle={() => setActiveClinicalSection(activeClinicalSection === "productSpecifications" ? null : "productSpecifications")}
                >
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-zinc-950 text-[10px] font-bold text-slate-450 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                          <th className="px-md py-sm w-1/3">Specification</th>
                          <th className="px-md py-sm">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                        {/* Generic Name */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Generic Name</td>
                          <td className="px-md py-sm">
                            <input
                              type="text"
                              value={specGenericName}
                              onChange={(e) => setSpecGenericName(e.target.value)}
                              className="w-full p-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-lg outline-none dark:text-zinc-200"
                              placeholder="e.g. Paracetamol"
                            />
                          </td>
                        </tr>
                        {/* Strength */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Strength</td>
                          <td className="px-md py-sm">
                            <input
                              type="text"
                              value={specStrength}
                              onChange={(e) => setSpecStrength(e.target.value)}
                              maxLength={50}
                              className="w-full p-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-lg outline-none dark:text-zinc-200"
                              placeholder="e.g. 500 mg, 10 mg/5 ml"
                            />
                          </td>
                        </tr>
                        {/* Dosage Form */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Dosage Form</td>
                          <td className="px-md py-sm">
                            <select
                              value={specDosageForm}
                              onChange={(e) => setSpecDosageForm(e.target.value)}
                              className="w-full p-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-lg outline-none dark:text-zinc-200"
                            >
                              <option value="">Select Dosage Form</option>
                              {[
                                "Tablet", "Capsule", "Injection", "Syrup", "Suspension", 
                                "Oral Solution", "Powder", "Cream", "Ointment", "Gel", 
                                "Lotion", "Drops", "Spray", "Inhaler", "Sachet", "Softgel", "Others"
                              ].map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {/* Route */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Route</td>
                          <td className="px-md py-sm">
                            <select
                              value={specRoute}
                              onChange={(e) => setSpecRoute(e.target.value)}
                              className="w-full p-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-lg outline-none dark:text-zinc-200"
                            >
                              <option value="">Select Route</option>
                              {[
                                "Oral", "Intravenous (IV)", "Intramuscular (IM)", "Subcutaneous (SC)", 
                                "Topical", "Ophthalmic", "Nasal", "Rectal", "Inhalation", "Others"
                              ].map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {/* Prescription */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Prescription</td>
                          <td className="px-md py-sm flex items-center gap-md">
                            <label className="inline-flex items-center gap-xs cursor-pointer select-none">
                              <input
                                type="radio"
                                name="specPrescription"
                                value="Yes"
                                checked={specPrescription === "Yes"}
                                onChange={() => handleSpecPrescriptionChange("Yes")}
                                className="text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="font-bold text-slate-700 dark:text-zinc-200">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-xs cursor-pointer select-none">
                              <input
                                type="radio"
                                name="specPrescription"
                                value="No"
                                checked={specPrescription === "No"}
                                onChange={() => handleSpecPrescriptionChange("No")}
                                className="text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="font-bold text-slate-700 dark:text-zinc-200">No</span>
                            </label>
                          </td>
                        </tr>
                        {/* Manufacturer */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Manufacturer</td>
                          <td className="px-md py-sm">
                            <input
                              type="text"
                              value={specManufacturer}
                              onChange={(e) => setSpecManufacturer(e.target.value)}
                              className="w-full p-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-lg outline-none dark:text-zinc-200"
                              placeholder="e.g. Sun Pharma"
                            />
                          </td>
                        </tr>
                        {/* Cold Chain */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Cold Chain</td>
                          <td className="px-md py-sm flex items-center gap-md">
                            <label className="inline-flex items-center gap-xs cursor-pointer select-none">
                              <input
                                type="radio"
                                name="specColdChain"
                                value="Yes"
                                checked={specColdChain === "Yes"}
                                onChange={() => handleSpecColdChainChange("Yes")}
                                className="text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="font-bold text-slate-700 dark:text-zinc-200">Yes</span>
                            </label>
                            <label className="inline-flex items-center gap-xs cursor-pointer select-none">
                              <input
                                type="radio"
                                name="specColdChain"
                                value="No"
                                checked={specColdChain === "No"}
                                onChange={() => handleSpecColdChainChange("No")}
                                className="text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <span className="font-bold text-slate-700 dark:text-zinc-200">No</span>
                            </label>
                          </td>
                        </tr>
                        {/* Storage */}
                        <tr className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-md py-sm font-bold text-slate-500">Storage</td>
                          <td className="px-md py-sm">
                            <input
                              type="text"
                              value={specStorage}
                              onChange={(e) => setSpecStorage(e.target.value)}
                              className="w-full p-xs bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-lg outline-none dark:text-zinc-200"
                              placeholder="e.g. Store below 30°C, Keep refrigerated (2°C–8°C)"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionSection>

              </div>
            </div>
          )}

          {/* TAB 4: SAFETY & INSTRUCTIONS */}
          {activeTab === "safety" && (
            <div className="space-y-lg text-xs animate-[fade-in_0.2s_ease-out]">
              
              {/* Accordion Group */}
              <div className="space-y-md">
                
                {/* Accordion Panel 1: Usage */}
                <AccordionSection
                  title="Usage & Dosage Instructions"
                  isOpen={activeSafetySection === "usage"}
                  onToggle={() => setActiveSafetySection(activeSafetySection === "usage" ? null : "usage")}
                >
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">One instruction per line</label>
                    <textarea
                      rows={5}
                      value={usageText}
                      onChange={(e) => setUsageText(e.target.value)}
                      placeholder="e.g.&#10;Take one tablet twice daily after meals&#10;Drink plenty of water"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </AccordionSection>

                {/* Accordion Panel 2: Storage */}
                <AccordionSection
                  title="Storage Instructions"
                  isOpen={activeSafetySection === "storage"}
                  onToggle={() => setActiveSafetySection(activeSafetySection === "storage" ? null : "storage")}
                >
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">One instruction per line</label>
                    <textarea
                      rows={5}
                      value={storageText}
                      onChange={(e) => setStorageText(e.target.value)}
                      placeholder="e.g.&#10;Store in a cool dry place, away from sunlight&#10;Keep out of reach of children"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </AccordionSection>

                {/* Accordion Panel 3: Warnings */}
                <AccordionSection
                  title="Clinical Warnings & Precautions"
                  isOpen={activeSafetySection === "warnings"}
                  onToggle={() => setActiveSafetySection(activeSafetySection === "warnings" ? null : "warnings")}
                >
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">One warning per line</label>
                    <textarea
                      rows={5}
                      value={warningsText}
                      onChange={(e) => setWarningsText(e.target.value)}
                      placeholder="e.g.&#10;Do not exceed the recommended daily dose&#10;Avoid alcohol consumption during treatment"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </AccordionSection>

                {/* Accordion Panel 4: Side Effects */}
                <AccordionSection
                  title="Common Side Effects"
                  isOpen={activeSafetySection === "sideEffects"}
                  onToggle={() => setActiveSafetySection(activeSafetySection === "sideEffects" ? null : "sideEffects")}
                >
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">One side effect per line</label>
                    <textarea
                      rows={5}
                      value={sideEffectsText}
                      onChange={(e) => setSideEffectsText(e.target.value)}
                      placeholder="e.g.&#10;Nausea&#10;Dizziness&#10;Mild headache"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </AccordionSection>

              </div>

              {/* Safety Cards Builder (UNTOUCHED) */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <div className="flex justify-between items-center pb-xs border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100">Safety Information Cards</h3>
                    <p className="text-[10px] text-slate-400 mt-xs">Safety parameters for Pregnancy, Alcohol, Driving, Liver, Kidney, etc.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addSafetyCard}
                    className="flex items-center gap-xs bg-[#004782] text-white px-md py-1.5 rounded-xl font-bold text-[10px] hover:opacity-90 transition-all cursor-pointer select-none"
                  >
                    <Plus size={12} /> Add Safety Card
                  </button>
                </div>

                <div className="space-y-md">
                  {safetyCards.map((card, index) => (
                    <div key={index} className="p-sm bg-slate-50/50 dark:bg-zinc-955/20 rounded-xl border border-slate-200/50 dark:border-zinc-800/50 space-y-sm relative">
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
                            className="p-sm bg-red-50 text-red-500 hover:bg-red-100 rounded-xl cursor-pointer"
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
            <div className="space-y-lg text-xs animate-[fade-in_0.2s_ease-out]">
              
              {/* Accordion Group */}
              <div className="space-y-md">
                
                {/* Accordion Panel 1: Patient FAQs */}
                <AccordionSection
                  title="Patient FAQs"
                  isOpen={activeSeoCmsSection === "faqs"}
                  onToggle={() => setActiveSeoCmsSection(activeSeoCmsSection === "faqs" ? null : "faqs")}
                >
                  <div className="space-y-xs">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">FAQs Editor</label>
                      <span className="text-[10px] text-slate-400 font-medium">Use '---' (three hyphens) to separate FAQs</span>
                    </div>
                    <textarea
                      rows={8}
                      value={faqsText}
                      onChange={(e) => setFaqsText(e.target.value)}
                      placeholder="Question:&#10;Is it safe to take this medicine on an empty stomach?&#10;&#10;Answer:&#10;Consult your doctor first.&#10;&#10;------------------------&#10;&#10;Question:&#10;Can pregnant women use it?&#10;&#10;Answer:&#10;Consult your doctor first."
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </AccordionSection>

                {/* Accordion Panel 2: References / Citations */}
                <AccordionSection
                  title="Medical References / Citations"
                  isOpen={activeSeoCmsSection === "references"}
                  onToggle={() => setActiveSeoCmsSection(activeSeoCmsSection === "references" ? null : "references")}
                >
                  <div className="space-y-xs">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">One citation per line</label>
                    <textarea
                      rows={5}
                      value={referencesText}
                      onChange={(e) => setReferencesText(e.target.value)}
                      placeholder="e.g.&#10;WHO Model List of Essential Medicines&#10;Clinical Trials data for Paracetamol"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-mono text-xs leading-relaxed"
                    />
                  </div>
                </AccordionSection>

              </div>

              {/* SEO Builder (UNTOUCHED) */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-lg shadow-sm space-y-md">
                <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-100 pb-xs border-b border-slate-100 dark:border-zinc-800">
                  Search Engine Optimization (SEO)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL Custom Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. dolo-650-paracetamol"
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none font-mono"
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
                      className="w-full p-sm bg-slate-50 dark:bg-zinc-955 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none"
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
