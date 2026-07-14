import jwt from "jsonwebtoken";

export const generateToken = (id, role = "customer") => {
  const expiresIn = role === "admin" ? "30d" : (process.env.JWT_EXPIRE || "7d");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });
};
