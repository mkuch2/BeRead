import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import app from "../firebase-admin";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log("=== Auth Middleware Debug ===");
  console.log("All headers:", Object.keys(req.headers));
  console.log("Authorization header:", req.headers.authorization);
  console.log("Auth header (custom):", req.headers.auth);
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("No valid authorization header found");
    res.status(401).json({
      msg: "Authorization header required",
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  console.log("Extracted token length:", token ? token.length : 0);

  if (!token) {
    console.log("Could not get user token");
    res.status(401).json({
      msg: "Could not get user token",
    });
    return;
  }

  try {
    console.log("Attempting to verify token...");
    const decodedToken = await getAuth(app).verifyIdToken(token);
    console.log("Token verified successfully for user:", decodedToken.email);

    if (decodedToken) {
      (req as AuthRequest).user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };

      next();
    } else {
      throw new Error("Unable to validate token");
    }
  } catch (e) {
    console.log("Token verification error:", e);
    if (e instanceof Error) {
      console.log("Error message:", e.message);
      res.status(403).json({
        msg: e.message,
      });
      return;
    }
  }
};

export default verifyToken;