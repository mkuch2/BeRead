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

export default router;
