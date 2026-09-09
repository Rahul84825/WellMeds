import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure local uploads directory exists
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Blocklist of dangerous extensions that must never be uploaded under any circumstances
const DANGEROUS_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".php", ".phtml", ".php3", ".php4", ".php5",
  ".phps", ".cgi", ".pl", ".py", ".rb", ".asp", ".aspx", ".jsp", ".jspx", ".cfm",
  ".js", ".jsx", ".ts", ".tsx", ".vbs", ".wsf", ".hta", ".scr", ".com", ".pif",
  ".svg", ".html", ".htm", ".xhtml", ".xml", ".shtml", ".dll", ".so", ".dylib"
];

// Helper to detect double extensions containing executable or script extensions
const hasDangerousSubExtension = (filename) => {
  const clean = filename.toLowerCase().replace(/\\/g, "/");
  const base = path.basename(clean);
  const parts = base.split(".");
  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      if (DANGEROUS_EXTENSIONS.includes("." + parts[i])) {
        return true;
      }
    }
  }
  return false;
};

// Config disk storage with rigorous filename sanitization & path traversal prevention
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Strip null bytes and normalize slashes for path traversal prevention
    const normalizedName = file.originalname.replace(/\0/g, "").replace(/\\/g, "/");
    const cleanOriginal = path.basename(normalizedName);
    const rawExt = path.extname(cleanOriginal).toLowerCase();
    
    // Check against dangerous extensions and dangerous double extensions
    if (DANGEROUS_EXTENSIONS.includes(rawExt) || hasDangerousSubExtension(cleanOriginal)) {
      return cb(new Error("Executable or script file extensions are strictly prohibited!"), "");
    }

    // Sanitize extension: only permit lowercase alphanumeric characters and periods
    const sanitizedExt = rawExt.replace(/[^a-zA-Z0-9.]/g, "");
    // Sanitize fieldname: only permit alphanumeric characters
    const sanitizedField = file.fieldname.replace(/[^a-zA-Z0-9]/g, "");
    cb(null, sanitizedField + "-" + uniqueSuffix + sanitizedExt);
  },
});

// Image file filter (strictly JPEG, PNG, WEBP)
const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/pjpeg"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  
  const normalizedName = file.originalname.replace(/\0/g, "").replace(/\\/g, "/");
  const cleanOriginal = path.basename(normalizedName);
  const ext = path.extname(cleanOriginal).toLowerCase();

  if (hasDangerousSubExtension(cleanOriginal)) {
    return cb(new Error("Double file extensions with executable or script names are not allowed!"), false);
  }

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, and WEBP image formats are allowed!"), false);
  }
};

// Prescription file filter (PDF, JPEG, PNG, WEBP)
const prescriptionFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/jpg", "image/pjpeg"];
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

  const normalizedName = file.originalname.replace(/\0/g, "").replace(/\\/g, "/");
  const cleanOriginal = path.basename(normalizedName);
  const ext = path.extname(cleanOriginal).toLowerCase();

  if (hasDangerousSubExtension(cleanOriginal)) {
    return cb(new Error("Double file extensions with executable or script names are not allowed!"), false);
  }

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, JPG, PNG, and WEBP documents are allowed for prescriptions!"), false);
  }
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB Limit

// Multer instances
export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB Limit for images
    files: 5,
  },
});

export const uploadPrescriptionFile = multer({
  storage: storage,
  fileFilter: prescriptionFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB Limit for prescriptions
    files: 10,
  },
});

// Default fallback export to prevent breaking changes
export const upload = uploadImage;

