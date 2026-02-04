import { verifyToken } from "../utils/generateToken.js";

export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        error: {
          message: "Authentication required. Please provide a valid token."
        }
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      company: decoded.company
    };

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: {
        message: "Invalid or expired token"
      }
    });
  }
}

