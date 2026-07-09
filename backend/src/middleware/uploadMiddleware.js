import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure local uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Config disk storage with filename sanitization
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize extension: only permit lowercase alphanumeric characters and periods
    const sanitizedExt = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, "").toLowerCase();
    // Sanitize fieldname: only permit alphanumeric characters
    const sanitizedField = file.fieldname.replace(/[^a-zA-Z0-9]/g, "");
    cb(null, sanitizedField + "-" + uniqueSuffix + sanitizedExt);
  },
});

// Image file filter (strictly JPEG, PNG, WEBP)
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/pjpeg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, and WEBP image formats are allowed!"), false);
  }
};

// Prescription file filter (PDF, JPEG, PNG, WEBP)
const prescriptionFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, JPG, PNG, and WEBP documents are allowed for prescriptions!"), false);
  }
};

// Multer instances
export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit for images
  },
});

export const uploadPrescriptionFile = multer({
  storage: storage,
  fileFilter: prescriptionFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB Limit for prescriptions
  },
});

// Default fallback export to prevent breaking changes
export const upload = uploadImage;
