import jwt from "jsonwebtoken";

export const generateRefreshToken = (id, role = "customer") => {
  const expiresIn = role === "admin" ? "90d" : (process.env.JWT_REFRESH_EXPIRE || "30d");
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
  });
};
