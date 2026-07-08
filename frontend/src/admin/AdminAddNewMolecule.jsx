import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Info, 
  Tag, 
  FileText, 
  Link as LinkIcon, 
  Settings 
} from "lucide-react";

const AdminAddNewMolecule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // --- State Fields ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [aliases, setAliases] = useState(""); // comma-separated
  const [letter, setLetter] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // --- Clinical Details ---
  const [uses, setUses] = useState("");
  const [benefits, setBenefits] = useState("");
  const [howItWorks, setHowItWorks] = useState("");
  const [dosage, setDosage] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [warnings, setWarnings] = useState("");
  const [precautions, setPrecautions] = useState("");
  const [storage, setStorage] = useState("");

  // --- FAQs & References ---
  const [faqs, setFaqs] = useState([]);
  const [references, setReferences] = useState([]);

  // --- Relationships ---
  const [allMolecules, setAllMolecules] = useState([]);
  const [relatedMolecules, setRelatedMolecules] = useState([]);

  // --- SEO ---
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [seoKeywords, setSeoKeywords] = useState([]);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [openGraphTitle, setOpenGraphTitle] = useState("");
  const [openGraphDescription, setOpenGraphDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [searchTags, setSearchTags] = useState([]);

  // Load database molecules (for related molecules lookup) and load edit data if applicable
  useEffect(() => {
    const init = async () => {
      try {
        let molList = [];
        try {
          const adminData = await api.adminGetMolecules({ limit: 1000 });
          molList = adminData.molecules || [];
        } catch (err) {
          console.warn("Failed to load admin molecules list, trying public list...", err);
          try {
            molList = await api.getMolecules();
          } catch (pubErr) {
            console.error("Failed to load public molecules list too", pubErr);
          }
        }

        setAllMolecules(molList.filter((m) => m._id !== id && m.id !== id) || []);

        if (isEditMode) {
          let mol = molList.find((m) => m._id === id || m.id === id || m.slug === id);

          if (!mol) {
            try {
              mol = await api.getMolecule(id);
            } catch (err) {
              console.warn("getMolecule direct call failed, trying public list fallback...", err);
            }
          }

          if (!mol) {
            try {
              const activeList = await api.getMolecules();
              mol = activeList.find((m) => m._id === id || m.id === id || m.slug === id);
            } catch (err) {
              console.warn("getMolecules list fallback failed too", err);
            }
          }

          if (mol) {
            setName(mol.name || "");
            setSlug(mol.slug || "");
            setLetter(mol.letter || "");
            setAliases(mol.aliases ? mol.aliases.join(", ") : "");
            setShortDescription(mol.shortDescription || "");
            setDescription(mol.description || "");
            setIsActive(mol.isActive !== undefined ? mol.isActive : true);

            // Clinical Details
            setUses(mol.uses || "");
            setBenefits(mol.benefits || "");
            setHowItWorks(mol.howItWorks || "");
            setDosage(mol.dosage || "");
            setSideEffects(mol.sideEffects || "");
            setWarnings(mol.warnings || "");
            setPrecautions(mol.precautions || "");
            setStorage(mol.storage || "");

            // FAQs & References
            setFaqs(mol.faqs || []);
            setReferences(mol.references || []);

            // Relationships
            if (mol.relatedMolecules) {
              setRelatedMolecules(mol.relatedMolecules.map((m) => m._id || m.id || m));
            }

            // SEO
            if (mol.seo) {
              setMetaTitle(mol.seo.metaTitle || "");
              setMetaDescription(mol.seo.metaDescription || "");
              setFocusKeyword(mol.seo.focusKeyword || "");
              setSeoKeywords(mol.seo.seoKeywords || []);
              setCanonicalUrl(mol.seo.canonicalUrl || "");
              setOpenGraphTitle(mol.seo.openGraphTitle || "");
              setOpenGraphDescription(mol.seo.openGraphDescription || "");
              setOgImage(mol.seo.ogImage || "");
              setSearchTags(mol.seo.searchTags || []);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load form config or molecule details", err);
        toast.error("Failed to load molecule information.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditMode]);

  // Handle FAQ list management
  const addFaqItem = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };
  const removeFaqItem = (index) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };
  const handleFaqChange = (index, field, value) => {
    setFaqs(faqs.map((f, idx) => idx === index ? { ...f, [field]: value } : f));
  };

  // Handle Reference list management
  const addReferenceItem = () => {
    setReferences([...references, ""]);
  };
  const removeReferenceItem = (index) => {
    setReferences(references.filter((_, idx) => idx !== index));
  };
  const handleReferenceChange = (index, value) => {
    setReferences(references.map((r, idx) => idx === index ? value : r));
  };

  // Handle Chips lists management
  const removeSeoKeyword = (keywordToRemove) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== keywordToRemove));
  };

  const removeSearchTag = (tagToRemove) => {
    setSearchTags(searchTags.filter((t) => t !== tagToRemove));
  };

  // Submit Handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Molecule name is required.");
      return;
    }

    const parsedAliases = aliases
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const cleanFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    const cleanRefs = references.filter((r) => r.trim());

    const moleculeData = {
      name: name.trim(),
      aliases: parsedAliases,
      letter: letter.trim() || name.trim().charAt(0).toUpperCase(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      isActive,

      // Clinical
      uses: uses.trim(),
      benefits: benefits.trim(),
      howItWorks: howItWorks.trim(),
      dosage: dosage.trim(),
      sideEffects: sideEffects.trim(),
      warnings: warnings.trim(),
      precautions: precautions.trim(),
      storage: storage.trim(),

      // FAQs & References
      faqs: cleanFaqs,
      references: cleanRefs,

      // Relationships
      relatedMolecules,

      seo: {
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
        focusKeyword: focusKeyword.trim() || undefined,
        seoKeywords: seoKeywords,
        canonicalUrl: canonicalUrl.trim() || undefined,
        openGraphTitle: openGraphTitle.trim() || undefined,
        openGraphDescription: openGraphDescription.trim() || undefined,
        ogImage: ogImage.trim() || undefined,
        searchTags: searchTags
      }
    };

    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.updateMolecule(id, moleculeData);
        toast.success("Molecule updated successfully!");
      } else {
        await api.createMolecule(moleculeData);
        toast.success("Molecule created successfully!");
      }
      navigate("/admin/molecules");
    } catch (err) {
      console.error("Save molecule failed", err);
      toast.error(err.response?.data?.message || "Failed to save molecule.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Info },
    { id: "clinical", label: "Clinical Specs", icon: Tag },
    { id: "cms", label: "FAQs & references", icon: FileText },
    { id: "relationships", label: "Related Molecules", icon: LinkIcon },
    { id: "seo", label: "SEO Metadata", icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-lg text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-md border-b border-slate-100 dark:border-zinc-800 pb-md">
        <button
          onClick={() => navigate("/admin/molecules")}
          className="p-sm text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight">
            {isEditMode ? `Edit Molecule: ${name}` : "Create New Molecule"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure generic active chemical compounds and medical descriptions.</p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto gap-sm select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-xs px-md py-sm border-b-2 font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-[#004782] text-[#004782] dark:text-[#a4c9ff] dark:border-[#a4c9ff]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave} className="space-y-lg text-xs">
        
        {/* TAB 1: BASIC INFO */}
        {activeTab === "basic" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
            <h3 className="font-bold text-sm text-slate-850 dark:text-zinc-150 border-b border-slate-100 dark:border-zinc-800 pb-xs">General Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
              <div className="space-y-xs sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Molecule Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="e.g. Paracetamol"
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alphabet Letter Index *</label>
                <input
                  type="text"
                  required
                  maxLength={1}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value.toUpperCase())}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none font-bold text-center"
                  placeholder="e.g. P"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aliases / Brands Chemical Synonyms (Comma Separated)</label>
                <input
                  type="text"
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="e.g. Acetaminophen, APAP"
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slug (Optional - auto generated if blank)</label>
                <input
                  type="text"
                  disabled={!isEditMode}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-sm bg-slate-100 dark:bg-zinc-950/40 border border-slate-250 dark:border-zinc-800 rounded-xl outline-none font-mono text-[11px]"
                  placeholder="e.g. paracetamol"
                />
              </div>
            </div>


            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Description (Appears in catalog grid/headers) *</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="e.g. A widely used over-the-counter pain reliever and fever reducer."
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description (About section)</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="Deep clinical details about how the drug operates and its clinical history."
              />
            </div>

            <div className="flex gap-md pt-xs select-none">
              <label className="flex items-center gap-xs font-bold text-slate-600 dark:text-zinc-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                Active Status (Visible to Customers)
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: CLINICAL DETAILS */}
        {activeTab === "clinical" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
            <h3 className="font-bold text-sm text-slate-850 dark:text-zinc-150 border-b border-slate-100 dark:border-zinc-800 pb-xs">Clinical Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Uses</label>
                <textarea
                  rows={3}
                  value={uses}
                  onChange={(e) => setUses(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="Relief of mild to moderate pain..."
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Benefits</label>
                <textarea
                  rows={3}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="Gentle on stomach..."
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">How It Works (Mechanism of Action)</label>
              <textarea
                rows={3}
                value={howItWorks}
                onChange={(e) => setHowItWorks(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="It works by blocking COX enzymes in the central nervous system..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage Guidelines</label>
                <textarea
                  rows={3}
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="Adults: 500mg-1000mg every 4-6 hours..."
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Instructions</label>
                <textarea
                  rows={3}
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="Store at room temperature below 30°C..."
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Possible Side Effects</label>
              <textarea
                rows={3}
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="Nausea, skin rashes..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warnings</label>
                <textarea
                  rows={3}
                  value={warnings}
                  onChange={(e) => setWarnings(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="Severe liver damage may occur if maximum dose is exceeded..."
                />
              </div>
              <div className="space-y-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precautions</label>
                <textarea
                  rows={3}
                  value={precautions}
                  onChange={(e) => setPrecautions(e.target.value)}
                  className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                  placeholder="Avoid if you have liver disease or consume alcohol regularly..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FAQs & REFERENCES */}
        {activeTab === "cms" && (
          <div className="space-y-lg">
            
            {/* FAQ Manager */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-xs">
                <h3 className="font-bold text-sm text-slate-850 dark:text-zinc-150">Frequently Asked Questions</h3>
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="inline-flex items-center gap-xs px-sm py-1 border border-[#038076] text-[#038076] rounded-xl font-bold hover:bg-[#038076]/5 select-none cursor-pointer"
                >
                  <Plus size={12} /> Add FAQ
                </button>
              </div>

              {faqs.length > 0 ? (
                <div className="space-y-md divide-y divide-slate-100 dark:divide-zinc-800">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="pt-md first:pt-0 space-y-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-450 uppercase text-[9px] tracking-wider">FAQ Item #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeFaqItem(idx)}
                          className="p-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                          title="Remove FAQ"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-sm">
                        <input
                          type="text"
                          required
                          value={faq.question}
                          onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                          className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                          placeholder="Enter Question..."
                        />
                        <textarea
                          rows={2}
                          required
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                          className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                          placeholder="Enter Answer..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-450 italic py-md">No FAQs defined yet.</p>
              )}
            </div>

            {/* Reference Manager */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-xs">
                <h3 className="font-bold text-sm text-slate-850 dark:text-zinc-150">Clinical References</h3>
                <button
                  type="button"
                  onClick={addReferenceItem}
                  className="inline-flex items-center gap-xs px-sm py-1 border border-[#038076] text-[#038076] rounded-xl font-bold hover:bg-[#038076]/5 select-none cursor-pointer"
                >
                  <Plus size={12} /> Add Reference
                </button>
              </div>

              {references.length > 0 ? (
                <div className="space-y-sm">
                  {references.map((ref, idx) => (
                    <div key={idx} className="flex gap-sm items-center">
                      <input
                        type="text"
                        required
                        value={ref}
                        onChange={(e) => handleReferenceChange(idx, e.target.value)}
                        className="flex-1 p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                        placeholder="e.g. World Health Organization Drug Information Guidelines..."
                      />
                      <button
                        type="button"
                        onClick={() => removeReferenceItem(idx)}
                        className="p-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all shrink-0"
                        title="Remove Reference"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-450 italic py-md">No references added.</p>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: RELATIONSHIPS */}
        {activeTab === "relationships" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
            <h3 className="font-bold text-sm text-slate-850 dark:text-zinc-150 border-b border-slate-100 dark:border-zinc-800 pb-xs">Related Molecules</h3>
            <p className="text-xs text-slate-400">Choose molecules related to this active ingredient (these will show on its client detail page).</p>
            
            {allMolecules.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-md pt-xs">
                {allMolecules.map((mol) => {
                  const molId = mol.id || mol._id;
                  const isChecked = relatedMolecules.includes(molId);
                  return (
                    <button
                      key={molId}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setRelatedMolecules(prev => prev.filter(id => id !== molId));
                        } else {
                          setRelatedMolecules(prev => [...prev, molId]);
                        }
                      }}
                      className={`flex items-center gap-xs px-sm py-sm rounded-xl border text-left font-semibold transition-all select-none cursor-pointer ${
                        isChecked
                          ? "bg-[#038076]/10 border-[#038076] text-[#038076]"
                          : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {isChecked && <span className="font-extrabold font-mono">✓</span>}
                      {mol.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-slate-450 italic py-md">No other molecules found to link.</p>
            )}
          </div>
        )}

        {/* TAB 5: SEO METADATA */}
        {activeTab === "seo" && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-lg shadow-xs space-y-md">
            <h3 className="font-bold text-sm text-slate-850 dark:text-zinc-150 border-b border-slate-100 dark:border-zinc-800 pb-xs">SEO Metadata</h3>
            
            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Title (Fallback is Molecule Name)</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="e.g. Paracetamol tablets 500mg active compound"
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta Description (Fallback is Short Description)</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="Summarize the medical properties for search engine results..."
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Focus Keyword</label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="e.g. Paracetamol"
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Keywords (Press Enter to add)</label>
              <div className="flex flex-wrap gap-xs p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus-within:bg-white focus-within:border-primary">
                {seoKeywords.map((kw, idx) => (
                  <span key={idx} className="inline-flex items-center gap-[4px] px-sm py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 select-none">
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeSeoKeyword(kw)}
                      className="text-primary hover:text-red-500 font-extrabold focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type keyword and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val && !seoKeywords.includes(val)) {
                        setSeoKeywords([...seoKeywords, val]);
                        e.target.value = "";
                      }
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs focus:ring-0 p-0"
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Canonical URL (Fallback is Current Molecule URL)</label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="e.g. https://wellmeds.com/molecules/paracetamol"
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Graph Title (Fallback is SEO Title)</label>
              <input
                type="text"
                value={openGraphTitle}
                onChange={(e) => setOpenGraphTitle(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="e.g. Paracetamol active compound summary"
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Graph Description (Fallback is Meta Description)</label>
              <textarea
                rows={3}
                value={openGraphDescription}
                onChange={(e) => setOpenGraphDescription(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="Summarize the properties for social sharing previews..."
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Graph Image URL (Fallback is Default OG Image)</label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus:bg-white focus:border-primary rounded-xl outline-none"
                placeholder="e.g. https://wellmeds.com/images/paracetamol-og.jpg"
              />
            </div>

            <div className="space-y-xs">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Tags (Press Enter to add)</label>
              <div className="flex flex-wrap gap-xs p-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus-within:bg-white focus-within:border-primary">
                {searchTags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-[4px] px-sm py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 select-none">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeSearchTag(tag)}
                      className="text-primary hover:text-red-500 font-extrabold focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Type tag and press Enter..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val && !searchTags.includes(val)) {
                        setSearchTags([...searchTags, val]);
                        e.target.value = "";
                      }
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs focus:ring-0 p-0"
                />
              </div>
            </div>

          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-sm pt-md border-t border-slate-100 dark:border-zinc-800">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-xs bg-[#004782] text-white px-lg py-sm rounded-xl font-bold text-xs hover:opacity-90 transition-all select-none cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Save size={14} /> {isSaving ? "Saving Compound..." : "Save Molecule Details"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/molecules")}
            disabled={isSaving}
            className="inline-flex items-center justify-center border border-slate-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 px-lg py-sm rounded-xl font-bold text-xs hover:bg-slate-50 transition-all select-none cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminAddNewMolecule;
