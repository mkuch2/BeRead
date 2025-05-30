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
  const token = req.headers.auth as string;

  if (!token) {
    console.log("Could not get user token");
    res.status(401).json({
      msg: "Could not get user token",
    });
    return;
  }
  try {
    const decodedToken = await getAuth(app).verifyIdToken(token);

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
    if (e instanceof Error) {
      res.status(403).json({
        msg: e.message,
      });
      return;
    }
  }
};

export default verifyToken;
