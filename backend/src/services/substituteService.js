import { Product } from "../models/Product.js";
import { Molecule } from "../models/Molecule.js";

/**
 * Normalizes strength strings for exact clinical comparison.
 * Examples:
 *   " 160 mg " -> "160mg"
 *   "0.5 mg"   -> "0.5mg"
 *   "10 mg/5 ml" -> "10mg/5ml"
 *   "100 IU/ml" -> "100iu/ml"
 */
export const normalizeStrength = (rawStr) => {
  if (!rawStr || typeof rawStr !== "string") return "";
  let str = rawStr.trim().toLowerCase();
  
  // Extract strength pattern if full text contains surrounding words (e.g. "Bdenza 160mg Tablet")
  const match = str.match(/(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|iu|%|w\/v|w\/w|v\/v)(?:\s*\/\s*\d*(?:\.\d+)?\s*(?:mg|g|mcg|ml|iu|%|w\/v|w\/w|v\/v))?)/i);
  if (match) {
    str = match[1];
  }
  
  // Remove whitespace between numbers and units (e.g., "160 mg" -> "160mg")
  return str.replace(/\s+/g, "");
};

/**
 * Normalizes dosage form into canonical clinical categories.
 * Ensures Tablet != Capsule != Injection != Syrup != Drops etc.
 */
export const normalizeDosageForm = (rawForm, productName = "") => {
  const text = `${rawForm || ""} ${productName || ""}`.toLowerCase();
  
  if (/\btablet(s)?\b|\bcaplet(s)?\b/i.test(text)) {
    return "tablet";
  }
  if (/\bcapsule(s)?\b|\bsoftgel(s)?\b|\bcap\b/i.test(text)) {
    return "capsule";
  }
  if (/\binjection(s)?\b|\bvial(s)?\b|\bampoule(s)?\b|\binfusion(s)?\b|\bprefilled syringe\b/i.test(text)) {
    return "injection";
  }
  if (/\bsyrup(s)?\b|\bsuspension(s)?\b|\belixir(s)?\b|\boral liquid(s)?\b|\boral solution(s)?\b/i.test(text)) {
    return "syrup";
  }
  if (/\bointment(s)?\b|\bcream(s)?\b|\bgel(s)?\b|\blotion(s)?\b/i.test(text)) {
    return "topical";
  }
  if (/\bdrops\b|\beye drop(s)?\b|\bear drop(s)?\b|\bnasal drop(s)?\b/i.test(text)) {
    return "drops";
  }
  if (/\binhaler(s)?\b|\brespule(s)?\b|\brotacap(s)?\b/i.test(text)) {
    return "inhaler";
  }
  if (/\bpowder(s)?\b|\bsachet(s)?\b/i.test(text)) {
    return "powder";
  }
  
  return (rawForm || "").trim().toLowerCase();
};

/**
 * Normalizes pack unit type factor (tablet vs capsule vs bottle vs vial vs kit).
 */
export const normalizeUnitType = (packSizeStr = "", dosageFormStr = "", productName = "") => {
  const combined = `${packSizeStr} ${dosageFormStr} ${productName}`.toLowerCase();
  if (/\btablet\b/i.test(combined)) return "tablet";
  if (/\bcapsule\b/i.test(combined)) return "capsule";
  if (/\bvial\b|\bampoule\b|\binjection\b/i.test(combined)) return "vial/ampoule";
  if (/\bbottle\b/i.test(combined)) return "bottle";
  if (/\bkit\b/i.test(combined)) return "kit";
  if (/\btube\b/i.test(combined)) return "tube";
  if (/\bsachet\b/i.test(combined)) return "sachet";
  return "unit";
};

/**
 * Extract active molecules from product (Molecule IDs, composition ingredients, or genericName).
 */
export const extractMolecules = (product) => {
  const moleculeIds = [];
  
  if (Array.isArray(product.molecules) && product.molecules.length > 0) {
    product.molecules.forEach(m => {
      if (m && m._id) moleculeIds.push(m._id.toString());
      else if (m) moleculeIds.push(m.toString());
    });
  }
  
  const compositionIngredients = [];
  if (Array.isArray(product.composition) && product.composition.length > 0) {
    product.composition.forEach(c => {
      if (c && c.ingredient) compositionIngredients.push(c.ingredient.trim().toLowerCase());
    });
  }
  
  const genericName = (product.productSpecifications?.genericName || "").trim().toLowerCase();
  if (genericName && compositionIngredients.length === 0) {
    compositionIngredients.push(genericName);
  }
  
  return { moleculeIds, compositionIngredients };
};

/**
 * Extract normalized strength from product.
 */
export const extractStrength = (product) => {
  const rawStrength = product.strength || product.productSpecifications?.strength || "";
  const normalized = normalizeStrength(rawStrength);
  if (normalized) return normalized;
  
  // Fallback: extract from product name
  return normalizeStrength(product.name || "");
};

/**
 * Extract normalized dosage form from product.
 */
export const extractDosageForm = (product) => {
  const rawForm = product.productSpecifications?.dosageForm || "";
  return normalizeDosageForm(rawForm, product.name || "");
};

/**
 * Extract normalized unit type from product.
 */
export const extractUnitType = (product) => {
  const packSize = product.packSize || product.productSpecifications?.packSize || "";
  const dosageForm = product.productSpecifications?.dosageForm || "";
  return normalizeUnitType(packSize, dosageForm, product.name || "");
};

/**
 * Validates that product contains all required clinical fields for substitute matching.
 * Excludes incomplete or unverified products from substitute engine.
 */
export const isValidSubstituteCandidate = (product) => {
  if (!product) return false;
  
  const { moleculeIds, compositionIngredients } = extractMolecules(product);
  const strength = extractStrength(product);
  const dosageForm = extractDosageForm(product);
  
  const hasMolecule = moleculeIds.length > 0 || compositionIngredients.length > 0;
  const hasStrength = !!strength;
  const hasDosageForm = !!dosageForm;
  
  return hasMolecule && hasStrength && hasDosageForm;
};

/**
 * Core Clinical Substitute Engine.
 * Fetches 100% equivalent medicines for a given product ID or slug.
 */
export const getClinicalSubstitutesForProduct = async (productIdOrSlug) => {
  let targetProduct;
  const isObjId = (await import("mongoose")).default.Types.ObjectId.isValid(productIdOrSlug);
  
  if (isObjId) {
    targetProduct = await Product.findById(productIdOrSlug).populate("molecules", "name slug");
  } else {
    targetProduct = await Product.findOne({ slug: productIdOrSlug }).populate("molecules", "name slug");
  }
  
  if (!targetProduct) {
    return { success: false, message: "Product not found", targetProduct: null, substitutes: [] };
  }

  // Data Validation: If target product itself lacks required clinical fields, return no substitutes.
  if (!isValidSubstituteCandidate(targetProduct)) {
    return { success: true, targetProduct, substitutes: [] };
  }

  const targetMolecules = extractMolecules(targetProduct);
  const targetStrength = extractStrength(targetProduct);
  const targetDosageForm = extractDosageForm(targetProduct);
  const targetUnitType = extractUnitType(targetProduct);

  // Build MongoDB query
  const queryConditions = [
    { _id: { $ne: targetProduct._id } }
  ];

  if (targetMolecules.moleculeIds.length > 0) {
    queryConditions.push({ molecules: { $in: targetMolecules.moleculeIds } });
  } else if (targetMolecules.compositionIngredients.length > 0) {
    queryConditions.push({
      $or: [
        { "composition.ingredient": { $in: targetMolecules.compositionIngredients.map(i => new RegExp(`^${i}$`, "i")) } },
        { "productSpecifications.genericName": { $in: targetMolecules.compositionIngredients.map(i => new RegExp(`^${i}$`, "i")) } }
      ]
    });
  }

  // Fetch candidates from DB
  const candidates = await Product.find({ $and: queryConditions })
    .select("name brand manufacturer price originalPrice stock inStock image images slug packSize composition productSpecifications molecules requiresRx isPrescriptionRequired isColdChain badge similarMedicinePriority")
    .populate("molecules", "name slug")
    .sort({ price: 1 });

  // Apply strict in-memory clinical verification
  const validSubstitutes = candidates.filter(cand => {
    if (!isValidSubstituteCandidate(cand)) return false;
    
    // Rule 1: Same Active Molecule(s)
    const candMolecules = extractMolecules(cand);
    let moleculeMatches = false;
    if (targetMolecules.moleculeIds.length > 0 && candMolecules.moleculeIds.length > 0) {
      moleculeMatches = targetMolecules.moleculeIds.some(id => candMolecules.moleculeIds.includes(id));
    } else {
      moleculeMatches = targetMolecules.compositionIngredients.some(ing =>
        candMolecules.compositionIngredients.includes(ing)
      );
    }
    if (!moleculeMatches) return false;

    // Rule 2: Same Strength (Exact normalized match)
    const candStrength = extractStrength(cand);
    if (candStrength !== targetStrength) return false;

    // Rule 3: Same Dosage Form (Exact normalized match)
    const candDosageForm = extractDosageForm(cand);
    if (candDosageForm !== targetDosageForm) return false;

    // Rule 4: Same Unit Type (Exact normalized match)
    const candUnitType = extractUnitType(cand);
    if (candUnitType !== targetUnitType) return false;

    return true;
  });

  // Sort substitutes: In-Stock first, then ascending price
  validSubstitutes.sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    return a.price - b.price;
  });

  return {
    success: true,
    targetProduct,
    substitutes: validSubstitutes
  };
};
