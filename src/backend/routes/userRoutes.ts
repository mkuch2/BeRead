import { type Request, type Response, Router } from "express";
import prismaClient from "../prismaClient";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";
import { query, matchedData, validationResult } from "express-validator";

const router: Router = Router();
const prisma = prismaClient;

router.get(
  "/display-profile",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email;
      console.log("User email: ", userEmail);

      const userProfile = await prisma.users.findUnique({
        where: { email: userEmail },
        select: {
          username: true,
          bio: true,
          name: true,
          email: true,
        },
      });

      console.log("User profile:", userProfile);

      if (!userProfile) {
        res.status(404).json({ msg: "User not found" });
        return;
      }

      res.status(200).json({ profile: userProfile });
    } catch (e) {
      if (e instanceof Error) {
        res.status(500).json({ msg: e.message });
      }
    }
  }
);

router.put(
  "/update-profile",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        res.status(401).json({ msg: "Unauthorized" });
        return;
      }
      const { username, name, bio } = req.body;
      const updatedUser = await prisma.users.update({
        where: { email: userEmail },
        data: {
          username,
          name,
          bio,
        },
        select: {
          username: true,
          name: true,
          bio: true,
          email: true,
        },
      });
      res.status(200).json({ profile: updatedUser });
    } catch (e) {
      if (e instanceof Error) {
        res.status(500).json({ msg: e.message });
      }
    }
  }
);

router.get("/user", async (req: Request, res: Response): Promise<void> => {
  const uid = req.query.query as string;

  console.log(uid);

  if (!uid) {
    res.status(400).json({ error: "Query parameter required" });
    return;
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        firebase_uid: uid,
      },
      select: {
        username: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (e) {
    if (e instanceof Error) {
      console.log("Error: ", e.message);
      res.status(500).json({ error: "Server error" });
    }
  }
});

router.get("/user/:id", async (req: Request, res: Response) => {
  const uid = req.params.id;

  if (!uid) {
    res.status(400).json({ error: "Missing parameter required" });
    return;
  }

  try {
    const user = await prisma.users.findUnique({
      where: {
        firebase_uid: uid,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (e) {
    console.log("Error getting user: ", e);
    res.status(500).json({ error: "Error getting user" });
  }
});

export default router;
