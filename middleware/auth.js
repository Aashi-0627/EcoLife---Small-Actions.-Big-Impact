import { verifyToken } from "../utils/jwt.js";
import { db } from "../db/store.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated. Please log in." });
  }
  try {
    const payload = verifyToken(token);
    const user = db.users.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Session invalid. Please log in again." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}
