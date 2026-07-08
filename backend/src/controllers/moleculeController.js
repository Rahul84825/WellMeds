import { Molecule } from "../models/Molecule.js";
import { Product } from "../models/Product.js";
import slugify from "slugify";

export const getMolecules = async (req, res, next) => {
  try {
    const { search, letter } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { aliases: { $regex: search, $options: "i" } },
        { "seo.focusKeyword": { $regex: search, $options: "i" } },
        { "seo.seoKeywords": { $regex: search, $options: "i" } },
        { "seo.searchTags": { $regex: search, $options: "i" } }
      ];
    }

    if (letter) {
      query.letter = letter.toUpperCase();
    }

    const molecules = await Molecule.find(query)
      .populate("relatedMolecules", "name slug")
      .sort({ name: 1 });

    const moleculesWithCount = await Promise.all(
      molecules.map(async (m) => {
        const count = await Product.countDocuments({ molecules: m._id });
        return {
          ...m.toJSON(),
          productCount: count
        };
      })
    );

    res.status(200).json({ success: true, count: moleculesWithCount.length, molecules: moleculesWithCount });
  } catch (err) {
    next(err);
  }
};

export const getMoleculeBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const molecule = await Molecule.findOne({ slug, isActive: true })
      .populate("relatedMolecules", "name slug isActive");

    if (!molecule) {
      return res.status(404).json({ success: false, message: "Molecule not found" });
    }

    res.status(200).json({ success: true, molecule });
  } catch (err) {
    next(err);
  }
};

export const adminGetMolecules = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { aliases: { $regex: search, $options: "i" } },
        { "seo.focusKeyword": { $regex: search, $options: "i" } },
        { "seo.seoKeywords": { $regex: search, $options: "i" } },
        { "seo.searchTags": { $regex: search, $options: "i" } }
      ];
    }

    const skipNum = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const total = await Molecule.countDocuments(query);
    const molecules = await Molecule.find(query)
      .populate("relatedMolecules", "name slug")
      .sort({ name: 1 })
      .skip(skipNum)
      .limit(limitNum);

    const moleculesWithCount = await Promise.all(
      molecules.map(async (m) => {
        const count = await Product.countDocuments({ molecules: m._id });
        return {
          ...m.toJSON(),
          productCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum),
      molecules: moleculesWithCount
    });
  } catch (err) {
    next(err);
  }
};

export const createMolecule = async (req, res, next) => {
  try {
    const { isFeatured, ...moleculeData } = req.body;
    if (!moleculeData.slug && moleculeData.name) {
      moleculeData.slug = slugify(moleculeData.name, { lower: true });
    }
    if (moleculeData.name && !moleculeData.letter) {
      moleculeData.letter = moleculeData.name.charAt(0).toUpperCase();
    }
    const molecule = await Molecule.create(moleculeData);
    res.status(201).json({ success: true, molecule });
  } catch (err) {
    next(err);
  }
};

export const updateMolecule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isFeatured, ...moleculeData } = req.body;
    if (moleculeData.name) {
      moleculeData.slug = slugify(moleculeData.name, { lower: true });
      moleculeData.letter = moleculeData.name.charAt(0).toUpperCase();
    }
    const molecule = await Molecule.findByIdAndUpdate(id, moleculeData, {
      new: true,
      runValidators: true
    });
    if (!molecule) {
      return res.status(404).json({ success: false, message: "Molecule not found" });
    }
    res.status(200).json({ success: true, molecule });
  } catch (err) {
    next(err);
  }
};

export const deleteMolecule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const molecule = await Molecule.findByIdAndDelete(id);
    if (!molecule) {
      return res.status(404).json({ success: false, message: "Molecule not found" });
    }
    // Also remove from any product referencing this molecule
    await Product.updateMany(
      { molecules: id },
      { $pull: { molecules: id } }
    );
    res.status(200).json({ success: true, message: "Molecule deleted successfully" });
  } catch (err) {
    next(err);
  }
};
