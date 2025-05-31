import { type Request, type Response, Router } from "express";
import prismaClient from "../prismaClient";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";
import { body, query, matchedData, validationResult } from "express-validator";

const router: Router = Router();
const prisma = prismaClient;

router.post(
  "/post",
  verifyToken,
  body("book_title")
    .trim()
    .notEmpty()
    .isLength({
      min: 1,
      max: 64,
    })
    .escape(),
  body("content")
    .trim()
    .notEmpty()
    .isLength({
      min: 1,
      max: 328,
    })
    .escape(),
  body("quote").trim().isLength({
    max: 128,
  }),
  async (req: Request, res: Response): Promise<void> => {
    const result = validationResult(req);

    //Result object has validation errors
    if (!result.isEmpty()) {
      //Send back array of all errors
      console.log("Errors occurred!");
      res.status(400).json({ errors: result.array() });
      return;
    }

    //Get data as an object
    const data = { ...req.body, ...matchedData(req) };

    console.log("Raw body", req.body);

    console.log("Data :", data);
    if (!data) {
      res.status(400).json({ error: "Request body not found" });
      return;
    }

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
          likes: 0,
          dislikes: 0,
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

router.post(
  "/comment",
  body("content").trim().notEmpty().isLength({ max: 350 }).escape(),
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
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
          likes: 0,
          dislikes: 0,
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
  }
);

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

router.get(
  "/reaction",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const uid = req.user?.uid;
      const post_id = req.query.query as string;

      console.log("Post_id", post_id);
      console.log("uid", uid);

      if (!uid || !post_id) {
        res.status(400).json({ error: "Missing either userid or postid" });
        return;
      }

      const reaction = await prisma.reactions.findUnique({
        where: {
          user_post_reaction: {
            user_id: uid,
            post_id: post_id,
          },
        },
      });

      console.log("Reaction server: ", reaction);

      res.status(200).json(reaction);
    } catch (e) {
      console.log("Error getting user reaction: ", e);
      res.status(500).json({ error: "Could not get user reaction" });
    }
  }
);

router.post(
  "/reaction",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const uid = req.user?.uid as string;
      const { post_id, type } = req.body;

      if (!uid) {
        res.status(400).json({ error: "User id not found" });
      }

      const post = await prisma.posts.findUnique({
        where: { id: post_id },
        select: { likes: true, dislikes: true },
      });

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const lastReaction = await prisma.reactions.findUnique({
        where: {
          user_post_reaction: {
            user_id: uid,
            post_id: post_id,
          },
        },
      });

      const result = await prisma.$transaction(async (tx) => {
        let likes = post.likes;
        let dislikes = post.dislikes;

        if (lastReaction) {
          if (lastReaction.type === "like") likes--;
          if (lastReaction.type === "dislike") dislikes--;
        }

        if (type === "like") likes++;
        if (type === "dislike") dislikes++;

        const updatedPost = await tx.posts.update({
          where: { id: post_id },
          data: {
            likes: likes,
            dislikes: dislikes,
          },
        });

        if (type === "none") {
          if (lastReaction) {
            await tx.reactions.delete({
              where: {
                user_post_reaction: {
                  user_id: uid,
                  post_id: post_id,
                },
              },
            });
          }

          return { reaction: null, post: updatedPost };
        }

        const reaction = await tx.reactions.upsert({
          where: {
            user_post_reaction: {
              user_id: uid,
              post_id,
            },
          },
          update: {
            type,
          },
          create: {
            user_id: uid,
            post_id,
            type,
          },
        });

        return { reaction, post: updatedPost };
      });

      res.status(200).json(result);
    } catch (e) {
      console.log("Error updating reaction: ", e);
      res.status(500).json({ error: "Error updating reaction" });
    }
  }
);

export default router;
