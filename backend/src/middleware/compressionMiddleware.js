import zlib from "zlib";

/**
 * Zero-dependency native Node.JS response compression middleware using built-in zlib module.
 * Automatically Gzip compresses API JSON responses > 1KB.
 */
export const responseCompressor = (req, res, next) => {
  const acceptEncoding = req.headers["accept-encoding"] || "";

  if (!acceptEncoding.includes("gzip")) {
    return next();
  }

  const originalJson = res.json;
  res.json = function (data) {
    if (res.headersSent) {
      return originalJson.call(this, data);
    }

    const payload = JSON.stringify(data);
    const buffer = Buffer.from(payload);

    // Skip compression for small payloads (< 1KB)
    if (buffer.length < 1024) {
      return originalJson.call(this, data);
    }

    zlib.gzip(buffer, (err, gzipped) => {
      if (err) {
        return originalJson.call(this, data);
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      res.setHeader("Content-Length", gzipped.length);
      res.end(gzipped);
    });
  };

  next();
};
