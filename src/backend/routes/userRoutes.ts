import { type Response, Router } from "express";
import prismaClient from "../prismaClient";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";
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

export default router;
