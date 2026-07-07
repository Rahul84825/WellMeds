export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose Bad ObjectId Error
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found (invalid ID format)";
  }

  // Mongoose Duplicate Key Error (E11000)
  // Log full Mongo error for debugging; return a neutral message to the client.
  else if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || err.keyValue || {}).join(", ") || "unknown field";
    console.error(`[ERROR_MIDDLEWARE] E11000 duplicate key on field(s): ${duplicateField}. Full error:`, err);
    statusCode = 409; // 409 Conflict is more semantically correct than 400
    message = "We couldn't complete that request. Please try again.";
  }

  // Mongoose Validation Error
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  // Multer File Size Limit Error
  else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File size exceeds the allowed limit";
  }

  // Clean up generic 500 internal errors to prevent leaking internal database/system log details in production
  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "An unexpected server error occurred. Please contact support.";
  }

  // Sanitize absolute file path leakage in error messages
  if (typeof message === "string") {
    message = message.replace(/\\|\\|[a-zA-Z]:\/[^:\s]*/g, "[internal path]");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
