import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import Loader from "../components/Loader";
import slugify from "slugify";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  HelpCircle,
  Link as LinkIcon,
  ListOrdered,
  Eye,
  CheckCircle,
  X,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Globe,
  UploadCloud,
  ChevronUp,
  ChevronDown,
  Table as TableIcon,
  Sparkles,
  ClipboardPaste,
  Copy,
  RefreshCw,
} from "lucide-react";
import { ARTICLE_CATEGORIES } from "./AdminArticles";

// ── Parsing and Serialization Helpers (similar to AdminAddNewProduct) ──

const cleanBulletLine = (line) => {
  let cleaned = line.trim();
  cleaned = cleaned.replace(/^\s*(?:[•\-*\u2022\u2219\u25e6\u25aa\u25ab\u2043\u2014]|\d+[\.)])\s*/, "");
  return cleaned.trim();
};

const parseMultiLineBullets = (text) => {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((l) => cleanBulletLine(l))
    .filter(Boolean);
};

const serializeMultiLineBullets = (arr) => {
  if (!arr || !arr.length) return "";
  return arr.join("\n");
};

const parseMultiLineParagraphs = (text) => {
  if (!text) return [];
  // Split by double newline or single newline if paragraphs
  const blocks = text.split(/\r?\n\s*\r?\n/);
  if (blocks.length > 1) {
    return blocks.map((b) => b.trim()).filter(Boolean);
  }
  // Fallback: if user used single newlines for paragraphs
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
};

const serializeMultiLineParagraphs = (arr) => {
  if (!arr || !arr.length) return "";
  return arr.join("\n\n");
};

const parseFaqsText = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const faqs = [];
  let currentQ = "";
  let currentA = "";

  for (const line of lines) {
    if (/^(?:q:|question:|\d+[\.)]\s*(?:q:)?)/i.test(line)) {
      if (currentQ) {
        faqs.push({ question: currentQ, answer: currentA.trim(), order: faqs.length + 1 });
        currentA = "";
      }
      currentQ = line.replace(/^(?:q:|question:|\d+[\.)]\s*(?:q:)?)\s*/i, "").trim();
    } else if (/^(?:a:|answer:)/i.test(line)) {
      currentA += (currentA ? "\n" : "") + line.replace(/^(?:a:|answer:)\s*/i, "").trim();
    } else {
      if (!currentQ) {
        currentQ = line.replace(/^\d+[\.)]\s*/, "");
      } else {
        currentA += (currentA ? "\n" : "") + line;
      }
    }
  }

  if (currentQ) {
    faqs.push({ question: currentQ, answer: currentA.trim(), order: faqs.length + 1 });
  }

  return faqs;
};

const serializeFaqsText = (faqsList) => {
  if (!faqsList || !faqsList.length) return "";
  return faqsList
    .map((f, i) => `Q${i + 1}: ${f.question}\nA: ${f.answer}`)
    .join("\n\n");
};

const parseReferencesText = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const refs = [];

  for (const line of lines) {
    const cleaned = cleanBulletLine(line);
    if (!cleaned) continue;

    // Check if contains URL
    const urlMatch = cleaned.match(/https?:\/\/[^\s]+/i);
    const url = urlMatch ? urlMatch[0] : "";
    const titleWithoutUrl = url ? cleaned.replace(url, "").trim().replace(/[-–—|]\s*$/, "").trim() : cleaned;

    refs.push({
      title: titleWithoutUrl || url,
      source: "",
      url: url,
      order: refs.length + 1,
    });
  }

  return refs;
};

const serializeReferencesText = (refsList) => {
  if (!refsList || !refsList.length) return "";
  return refsList
    .map((r) => (r.url ? `${r.title} - ${r.url}` : r.title))
    .join("\n");
};

const AdminAddNewArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [toastMessage, setToastMessage] = useState(null);

  // ── Form State ──
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(ARTICLE_CATEGORIES[0] || "Oral & Dental Health");
  const [categoryBadge, setCategoryBadge] = useState("");
  const [topic, setTopic] = useState("General");
  const [readTime, setReadTime] = useState("5 min read");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState("published");
  const [isFeatured, setIsFeatured] = useState(false);
  const [heroImage, setHeroImage] = useState("");
  const [secondaryImage, setSecondaryImage] = useState("");
  const [secondaryImageCaption, setSecondaryImageCaption] = useState("");
  const [uploadingSecondary, setUploadingSecondary] = useState(false);

  // Dates
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 16));

  // Author & Reviewer
  const [authorName, setAuthorName] = useState("Dr. Meenakshi Maruwada");
  const [authorTitle, setAuthorTitle] = useState("Dental Surgeon");
  const [authorCredentials, setAuthorCredentials] = useState("BDS, PGCAD, GMHE (IIM-B)");
  const [authorAvatar, setAuthorAvatar] = useState("");

  const [reviewerName, setReviewerName] = useState("Dr. Betina Chandolia");
  const [reviewerQualifications, setReviewerQualifications] = useState("BDS, MDS, PGCCL, PGDMH");

  // Table of Contents
  const [tableOfContents, setTableOfContents] = useState([]);

  // Content Sections
  const [sections, setSections] = useState([
    {
      id: "introduction",
      heading: "Introduction",
      type: "text",
      paragraphs: [""],
      bullets: [],
      numbered: [],
      images: [],
      table: null,
      callout: "",
      order: 1,
    },
  ]);

  // Section Textarea string cache for rapid copy-pasting
  const [sectionTextMap, setSectionTextMap] = useState({});
  const [sectionBulletsMap, setSectionBulletsMap] = useState({});

  // FAQs and References
  const [faqs, setFaqs] = useState([]);
  const [faqsRawText, setFaqsRawText] = useState("");

  const [references, setReferences] = useState([]);
  const [referencesRawText, setReferencesRawText] = useState("");

  // Full Raw Content Quick Import Modal / Drawer
  const [showQuickImport, setShowQuickImport] = useState(false);
  const [quickImportText, setQuickImportText] = useState("");

  // Disclaimer & SEO
  const [disclaimer, setDisclaimer] = useState(
    "This article is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider for diagnosis and treatment."
  );
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    ogImage: "",
    keywords: [],
  });

  const fileInputRef = useRef(null);
  const secondaryFileInputRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load article if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const art = await api.adminGetArticleById(id);
        if (!isMounted || !art) return;

        setTitle(art.title || "");
        setSlug(art.slug || "");
        setCategory(art.category || ARTICLE_CATEGORIES[0]);
        setCategoryBadge(art.categoryBadge || "");
        setTopic(art.topic || "General");
        setReadTime(art.readTime || "5 min read");
        setExcerpt(art.excerpt || "");
        setStatus(art.status || "published");
        setIsFeatured(Boolean(art.isFeatured));
        setHeroImage(art.heroImage || art.coverImage || "");
        setSecondaryImage(art.secondaryImage || "");
        setSecondaryImageCaption(art.secondaryImageCaption || "");

        if (art.publishedAt) {
          setPublishedAt(new Date(art.publishedAt).toISOString().slice(0, 16));
        }

        if (art.author) {
          setAuthorName(art.author.name || "");
          setAuthorTitle(art.author.title || "");
          setAuthorCredentials(art.author.credentials || "");
          setAuthorAvatar(art.author.avatar || "");
        }

        if (art.reviewer) {
          setReviewerName(art.reviewer.name || "");
          setReviewerQualifications(art.reviewer.qualifications || "");
        }

        setTableOfContents(art.tableOfContents || []);
        
        const loadedSections = art.sections && art.sections.length > 0 ? art.sections : [];
        setSections(loadedSections);

        // Populate raw maps
        const pMap = {};
        const bMap = {};
        loadedSections.forEach((s, idx) => {
          pMap[idx] = serializeMultiLineParagraphs(s.paragraphs);
          bMap[idx] = serializeMultiLineBullets(s.bullets);
        });
        setSectionTextMap(pMap);
        setSectionBulletsMap(bMap);

        setFaqs(art.faqs || []);
        setFaqsRawText(serializeFaqsText(art.faqs));

        setReferences(art.references || []);
        setReferencesRawText(serializeReferencesText(art.references));

        if (art.disclaimer) setDisclaimer(art.disclaimer);
        if (art.seo) {
          setSeo({
            metaTitle: art.seo.metaTitle || "",
            metaDescription: art.seo.metaDescription || "",
            canonicalUrl: art.seo.canonicalUrl || "",
            ogImage: art.seo.ogImage || "",
            keywords: art.seo.keywords || [],
          });
        }
      } catch (err) {
        console.error("Failed to load article", err);
        showToast("Failed to load article data", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchArticleData();
    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  // Handle title & auto-slug
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditMode || !slug) {
      setSlug(slugify(val, { lower: true, strict: true }));
    }
  };

  // Hero Image Upload handler
  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setHeroImage(res.url);
        showToast("Hero image uploaded successfully!");
      }
    } catch (err) {
      console.error("Hero upload failed", err);
      showToast("Failed to upload image. Please check file format.", "error");
    } finally {
      setUploadingHero(false);
    }
  };

  // Secondary / Mid-Article Image Upload handler
  const handleSecondaryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSecondary(true);
    try {
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setSecondaryImage(res.url);
        showToast("Mid-content image uploaded successfully!");
      }
    } catch (err) {
      console.error("Secondary image upload failed", err);
      showToast("Failed to upload image. Please check file format.", "error");
    } finally {
      setUploadingSecondary(false);
    }
  };

  // Auto-sync Table of Contents from sections
  const handleSyncTocFromSections = () => {
    const newToc = sections
      .filter((s) => s.heading && s.heading.trim())
      .map((s, idx) => ({
        id: s.id || `section-${idx + 1}`,
        label: s.heading.trim(),
        level: 2,
        order: idx + 1,
      }));

    if (faqs.length > 0) {
      newToc.push({ id: "faqs", label: "FAQs", level: 2, order: newToc.length + 1 });
    }

    setTableOfContents(newToc);
    showToast(`Synced ${newToc.length} items to Table of Contents!`);
  };

  // ── Quick Import Parser (Extracts Headings, Paragraphs, Bullets, FAQs) ──
  const handleApplyQuickImport = () => {
    if (!quickImportText || !quickImportText.trim()) return;

    const lines = quickImportText.split(/\r?\n/);
    const parsedSections = [];
    let currentSec = null;
    let currentParagraphs = [];
    let currentBullets = [];

    const flushCurrentSection = () => {
      if (currentSec || currentParagraphs.length > 0 || currentBullets.length > 0) {
        parsedSections.push({
          id: currentSec ? slugify(currentSec, { lower: true, strict: true }) : `section-${parsedSections.length + 1}`,
          heading: currentSec || `Section ${parsedSections.length + 1}`,
          type: currentBullets.length > 0 ? "mixed" : "text",
          paragraphs: currentParagraphs.length > 0 ? currentParagraphs : [""],
          bullets: currentBullets,
          numbered: [],
          images: [],
          table: null,
          callout: "",
          order: parsedSections.length + 1,
        });
        currentParagraphs = [];
        currentBullets = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Heading detection (Markdown # or ## or Capitalized short line)
      if (/^#{1,4}\s+/.test(line)) {
        flushCurrentSection();
        currentSec = line.replace(/^#{1,4}\s+/, "").trim();
      } else if (/^[•\-*\u2022\u2219\u25e6\u25aa\u25ab\u2043\u2014]\s+/.test(line) || /^\d+[\.)]\s+/.test(line)) {
        currentBullets.push(cleanBulletLine(line));
      } else {
        currentParagraphs.push(line);
      }
    }

    flushCurrentSection();

    if (parsedSections.length > 0) {
      setSections(parsedSections);

      // Re-populate text maps
      const pMap = {};
      const bMap = {};
      parsedSections.forEach((s, idx) => {
        pMap[idx] = serializeMultiLineParagraphs(s.paragraphs);
        bMap[idx] = serializeMultiLineBullets(s.bullets);
      });
      setSectionTextMap(pMap);
      setSectionBulletsMap(bMap);

      // Auto generate TOC
      const autoToc = parsedSections.map((s, idx) => ({
        id: s.id,
        label: s.heading,
        level: 2,
        order: idx + 1,
      }));
      setTableOfContents(autoToc);

      setShowQuickImport(false);
      showToast(`Successfully parsed and built ${parsedSections.length} sections!`);
    }
  };

  // Section Add / Remove / Reorder
  const handleAddSection = () => {
    const newIdx = sections.length;
    const newSec = {
      id: `section-${newIdx + 1}`,
      heading: `New Section ${newIdx + 1}`,
      type: "text",
      paragraphs: [""],
      bullets: [],
      numbered: [],
      images: [],
      table: null,
      callout: "",
      order: newIdx + 1,
    };
    setSections([...sections, newSec]);
  };

  const handleRemoveSection = (idx) => {
    const updated = sections.filter((_, i) => i !== idx);
    setSections(updated);
  };

  const handleMoveSection = (idx, direction) => {
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === sections.length - 1)) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...sections];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSections(updated);
  };

  // Direct section multi-line paragraph paste handler
  const handleSectionParagraphsTextChange = (idx, val) => {
    setSectionTextMap({ ...sectionTextMap, [idx]: val });
    const parsed = parseMultiLineParagraphs(val);
    const updated = [...sections];
    updated[idx].paragraphs = parsed.length > 0 ? parsed : [""];
    setSections(updated);
  };

  // Direct section multi-line bullets paste handler
  const handleSectionBulletsTextChange = (idx, val) => {
    setSectionBulletsMap({ ...sectionBulletsMap, [idx]: val });
    const parsed = parseMultiLineBullets(val);
    const updated = [...sections];
    updated[idx].bullets = parsed;
    setSections(updated);
  };

  // FAQ Raw Text paste handler
  const handleFaqsRawChange = (val) => {
    setFaqsRawText(val);
    const parsed = parseFaqsText(val);
    setFaqs(parsed);
  };

  // References Raw Text paste handler
  const handleReferencesRawChange = (val) => {
    setReferencesRawText(val);
    const parsed = parseReferencesText(val);
    setReferences(parsed);
  };

  // Table Handlers
  const handleAddTableToSection = (sIdx) => {
    const updated = [...sections];
    updated[sIdx].table = {
      headers: ["What you see", "What it may mean", "What to do"],
      rows: [
        ["Single flat dark dot", "Benign pigmentation", "Mention at next dental visit"],
        ["Dark furry coated surface", "Black hairy tongue", "Scrape tongue, improve hygiene"],
      ],
    };
    setSections(updated);
  };

  const handleRemoveTableFromSection = (sIdx) => {
    const updated = [...sections];
    updated[sIdx].table = null;
    setSections(updated);
  };

  // Submit Save
  const handleSave = async (overrideStatus) => {
    if (!title.trim()) {
      showToast("Please enter an article title.", "error");
      setActiveTab("basic");
      return;
    }

    const finalStatus = overrideStatus || status;

    const validToc = (tableOfContents || [])
      .filter((t) => t && t.label && t.label.trim())
      .map((t, i) => ({
        ...t,
        order: i + 1,
        label: t.label.trim(),
        id: (t.id || slugify(t.label || `item-${i + 1}`, { lower: true, strict: true })).trim(),
      }));

    const validSections = (sections || [])
      .filter((s) => s && (s.heading?.trim() || (s.paragraphs && s.paragraphs.some(p => p && p.trim())) || (s.bullets && s.bullets.length > 0)))
      .map((s, i) => ({
        ...s,
        order: i + 1,
        heading: (s.heading || "").trim(),
        id: (s.id || slugify(s.heading || `section-${i + 1}`, { lower: true, strict: true })).trim(),
        paragraphs: (s.paragraphs || []).filter((p) => typeof p === "string" && p.trim()),
        bullets: (s.bullets || []).filter((b) => typeof b === "string" && b.trim()),
        table: s.table && s.table.headers && s.table.headers.length > 0 ? s.table : null,
      }));

    const validFaqs = (faqs || [])
      .filter((f) => f && f.question && f.question.trim())
      .map((f, i) => ({
        question: f.question.trim(),
        answer: (f.answer || "").trim(),
        order: i + 1,
      }));

    const validRefs = (references || [])
      .filter((r) => r && r.title && r.title.trim())
      .map((r, i) => ({
        title: r.title.trim(),
        source: (r.source || "").trim(),
        url: (r.url || "").trim(),
        order: i + 1,
      }));

    const payload = {
      title: title.trim(),
      slug: slugify(slug || title, { lower: true, strict: true }),
      category: category || ARTICLE_CATEGORIES[0],
      categoryBadge: (categoryBadge || "").trim(),
      topic: (topic || "General").trim(),
      readTime: (readTime || "5 min read").trim(),
      excerpt: (excerpt || "").trim(),
      status: finalStatus,
      active: finalStatus === "published",
      isFeatured,
      heroImage: heroImage || "",
      coverImage: heroImage || "",
      secondaryImage: secondaryImage || "",
      secondaryImageCaption: (secondaryImageCaption || "").trim(),
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      author: {
        name: (authorName || "").trim(),
        title: (authorTitle || "").trim(),
        credentials: (authorCredentials || "").trim(),
        avatar: authorAvatar || "",
      },
      reviewer: {
        name: (reviewerName || "").trim(),
        qualifications: (reviewerQualifications || "").trim(),
      },
      tableOfContents: validToc,
      sections: validSections.length > 0 ? validSections : [
        {
          id: "introduction",
          heading: "Introduction",
          type: "text",
          paragraphs: [excerpt || title],
          bullets: [],
          order: 1,
        },
      ],
      faqs: validFaqs,
      references: validRefs,
      disclaimer: disclaimer || "",
      seo: {
        metaTitle: seo.metaTitle || title,
        metaDescription: seo.metaDescription || excerpt,
        canonicalUrl: seo.canonicalUrl || "",
        ogImage: seo.ogImage || heroImage || "",
        keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
      },
    };

    setIsSaving(true);
    try {
      if (isEditMode) {
        await api.updateArticle(id, payload);
        showToast("Article saved successfully!");
        if (finalStatus === "published") {
          setTimeout(() => navigate("/admin/articles"), 600);
        }
      } else {
        const created = await api.createArticle(payload);
        showToast("Article published successfully!");
        if (finalStatus === "published") {
          setTimeout(() => navigate("/admin/articles"), 600);
        } else {
          navigate(`/admin/articles/${created._id}/edit`, { replace: true });
        }
      }
    } catch (err) {
      console.error("Save article error", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to save article. Please try again.";
      showToast(errMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader />
        <p className="text-xs text-slate-500 mt-4">Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-28">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
            toastMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200"
              : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
          }`}
        >
          <Sparkles size={16} />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* ── TOP ACTION BAR ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-4 z-30 backdrop-blur-md bg-white/90 dark:bg-zinc-900/90">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/articles")}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#0F3B34] dark:text-zinc-100">
              {isEditMode ? "Edit Clinical Article" : "Create New Article"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {isEditMode ? `Editing: ${title || "Untitled"}` : "Fill information or copy-paste content"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Import Modal Button */}
          <button
            type="button"
            onClick={() => setShowQuickImport(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-[#157A6D]/30 bg-[#157A6D]/10 text-xs font-bold text-[#157A6D] dark:text-emerald-400 hover:bg-[#157A6D]/20 transition cursor-pointer"
          >
            <ClipboardPaste size={14} />
            Quick Paste Full Article
          </button>

          {slug && (
            <a
              href={`/articles/${slug}?preview=true`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 transition shadow-2xs"
            >
              <Eye size={14} />
              Preview
            </a>
          )}

          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-100 transition cursor-pointer"
          >
            <Save size={14} />
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#0F3B34] hover:bg-[#157A6D] text-white text-xs font-extrabold transition shadow-sm active:scale-95 cursor-pointer"
          >
            <CheckCircle size={15} />
            {isSaving ? "Saving..." : "Publish Article"}
          </button>
        </div>
      </div>

      {/* ── QUICK PASTE IMPORT MODAL ── */}
      {showQuickImport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0F3B34] dark:text-zinc-100">
                <ClipboardPaste className="w-5 h-5 text-[#157A6D]" />
                <h3 className="font-bold text-base">Quick Paste / Markdown Import</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickImport(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Paste your full article text below. Headings (e.g. <code>## Section Heading</code>) and bullet lists (e.g. <code>- Item</code>) will be automatically converted into structured sections and synced with the Table of Contents!
            </p>

            <textarea
              rows={12}
              value={quickImportText}
              onChange={(e) => setQuickImportText(e.target.value)}
              placeholder={`## 1. What is Oral Health?\nOral health is a key indicator of overall health, well-being and quality of life.\n\n## 2. Common Causes of Tongue Spots\n- Black Hairy Tongue\n- Oral Trauma\n- Medication Side Effects\n\n## 3. When to See a Doctor\nPersistent spots lasting over 2 weeks should be evaluated.`}
              className="w-full p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuickImport(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyQuickImport}
                className="px-5 py-2 rounded-xl bg-[#0F3B34] hover:bg-[#157A6D] text-white text-xs font-bold transition shadow"
              >
                ✨ Parse & Build Sections
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-2 border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-wrap gap-1.5">
        {[
          { id: "basic", label: "Details & Meta", icon: FileText },
          { id: "hero", label: "Hero & Media", icon: ImageIcon },
          { id: "authors", label: "Author & Reviewer", icon: User },
          { id: "toc", label: "Table of Contents", icon: ListOrdered },
          { id: "sections", label: "Content Sections", icon: Layers },
          { id: "faqs", label: "FAQs Accordion", icon: HelpCircle },
          { id: "references", label: "References", icon: LinkIcon },
          { id: "seo", label: "SEO & Social", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-[#0F3B34] text-white shadow-xs"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: BASIC INFO ── */}
      {activeTab === "basic" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
            Article Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Black Spot on Tongue: Common Causes and When to Worry"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="black-spot-on-tongue-causes"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
              />
            </div>

            {/* Category Dropdown (Hardcoded WellMeds Categories) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
              >
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Read Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 10 min read"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
              />
            </div>

            {/* Published Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Published Date & Time
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Excerpt */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Summary / Excerpt
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short introductory summary for search previews and cards..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-normal text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: HERO & MEDIA ── */}
      {activeTab === "hero" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-10">
          <div>
            <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
              Article Images & Media Options
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Provide up to 2 images: a primary hero banner for the top, and a secondary illustration for the middle of the article content.
            </p>
          </div>

          {/* ── OPTION 1: PRIMARY HERO IMAGE ── */}
          <div className="p-6 rounded-3xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700 space-y-4">
            <div className="flex items-center gap-2 text-[#0F3B34] dark:text-zinc-100 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-[#157A6D] text-white text-xs flex items-center justify-center">1</span>
              <span>Option 1: Primary Hero Banner (Top of Article)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Category Badge (Pill text over hero image)
                  </label>
                  <input
                    type="text"
                    value={categoryBadge}
                    onChange={(e) => setCategoryBadge(e.target.value)}
                    placeholder="e.g. Oral Hygiene, Cardiology, Diabetes"
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-semibold text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Hero Image URL or Direct Link
                  </label>
                  <input
                    type="text"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleHeroUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingHero}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#157A6D]/10 hover:bg-[#157A6D]/20 text-[#157A6D] dark:text-emerald-400 text-xs font-bold transition cursor-pointer"
                  >
                    <UploadCloud size={16} />
                    <span>{uploadingHero ? "Uploading Hero..." : "Upload Hero Image"}</span>
                  </button>
                </div>
              </div>

              {/* Hero Preview Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Hero Image Preview
                </label>
                <div className="relative w-full aspect-[16/9] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                  {heroImage ? (
                    <>
                      <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                      {categoryBadge && (
                        <div className="absolute top-3 left-3 bg-[#0F3B34]/90 backdrop-blur-md text-[#F3EEE0] text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                          {categoryBadge}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setHeroImage("")}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No hero image uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── OPTION 2: SECONDARY / MID-CONTENT IMAGE ── */}
          <div className="p-6 rounded-3xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700 space-y-4">
            <div className="flex items-center gap-2 text-[#0F3B34] dark:text-zinc-100 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-[#0066FF] text-white text-xs flex items-center justify-center">2</span>
              <span>Option 2: Secondary Image (Middle of Article Content)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Secondary Image URL or Direct Link
                  </label>
                  <input
                    type="text"
                    value={secondaryImage}
                    onChange={(e) => setSecondaryImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Figure Caption / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={secondaryImageCaption}
                    onChange={(e) => setSecondaryImageCaption(e.target.value)}
                    placeholder="e.g. Figure 1: Clinical illustration of tongue papillae and pigmentation"
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs italic text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <input
                    type="file"
                    ref={secondaryFileInputRef}
                    onChange={handleSecondaryUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => secondaryFileInputRef.current?.click()}
                    disabled={uploadingSecondary}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0066FF]/10 hover:bg-[#0066FF]/20 text-[#0066FF] dark:text-blue-400 text-xs font-bold transition cursor-pointer"
                  >
                    <UploadCloud size={16} />
                    <span>{uploadingSecondary ? "Uploading Mid Image..." : "Upload Mid-Content Image"}</span>
                  </button>
                </div>
              </div>

              {/* Secondary Preview Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Mid-Content Image Preview
                </label>
                <div className="relative w-full aspect-[16/9] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                  {secondaryImage ? (
                    <>
                      <img src={secondaryImage} alt="Mid Article" className="w-full h-full object-cover" />
                      {secondaryImageCaption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[11px] p-2 text-center italic">
                          {secondaryImageCaption}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setSecondaryImage("")}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50 text-[#0066FF]" />
                      <p className="text-xs">No secondary image uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: AUTHOR & REVIEWER ── */}
      {activeTab === "authors" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
            Author and Reviewer Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Written By */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700 space-y-4">
              <h3 className="text-xs font-bold text-[#0F3B34] dark:text-zinc-200 uppercase tracking-wider">
                ✍️ Written By (Author)
              </h3>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Doctor / Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Dr. Meenakshi Maruwada"
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={authorTitle}
                  onChange={(e) => setAuthorTitle(e.target.value)}
                  placeholder="e.g. Dental Surgeon"
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Degrees & Credentials
                </label>
                <input
                  type="text"
                  value={authorCredentials}
                  onChange={(e) => setAuthorCredentials(e.target.value)}
                  placeholder="e.g. BDS, PGCAD, GMHE (IIM-B)"
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Reviewed By */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700 space-y-4">
              <h3 className="text-xs font-bold text-[#0F3B34] dark:text-zinc-200 uppercase tracking-wider">
                🩺 Reviewed By (Medical Expert)
              </h3>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Dr. Betina Chandolia"
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Qualifications & Certifications
                </label>
                <input
                  type="text"
                  value={reviewerQualifications}
                  onChange={(e) => setReviewerQualifications(e.target.value)}
                  placeholder="e.g. BDS, MDS, PGCCL, PGDMH"
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: TABLE OF CONTENTS BUILDER ── */}
      {activeTab === "toc" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100">
                Table of Contents (TOC)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                These titles appear in the sticky blue sidebar on desktop and navigate to the matching section.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncTocFromSections}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#0F3B34] hover:bg-[#157A6D] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RefreshCw size={14} />
              Auto Sync from Sections
            </button>
          </div>

          <div className="space-y-2.5">
            {tableOfContents.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700"
              >
                <span className="w-6 h-6 rounded-full bg-[#157A6D] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const updated = [...tableOfContents];
                    updated[idx].label = e.target.value;
                    setTableOfContents(updated);
                  }}
                  placeholder="TOC Item Title"
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium"
                />

                <input
                  type="text"
                  value={item.id}
                  onChange={(e) => {
                    const updated = [...tableOfContents];
                    updated[idx].id = e.target.value;
                    setTableOfContents(updated);
                  }}
                  placeholder="Anchor #id"
                  className="w-44 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-slate-600 dark:text-zinc-300"
                />

                <button
                  type="button"
                  onClick={() => setTableOfContents(tableOfContents.filter((_, i) => i !== idx))}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setTableOfContents([
                ...tableOfContents,
                { id: `section-${tableOfContents.length + 1}`, label: "New Section", level: 2, order: tableOfContents.length + 1 },
              ])
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-xs font-bold text-[#157A6D] hover:bg-[#157A6D]/10 transition"
          >
            <Plus size={15} />
            Add Table of Contents Item
          </button>
        </div>
      )}

      {/* ── TAB 5: CONTENT SECTIONS BUILDER ── */}
      {activeTab === "sections" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100">
                Article Sections & Content
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manage paragraphs, bullet points, comparison tables, or callouts for each section.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0F3B34] hover:bg-[#157A6D] text-white text-xs font-bold transition shadow cursor-pointer"
            >
              <Plus size={16} />
              Add New Section
            </button>
          </div>

          <div className="space-y-6">
            {sections.map((sec, sIdx) => {
              const currentPText = sectionTextMap[sIdx] !== undefined ? sectionTextMap[sIdx] : serializeMultiLineParagraphs(sec.paragraphs);
              const currentBText = sectionBulletsMap[sIdx] !== undefined ? sectionBulletsMap[sIdx] : serializeMultiLineBullets(sec.bullets);

              return (
                <div
                  key={sIdx}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 shadow-2xs space-y-5"
                >
                  {/* Section Top Bar */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-700 pb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-7 h-7 rounded-xl bg-[#157A6D] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[sIdx].heading = e.target.value;
                          updated[sIdx].id = slugify(e.target.value, { lower: true, strict: true });
                          setSections(updated);
                        }}
                        placeholder="Section Heading (H2)"
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-bold text-[#0F3B34] dark:text-zinc-100"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveSection(sIdx, "up")}
                        disabled={sIdx === 0}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSection(sIdx, "down")}
                        disabled={sIdx === sections.length - 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sIdx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Section Paragraphs Paste Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Paragraphs (Paste entire paragraphs here — separate with blank lines)
                    </label>
                    <textarea
                      rows={4}
                      value={currentPText}
                      onChange={(e) => handleSectionParagraphsTextChange(sIdx, e.target.value)}
                      placeholder="Paste introductory or explanatory paragraphs for this section..."
                      className="w-full p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs text-slate-800 dark:text-zinc-100 leading-relaxed focus:ring-2 focus:ring-[#157A6D]"
                    />
                  </div>

                  {/* Bullet Points Paste Textarea */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Bullet Points / List (Optional — Paste one bullet item per line)
                    </label>
                    <textarea
                      rows={3}
                      value={currentBText}
                      onChange={(e) => handleSectionBulletsTextChange(sIdx, e.target.value)}
                      placeholder="• Point 1&#10;• Point 2&#10;• Point 3"
                      className="w-full p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs text-slate-800 dark:text-zinc-100 leading-relaxed focus:ring-2 focus:ring-[#157A6D]"
                    />
                  </div>

                  {/* Callout Notice */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Callout Box (Optional warning/tip highlight)
                    </label>
                    <input
                      type="text"
                      value={sec.callout || ""}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[sIdx].callout = e.target.value;
                        setSections(updated);
                      }}
                      placeholder="e.g. This is not medical advice. Seek professional guidance."
                      className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs italic text-slate-800 dark:text-zinc-100"
                    />
                  </div>

                  {/* Structured Comparison Table */}
                  <div className="pt-2">
                    {sec.table ? (
                      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F3B34] dark:text-zinc-200 flex items-center gap-1.5">
                            <TableIcon size={15} /> Comparison Table
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTableFromSection(sIdx)}
                            className="text-xs text-rose-500 hover:underline"
                          >
                            Remove Table
                          </button>
                        </div>

                        {/* Headers */}
                        <div className="grid grid-cols-3 gap-2">
                          {sec.table.headers.map((hdr, hIdx) => (
                            <input
                              key={hIdx}
                              type="text"
                              value={hdr}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[sIdx].table.headers[hIdx] = e.target.value;
                                setSections(updated);
                              }}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs font-bold"
                            />
                          ))}
                        </div>

                        {/* Rows */}
                        <div className="space-y-2">
                          {sec.table.rows.map((row, rIdx) => (
                            <div key={rIdx} className="grid grid-cols-3 gap-2">
                              {row.map((cell, cIdx) => (
                                <input
                                  key={cIdx}
                                  type="text"
                                  value={cell}
                                  onChange={(e) => {
                                    const updated = [...sections];
                                    updated[sIdx].table.rows[rIdx][cIdx] = e.target.value;
                                    setSections(updated);
                                  }}
                                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs"
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...sections];
                            updated[sIdx].table.rows.push(["", "", ""]);
                            setSections(updated);
                          }}
                          className="text-xs font-bold text-[#157A6D] hover:underline inline-flex items-center gap-1 pt-1"
                        >
                          <Plus size={14} /> Add Table Row
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddTableToSection(sIdx)}
                        className="text-xs font-bold text-[#157A6D] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <TableIcon size={14} /> + Add Comparison Table to this Section
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F3B34] hover:bg-[#157A6D] text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              Add Another Section
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 6: FAQS ACCORDION ── */}
      {activeTab === "faqs" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100">
                Frequently Asked Questions (FAQs)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Paste Q&A pairs directly into the box below or edit them individually.
              </p>
            </div>
          </div>

          {/* Rapid Copy-Paste Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              Paste FAQs Raw Text (Format: Q: Question \n A: Answer)
            </label>
            <textarea
              rows={6}
              value={faqsRawText}
              onChange={(e) => handleFaqsRawChange(e.target.value)}
              placeholder={`Q: Are black spots on tongue dangerous?\nA: In most cases they are harmless and temporary.\n\nQ: When should I see a doctor?\nA: If the spot lasts more than 2 weeks.`}
              className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
            />
          </div>

          {/* Parsed FAQ Cards */}
          <div className="space-y-3 pt-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].question = e.target.value;
                      setFaqs(updated);
                      setFaqsRawText(serializeFaqsText(updated));
                    }}
                    placeholder="Question"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-[#0F3B34] dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = faqs.filter((_, i) => i !== idx);
                      setFaqs(updated);
                      setFaqsRawText(serializeFaqsText(updated));
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[idx].answer = e.target.value;
                    setFaqs(updated);
                    setFaqsRawText(serializeFaqsText(updated));
                  }}
                  placeholder="Answer"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-700 dark:text-zinc-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 7: REFERENCES ── */}
      {activeTab === "references" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100">
              Study Citations & References
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Paste references (one per line, with or without external URLs) for fast batch import.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
              Paste References (One per line: "Title - https://url...")
            </label>
            <textarea
              rows={6}
              value={referencesRawText}
              onChange={(e) => handleReferencesRawChange(e.target.value)}
              placeholder={`1. National Center for Biotechnology Information. Black hairy tongue. - https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4138463/\n2. American Journal of Clinical Dermatology. Oral Pigmentation. - https://pubmed.ncbi.nlm.nih.gov/20027942/`}
              className="w-full p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-slate-800 dark:text-zinc-100 focus:ring-2 focus:ring-[#157A6D]"
            />
          </div>

          <div className="space-y-2 pt-2">
            {references.map((ref, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700"
              >
                <span className="text-xs font-bold text-slate-400">{idx + 1}.</span>
                <input
                  type="text"
                  value={ref.title}
                  onChange={(e) => {
                    const updated = [...references];
                    updated[idx].title = e.target.value;
                    setReferences(updated);
                    setReferencesRawText(serializeReferencesText(updated));
                  }}
                  placeholder="Citation Title / Journal"
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium"
                />
                <input
                  type="text"
                  value={ref.url || ""}
                  onChange={(e) => {
                    const updated = [...references];
                    updated[idx].url = e.target.value;
                    setReferences(updated);
                    setReferencesRawText(serializeReferencesText(updated));
                  }}
                  placeholder="https://..."
                  className="w-56 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-blue-600 dark:text-blue-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = references.filter((_, i) => i !== idx);
                    setReferences(updated);
                    setReferencesRawText(serializeReferencesText(updated));
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 8: SEO & SOCIAL ── */}
      {activeTab === "seo" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-[#0F3B34] dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-3">
            SEO & Search Optimization
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Meta Title
              </label>
              <input
                type="text"
                value={seo.metaTitle}
                onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                placeholder={title || "Article Meta Title"}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={seo.metaDescription}
                onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                placeholder={excerpt || "Search preview description..."}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Medical Disclaimer Text
              </label>
              <textarea
                rows={3}
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-zinc-100 italic"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddNewArticle;
