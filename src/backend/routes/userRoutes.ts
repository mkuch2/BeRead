import { type Request, type Response, Router } from "express";
import prismaClient from "../prismaClient";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";
const router: Router = Router();
const prisma = prismaClient;

router.get(
  "/profile",
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

router.post("/post", async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data) {
    res.status(400).json({ error: "Request body not found" });
    return;
  }

  console.log(data);

  try {
    const post = await prisma.posts.create({
      data: {
        user_id: data.user_id,
        book_title: data.book_title,
        pages: data.pages,
        content: data.content,
        quote: data.quote,
        author: data.author,
        username: data.username,
      },
    });

    res.status(200).json(post);
    return;
  } catch (e) {
    console.log("Server error sending post", e);

    if (e instanceof Error) {
      res.status(500).json({ error: e.message });
      return;
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
      return;
    }
  }
});

export default router;
