/**
 * Security Middleware
 * Filters and sanitizes request parameters to prevent Mongo Injection and XSS attacks.
 */

// Recursively checks if any key in an object starts with '$' (MongoDB operator)
const hasMongoOperators = (obj) => {
  if (!obj || typeof obj !== "object") return false;
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (hasMongoOperators(item)) return true;
    }
  } else {
    for (const key in obj) {
      if (key.startsWith("$")) {
        return true;
      }
      if (typeof obj[key] === "object" && hasMongoOperators(obj[key])) {
        return true;
      }
    }
  }
  return false;
};

// Strips out script, iframe, svg tags, javascript: links, and onerror/onload event handlers
const sanitizeXSSString = (str) => {
  if (typeof str !== "string") return str;
  
  let sanitized = str;
  
  // 1. Remove script tags
  sanitized = sanitized.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  
  // 2. Remove iframe tags
  sanitized = sanitized.replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "");
  
  // 3. Remove svg tags
  sanitized = sanitized.replace(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, "");
  
  // 4. Remove onEvent attributes (e.g. onload, onerror, onclick, onmouseover)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, "");
  
  // 5. Remove javascript: pseudo-protocol
  sanitized = sanitized.replace(/javascript:/gi, "");
  
  return sanitized;
};

// Recursively sanitizes XSS vectors from all string values in an object/array
const sanitizeXSS = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "string") {
        obj[i] = sanitizeXSSString(obj[i]);
      } else if (typeof obj[i] === "object") {
        sanitizeXSS(obj[i]);
      }
    }
  } else {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeXSSString(obj[key]);
      } else if (typeof obj[key] === "object") {
        sanitizeXSS(obj[key]);
      }
    }
  }
  return obj;
};

// Middleware: Reject requests containing MongoDB query operators in req.body, req.query, or req.params
export const preventMongoInjection = (req, res, next) => {
  if (hasMongoOperators(req.body) || hasMongoOperators(req.query) || hasMongoOperators(req.params)) {
    return res.status(400).json({ 
      success: false, 
      message: "Malicious payload detected: MongoDB operators (keys starting with '$') are not allowed." 
    });
  }
  next();
};

// Middleware: Strip HTML/JS XSS injection vectors from req.body, req.query, and req.params
export const preventXSS = (req, res, next) => {
  if (req.body) sanitizeXSS(req.body);
  if (req.query) sanitizeXSS(req.query);
  if (req.params) sanitizeXSS(req.params);
  next();
};
