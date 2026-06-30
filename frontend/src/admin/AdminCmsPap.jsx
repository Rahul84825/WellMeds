import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import Loader from "../components/Loader";
import { Save, Upload, Plus, Trash, Heart, FileText, CheckSquare, LayoutGrid, Gift, BarChart, HelpCircle, ShieldAlert } from "lucide-react";

const AdminCmsPap = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [hero, setHero] = useState({ label: "", heading: "", description: "", buttonPrimary: "", buttonSecondary: "", imageUrl: "" });
  const [whatIsPap, setWhatIsPap] = useState({ title: "", desc: "", points: [] });
  const [timeline, setTimeline] = useState([]);
  const [eligibility, setEligibility] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [seo, setSeo] = useState({ title: "", description: "", keywords: "", canonical: "", ogImage: "" });

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const response = await axios.get("/api/cms/pap");
        if (response.data.success) {
          const data = response.data.data;
          setHero(data.hero || {});
          setWhatIsPap(data.whatIsPap || { title: "", desc: "", points: [] });
          setTimeline(data.timeline || []);
          setEligibility(data.eligibility || []);
          setPrograms(data.programs || []);
          setStats(data.stats || []);
          setFaqs(data.faqs || []);
          setSeo(data.seo || {});
          if (data.hero?.imageUrl) {
            setPreviewUrl(data.hero.imageUrl);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load page content.");
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  const handleHeroChange = (e) => {
    const { name, value } = e.target;
    setHero((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatIsPapChange = (e) => {
    const { name, value } = e.target;
    setWhatIsPap((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setSeo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleListChange = (list, setList, index, field, value) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
  };

  const handlePointChange = (index, value) => {
    const updated = [...whatIsPap.points];
    updated[index] = value;
    setWhatIsPap((prev) => ({ ...prev, points: updated }));
  };

  const handleAddPoint = () => {
    setWhatIsPap((prev) => ({ ...prev, points: [...prev.points, ""] }));
  };

  const handleRemovePoint = (index) => {
    setWhatIsPap((prev) => ({ ...prev, points: prev.points.filter((_, i) => i !== index) }));
  };

  const handleAddProgram = () => {
    setPrograms((prev) => [...prev, { name: "", medicine: "", manufacturer: "", savings: "", eligibility: "" }]);
  };

  const handleRemoveProgram = (index) => {
    setPrograms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const data = new FormData();
    data.append("hero", JSON.stringify(hero));
    data.append("whatIsPap", JSON.stringify(whatIsPap));
    data.append("timeline", JSON.stringify(timeline));
    data.append("eligibility", JSON.stringify(eligibility));
    data.append("programs", JSON.stringify(programs));
    data.append("stats", JSON.stringify(stats));
    data.append("faqs", JSON.stringify(faqs));
    data.append("seo", JSON.stringify(seo));
    
    if (file) {
      data.append("image", file);
    }

    try {
      const response = await axios.put("/api/cms/pap", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      if (response.data.success) {
        toast.success("Patient Assistance Program page updated successfully!");
        setHero(response.data.data.hero);
        if (response.data.data.hero.imageUrl) {
          setPreviewUrl(response.data.data.hero.imageUrl);
        }
        setFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero Header", icon: Heart },
    { id: "about", label: "What is PAP", icon: FileText },
    { id: "timeline", label: "Timeline steps", icon: CheckSquare },
    { id: "eligibility", label: "Eligibility Cards", icon: LayoutGrid },
    { id: "programs", label: "Active Programs", icon: Gift },
    { id: "stats", label: "Trust Statistics", icon: BarChart },
    { id: "faqs", label: "FAQ Accordion", icon: HelpCircle },
    { id: "seo", label: "SEO Meta", icon: ShieldAlert }
  ];

  return (
    <div className="space-y-lg text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md border-b border-slate-200 dark:border-zinc-800 pb-md">
        <div>
          <h1 className="font-black text-xl sm:text-2xl text-slate-800 dark:text-zinc-100">
            Patient Assistance Program CMS
          </h1>
          <p className="text-xs text-slate-555 dark:text-zinc-400 font-medium">
            Manage public page layout, active brand programs, eligibility, and SEO tags dynamically.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-lg h-10 bg-[#086b53] hover:bg-[#065340] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-xs active:scale-95 transition-all shadow cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Page Changes"}
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-xs overflow-x-auto pb-xs scrollbar-none border-b border-slate-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-lg py-2.5 font-bold text-xs flex items-center gap-xs border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? "border-[#086b53] text-[#086b53] dark:text-[#84d6b9]" 
                  : "border-transparent text-slate-555 hover:text-slate-700 dark:hover:text-zinc-300"
              }`}
            >
              <TabIcon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
        {activeTab === "hero" && (
          <div className="space-y-md">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-xs">
              Hero Section Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-md">
                <div className="space-y-xs">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Hero Category Label</label>
                  <input
                    type="text"
                    name="label"
                    value={hero.label}
                    onChange={handleHeroChange}
                    className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53]"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Main Heading</label>
                  <input
                    type="text"
                    name="heading"
                    value={hero.heading}
                    onChange={handleHeroChange}
                    className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53]"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={hero.description}
                    onChange={handleHeroChange}
                    className="w-full p-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-sm">
                  <div className="space-y-xs">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Primary Button</label>
                    <input
                      type="text"
                      name="buttonPrimary"
                      value={hero.buttonPrimary}
                      onChange={handleHeroChange}
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53]"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Secondary Button</label>
                    <input
                      type="text"
                      name="buttonSecondary"
                      value={hero.buttonSecondary}
                      onChange={handleHeroChange}
                      className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53]"
                    />
                  </div>
                </div>
              </div>

              {/* Image Preview / Upload */}
              <div className="space-y-sm flex flex-col justify-center items-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-md bg-slate-50/40 dark:bg-zinc-950/20">
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Hero Graphic Image</p>
                {previewUrl ? (
                  <img src={previewUrl} alt="Hero Preview" className="w-full max-h-[160px] object-contain rounded-lg border border-slate-100" />
                ) : (
                  <div className="h-[160px] w-full flex items-center justify-center bg-slate-100 dark:bg-zinc-850 rounded-lg text-slate-400 text-xs font-bold">No Image Configured (Using Default SVG)</div>
                )}
                <div className="relative h-10 w-full max-w-[200px] border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-xl flex items-center justify-center gap-xs text-xs font-black text-slate-750 dark:text-zinc-200 cursor-pointer">
                  <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload size={14} />
                  Choose Hero Image
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-md">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-xs">
              What is Patient Assistance Program?
            </h3>
            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Section Title</label>
                <input
                  type="text"
                  name="title"
                  value={whatIsPap.title}
                  onChange={handleWhatIsPapChange}
                  className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53]"
                />
              </div>
              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Section Description</label>
                <textarea
                  name="desc"
                  rows="3"
                  value={whatIsPap.desc}
                  onChange={handleWhatIsPapChange}
                  className="w-full p-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] resize-none"
                />
              </div>
              
              <div className="space-y-sm">
                <div className="flex justify-between items-center border-b border-slate-150 dark:border-zinc-850/60 pb-xs">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Patient Benefit Bullet Points</p>
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="px-md h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-xs cursor-pointer select-none"
                  >
                    <Plus size={12} />
                    Add Benefit Point
                  </button>
                </div>

                <div className="space-y-xs">
                  {whatIsPap.points && whatIsPap.points.map((pt, idx) => (
                    <div key={idx} className="flex gap-sm items-center">
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => handlePointChange(idx, e.target.value)}
                        className="flex-1 h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-md">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-xs">
              PAP Verification Timeline Steps
            </h3>
            <div className="space-y-md">
              {timeline.map((step, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-md p-md bg-slate-50 dark:bg-zinc-950/20 rounded-xl border border-slate-150 dark:border-zinc-850/60 items-center">
                  <div className="sm:col-span-2 space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Step Identifier</label>
                    <input
                      type="text"
                      value={step.step || step.number}
                      onChange={(e) => handleListChange(timeline, setTimeline, idx, "step", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4 space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Step Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleListChange(timeline, setTimeline, idx, "title", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-6 space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Step Description</label>
                    <input
                      type="text"
                      value={step.desc}
                      onChange={(e) => handleListChange(timeline, setTimeline, idx, "desc", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "eligibility" && (
          <div className="space-y-md">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-xs">
              Eligibility Conditions (6 cards)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {eligibility.map((item, idx) => (
                <div key={idx} className="p-md border border-slate-150 dark:border-zinc-850/60 bg-slate-50/50 dark:bg-zinc-950/10 rounded-xl space-y-sm">
                  <div className="space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Condition Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleListChange(eligibility, setEligibility, idx, "title", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Short Description</label>
                    <textarea
                      rows="2"
                      value={item.desc}
                      onChange={(e) => handleListChange(eligibility, setEligibility, idx, "desc", e.target.value)}
                      className="w-full p-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-650 dark:text-zinc-300 outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "programs" && (
          <div className="space-y-md">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-xs">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100">
                Active Brand Patient Assistance Programs
              </h3>
              <button
                type="button"
                onClick={handleAddProgram}
                className="px-md h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-xs cursor-pointer select-none"
              >
                <Plus size={14} />
                Add Program Card
              </button>
            </div>

            <div className="space-y-md">
              {programs.map((prog, idx) => (
                <div key={idx} className="p-md border border-slate-155 dark:border-zinc-850 bg-slate-50/55 dark:bg-zinc-950/20 rounded-xl space-y-sm relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveProgram(idx)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                    title="Delete program"
                  >
                    <Trash size={14} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-zinc-500 uppercase">Program Name</label>
                      <input
                        type="text"
                        value={prog.name}
                        onChange={(e) => handleListChange(programs, setPrograms, idx, "name", e.target.value)}
                        className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none"
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-zinc-500 uppercase">Covered Medicine</label>
                      <input
                        type="text"
                        value={prog.medicine}
                        onChange={(e) => handleListChange(programs, setPrograms, idx, "medicine", e.target.value)}
                        className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none"
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-zinc-500 uppercase">Manufacturer / Brand</label>
                      <input
                        type="text"
                        value={prog.manufacturer}
                        onChange={(e) => handleListChange(programs, setPrograms, idx, "manufacturer", e.target.value)}
                        className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-800 dark:text-zinc-100 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-zinc-500 uppercase">Benefit / Savings</label>
                      <input
                        type="text"
                        value={prog.savings}
                        onChange={(e) => handleListChange(programs, setPrograms, idx, "savings", e.target.value)}
                        className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-emerald-650 dark:text-emerald-400 outline-none"
                      />
                    </div>
                    <div className="space-y-xs">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-zinc-500 uppercase">Program Eligibility Criteria</label>
                      <input
                        type="text"
                        value={prog.eligibility}
                        onChange={(e) => handleListChange(programs, setPrograms, idx, "eligibility", e.target.value)}
                        className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-650 dark:text-zinc-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-md">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-xs">
              Trust & Reach Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-md border border-slate-150 dark:border-zinc-850/60 bg-slate-50/50 dark:bg-zinc-950/10 rounded-xl space-y-sm">
                  <div className="space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Stat Value</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => handleListChange(stats, setStats, idx, "value", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-black text-slate-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Label Name</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleListChange(stats, setStats, idx, "label", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none"
                    />
                  </div>
                  <div className="space-y-xs">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">Additional Description</label>
                    <input
                      type="text"
                      value={stat.desc}
                      onChange={(e) => handleListChange(stats, setStats, idx, "desc", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-550 dark:text-zinc-455 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "faqs" && (
          <div className="space-y-md">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-xs">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100">
                Frequently Asked Questions Accordion
              </h3>
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-md h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-xs cursor-pointer select-none"
              >
                <Plus size={14} />
                Add FAQ Item
              </button>
            </div>

            <div className="space-y-md">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-md border border-slate-150 dark:border-zinc-850/60 bg-slate-50/50 dark:bg-zinc-950/10 rounded-xl space-y-sm relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                    title="Delete item"
                  >
                    <Trash size={14} />
                  </button>

                  <div className="space-y-xs pr-8">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">FAQ Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleListChange(faqs, setFaqs, idx, "question", e.target.value)}
                      className="w-full h-9 px-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-800 dark:text-zinc-100 outline-none"
                    />
                  </div>
                  <div className="space-y-xs pr-8">
                    <label className="text-[10px] font-bold text-slate-450 dark:text-zinc-500 uppercase">FAQ Answer</label>
                    <textarea
                      rows="2"
                      value={faq.answer}
                      onChange={(e) => handleListChange(faqs, setFaqs, idx, "answer", e.target.value)}
                      className="w-full p-sm rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-650 dark:text-zinc-300 outline-none resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-md">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-xs">
              SEO & Metadata Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Meta HTML Title</label>
                <input
                  type="text"
                  name="title"
                  value={seo.title}
                  onChange={handleSeoChange}
                  className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53]"
                />
              </div>
              <div className="space-y-xs">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Canonical URL</label>
                <input
                  type="text"
                  name="canonical"
                  value={seo.canonical}
                  onChange={handleSeoChange}
                  placeholder="e.g. https://wellmeds.com/patient-assistance-program"
                  className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-850 dark:text-zinc-200 outline-none focus:border-[#086b53]"
                />
              </div>
              <div className="space-y-xs sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Meta Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={seo.description}
                  onChange={handleSeoChange}
                  className="w-full p-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53] resize-none"
                />
              </div>
              <div className="space-y-xs sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Focus Keywords (comma-separated)</label>
                <input
                  type="text"
                  name="keywords"
                  value={seo.keywords}
                  onChange={handleSeoChange}
                  className="w-full h-10 px-md rounded-lg border border-slate-200 dark:border-zinc-800 bg-transparent text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-[#086b53]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCmsPap;
