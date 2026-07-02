import { MedicalSpeciality } from "../models/MedicalSpeciality.js";
import { Product } from "../models/Product.js";
import slugify from "slugify";

// @desc    Get all active specialities (Public)
// @route   GET /api/specialities
export const getSpecialities = async (req, res, next) => {
  try {
    const specialities = await MedicalSpeciality.find({ active: true }).sort({ displayOrder: 1, name: 1 });
    
    // Dynamically add product count for each speciality
    const specialitiesWithCount = await Promise.all(
      specialities.map(async (spec) => {
        const count = await Product.countDocuments({ specialities: spec._id });
        return {
          ...spec.toObject(),
          productCount: count,
        };
      })
    );

    res.status(200).json({ success: true, specialities: specialitiesWithCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single speciality by slug (Public)
// @route   GET /api/specialities/:slug
export const getSpecialityBySlug = async (req, res, next) => {
  const { slug } = req.params;
  try {
    const speciality = await MedicalSpeciality.findOne({ slug, active: true });
    if (!speciality) {
      return res.status(404).json({ success: false, message: "Speciality not found" });
    }
    res.status(200).json({ success: true, speciality });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all specialities for admin dashboard (Admin Only)
// @route   GET /api/specialities/admin/all
export const adminGetSpecialities = async (req, res, next) => {
  const { search, page, limit } = req.query;
  try {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skipNum = (pageNum - 1) * limitNum;

    const [totalCount, specialities] = await Promise.all([
      MedicalSpeciality.countDocuments(query),
      MedicalSpeciality.find(query)
        .sort({ displayOrder: 1, name: 1 })
        .skip(skipNum)
        .limit(limitNum)
    ]);

    const specsWithCount = await Promise.all(
      specialities.map(async (spec) => {
        const count = await Product.countDocuments({ specialities: spec._id });
        return {
          ...spec.toObject(),
          productCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      specialities: specsWithCount,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new speciality (Admin Only)
// @route   POST /api/specialities
export const createSpeciality = async (req, res, next) => {
  const specialityData = req.body;
  try {
    if (!specialityData.name) {
      return res.status(400).json({ success: false, message: "Speciality name is required" });
    }

    // Auto-generate slug if not provided, else slugify manual value
    const slugVal = specialityData.slug 
      ? slugify(specialityData.slug, { lower: true })
      : slugify(specialityData.name, { lower: true });

    const specialityExists = await MedicalSpeciality.findOne({ slug: slugVal });
    if (specialityExists) {
      return res.status(400).json({ success: false, message: "Speciality with this slug or name already exists" });
    }

    const speciality = await MedicalSpeciality.create({
      ...specialityData,
      slug: slugVal
    });

    res.status(201).json({ success: true, speciality });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a speciality (Admin Only)
// @route   PUT /api/specialities/:id
export const updateSpeciality = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const speciality = await MedicalSpeciality.findById(id);
    if (!speciality) {
      return res.status(404).json({ success: false, message: "Speciality not found" });
    }

    if (updateData.name) {
      speciality.name = updateData.name;
      // Auto update slug if it was not manually modified
      if (!updateData.slug) {
        speciality.slug = slugify(updateData.name, { lower: true });
      }
    }

    if (updateData.slug) {
      speciality.slug = slugify(updateData.slug, { lower: true });
    }

    if (updateData.bannerImage !== undefined) speciality.bannerImage = updateData.bannerImage;
    if (updateData.iconImage !== undefined) speciality.iconImage = updateData.iconImage;
    if (updateData.shortDescription !== undefined) speciality.shortDescription = updateData.shortDescription;
    if (updateData.seoTitle !== undefined) speciality.seoTitle = updateData.seoTitle;
    if (updateData.seoDescription !== undefined) speciality.seoDescription = updateData.seoDescription;
    if (updateData.seoKeywords !== undefined) speciality.seoKeywords = updateData.seoKeywords;
    if (updateData.displayOrder !== undefined) speciality.displayOrder = parseInt(updateData.displayOrder) || 0;
    if (updateData.active !== undefined) speciality.active = !!updateData.active;
    if (updateData.richContentSections !== undefined) speciality.richContentSections = updateData.richContentSections;

    await speciality.save();
    res.status(200).json({ success: true, speciality });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a speciality (Admin Only)
// @route   DELETE /api/specialities/:id
export const deleteSpeciality = async (req, res, next) => {
  const { id } = req.params;
  try {
    const speciality = await MedicalSpeciality.findById(id);
    if (!speciality) {
      return res.status(404).json({ success: false, message: "Speciality not found" });
    }

    // Pull this speciality reference from any tagged products
    await Product.updateMany(
      { specialities: id },
      { $pull: { specialities: id } }
    );

    await speciality.deleteOne();
    res.status(200).json({ success: true, message: "Speciality deleted successfully" });
  } catch (error) {
    next(error);
  }
};
