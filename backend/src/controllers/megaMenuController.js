import { MegaMenuItem } from "../models/MegaMenuItem.js";

// Helper to seed default items if database is empty
const seedDefaultItems = async () => {
  const defaults = [
    // 1. By Condition
    { type: "condition", name: "Oncology / Cancer Care", linkedCategory: "Cancer Care", slug: "cancer-care", sortOrder: 0, visible: true },
    { type: "condition", name: "HIV / AIDS Care", linkedCategory: "HIV / AIDS Care", slug: "hiv-aids-care", sortOrder: 1, visible: true },
    { type: "condition", name: "Hepatitis Care", linkedCategory: "Hepatitis Care", slug: "hepatitis-care", sortOrder: 2, visible: true },
    { type: "condition", name: "Cardiac Care", linkedCategory: "Cardiac Care", slug: "cardiac-care", sortOrder: 3, visible: true },
    { type: "condition", name: "Diabetes Care", linkedCategory: "Diabetes Care", slug: "diabetes-care", sortOrder: 4, visible: true },
    { type: "condition", name: "Kidney / Transplant Care", linkedCategory: "Kidney / Transplant Care", slug: "kidney-transplant-care", sortOrder: 5, visible: true },
    { type: "condition", name: "Respiratory Care", linkedCategory: "Respiratory Care", slug: "respiratory-care", sortOrder: 6, visible: true },
    { type: "condition", name: "Neuro & Mental Health", linkedCategory: "Neuro & Mental Health", slug: "neuro-mental-health", sortOrder: 7, visible: true },
    { type: "condition", name: "Rare & Orphan Diseases", linkedCategory: "Rare & Orphan Diseases", slug: "rare-orphan-diseases", sortOrder: 8, visible: true },
    { type: "condition", name: "Pain Management / Palliative Care", linkedCategory: "Palliative Care", slug: "palliative-care", sortOrder: 9, visible: true },

    // 2. Super Speciality
    { type: "speciality", name: "GLP-1 Injections", linkedSpeciality: "glp-1", slug: "glp-1", sortOrder: 0, visible: true },
    { type: "speciality", name: "Biologics", linkedSpeciality: "biologics", slug: "biologics", sortOrder: 1, visible: true },
    { type: "speciality", name: "Immunosuppressants", linkedSpeciality: "immunosuppressants", slug: "immonosuppressants", sortOrder: 2, visible: true },
    { type: "speciality", name: "Chemotherapy Support", linkedSpeciality: "chemotherapy-support", slug: "chemotherapy-support", sortOrder: 3, visible: true },
    { type: "speciality", name: "Specialty Injectables", linkedSpeciality: "specialty-injectables", slug: "specialty-injectables", sortOrder: 4, visible: true },

    // 3. Source
    { type: "source", name: "Imported Medicines", queryParam: "isImported=true", slug: "imported", icon: "Globe", sortOrder: 0, visible: true },
    { type: "source", name: "Indian Generics", queryParam: "isImported=false", slug: "generics", icon: "Activity", sortOrder: 1, visible: true },

    // 4. Quick Links
    { type: "quick-link", name: "PAP Auto Refill", route: "/patient-assistance-program", isExternal: false, icon: "Handshake", sortOrder: 0, visible: true },
    { type: "quick-link", name: "Upload Prescription", route: "/upload-prescription", isExternal: false, icon: "FileText", sortOrder: 1, visible: true },
    { type: "quick-link", name: "Today's Offers", route: "/offers", isExternal: false, icon: "Percent", sortOrder: 2, visible: true },
    { type: "quick-link", name: "Talk to Pharmacist", route: "tel:+917420909445", isExternal: true, icon: "PhoneCall", isHelpCard: true, helpSubtext: "Free support from licensed pharmacists.", sortOrder: 3, visible: true }
  ];

  await MegaMenuItem.insertMany(defaults);
};

// @desc    Get all mega menu items grouped by type (storefront - visible only)
// @route   GET /api/megamenu
// @access  Public
export const getMegaMenu = async (req, res) => {
  try {
    const count = await MegaMenuItem.countDocuments();
    if (count === 0) {
      await seedDefaultItems();
    }

    const items = await MegaMenuItem.find({ visible: true }).sort({ sortOrder: 1 });

    const grouped = {
      conditions: items.filter(item => item.type === "condition"),
      specialities: items.filter(item => item.type === "speciality"),
      sources: items.filter(item => item.type === "source"),
      quickLinks: items.filter(item => item.type === "quick-link")
    };

    res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all mega menu items grouped by type (admin panel - visible and invisible)
// @route   GET /api/megamenu/admin
// @access  Private/Admin
export const getAdminMegaMenu = async (req, res) => {
  try {
    const count = await MegaMenuItem.countDocuments();
    if (count === 0) {
      await seedDefaultItems();
    }

    const items = await MegaMenuItem.find().sort({ sortOrder: 1 });

    const grouped = {
      conditions: items.filter(item => item.type === "condition"),
      specialities: items.filter(item => item.type === "speciality"),
      sources: items.filter(item => item.type === "source"),
      quickLinks: items.filter(item => item.type === "quick-link")
    };

    res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a mega menu item
// @route   POST /api/megamenu/admin
// @access  Private/Admin
export const createMegaMenuItem = async (req, res) => {
  try {
    const {
      type,
      name,
      slug,
      icon,
      visible,
      linkedCategory,
      linkedSpeciality,
      queryParam,
      route,
      isExternal,
      openInNewTab,
      isHelpCard,
      helpSubtext
    } = req.body;

    if (!type || !name) {
      return res.status(400).json({ success: false, message: "Type and name are required" });
    }

    // Auto-calculate sortOrder: place at end of its type list
    const maxItem = await MegaMenuItem.findOne({ type }).sort({ sortOrder: -1 });
    const sortOrder = maxItem ? maxItem.sortOrder + 1 : 0;

    const newItem = await MegaMenuItem.create({
      type,
      name,
      slug,
      icon,
      sortOrder,
      visible: visible !== undefined ? visible : true,
      linkedCategory,
      linkedSpeciality,
      queryParam,
      route,
      isExternal,
      openInNewTab,
      isHelpCard,
      helpSubtext
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a mega menu item
// @route   PUT /api/megamenu/admin/:id
// @access  Private/Admin
export const updateMegaMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedItem = await MegaMenuItem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a mega menu item
// @route   DELETE /api/megamenu/admin/:id
// @access  Private/Admin
export const deleteMegaMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await MegaMenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    res.status(200).json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reorder mega menu items
// @route   PUT /api/megamenu/admin/reorder
// @access  Private/Admin
export const reorderMegaMenuItems = async (req, res) => {
  try {
    const { ids } = req.body; // array of item IDs in order

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: "List of IDs is required" });
    }

    for (let i = 0; i < ids.length; i++) {
      await MegaMenuItem.findByIdAndUpdate(ids[i], { sortOrder: i });
    }

    res.status(200).json({ success: true, message: "Items reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
