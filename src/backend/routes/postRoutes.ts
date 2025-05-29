import { type Request, type Response, Router } from "express";
import prismaClient from "../prismaClient";
import verifyToken from "../middleware/authMiddleware";
import { query, matchedData, validationResult } from "express-validator";

const router: Router = Router();
const prisma = prismaClient;

router.post(
  "/post",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body;

    if (!data) {
      res.status(400).json({ error: "Request body not found" });
      return;
    }

    console.log("Post data: ", data);

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
  }
);

router.get(
  "/posts",
  query("query").isString().trim().isLength({ max: 100 }).escape(),
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    console.log("Errors, ", errors);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const data = matchedData(req);

    const book_title = data.query;

    try {
      const posts = await prisma.posts.findMany({
        where: {
          book_title: { contains: book_title, mode: "insensitive" },
        },
        take: 10,
      });

      console.log("Server posts: ", posts);
      res.status(200).json(posts);
    } catch (e) {
      console.log("Error getting posts: ", e);
      res.status(500).json({ error: "Failed to get posts" });
    }
  }
);

router.post("/comment", async (req: Request, res: Response): Promise<void> => {
  const data = req.body;

  if (!data) {
    res.status(400).json({ error: "Request body not found" });
    return;
  }

  console.log("Comment data: ", data);

  try {
    const comment = await prisma.comments.create({
      data: {
        username: data.username,
        content: data.content,
        user_id: data.user_id,
        post_id: data.post_id,
        replies: [],
      },
    });

    res.status(200).json(comment);
    return;
  } catch (e) {
    console.log("Server error sending comment", e);

    if (e instanceof Error) {
      res.status(500).json({ error: e.message });
      return;
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
      return;
    }
  }
});

router.get("/comments", async (req: Request, res: Response): Promise<void> => {
  const query = req.query.query as string;

  try {
    const comments = await prisma.comments.findMany({
      where: {
        post_id: query,
      },
      take: 10,
      orderBy: {
        published_at: "desc",
      },
    });

    res.status(200).json(comments);
  } catch (e) {
    console.log("Error getting posts: ", e);
    res.status(500).json({ error: "Failed to get posts" });
  }
});

export default router;
