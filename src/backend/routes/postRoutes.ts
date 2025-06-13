import { type Request, type Response, Router } from "express";
import prismaClient from "../prismaClient";
import { logger } from "@/backend/utils/logger";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";
import {
  param,
  body,
  query,
  matchedData,
  validationResult,
} from "express-validator";

const router: Router = Router();
const prisma = prismaClient;

router.get("/post/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const post_id = req.params.id;

    const post = await prisma.posts.findUnique({
      where: {
        id: post_id,
      },
      select: {
        id: true,
        book_title: true,
        pages: true,
        content: true,
        published_at: true,
        quote: true,
        author: true,
        username: true,
        user_id: true,
        likes: true,
        dislikes: true,
        thumbnail: true,
      },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found " });
      return;
    }

    res.status(200).json(post);
  } catch (e) {
    logger.log("Error getting post: ", e);
    res.status(500).json({ error: "Error getting post" });
  }
});

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
  body("thumbnail")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 255 })
    .trim(),
  async (req: Request, res: Response): Promise<void> => {
    const result = validationResult(req);

    //Result object has validation errors
    if (!result.isEmpty()) {
      //Send back array of all errors
      logger.log("Errors occurred!");
      res.status(400).json({ errors: result.array() });
      return;
    }

    //Get data as an object
    const data = { ...req.body, ...matchedData(req) };

    logger.log("Raw body", req.body);

    logger.log("Data :", data);
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
          thumbnail: data.thumbnail || null,
        },
      });

      res.status(200).json(post);
      return;
    } catch (e) {
      logger.log("Server error sending post", e);

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

router.get("/posts", async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.posts.findMany({
      orderBy: { published_at: "desc" },
    });

    res.status(200).json(posts);
  } catch (e) {
    logger.log("Error getting posts, ", e);
    res.status(500).json({ error: "Server failed to get posts" });
  }
});

router.get("/posts/recent", async (_req: Request, res: Response) => {
  const timeCutoff = new Date();
  timeCutoff.setHours(timeCutoff.getHours() - 24);

  try {
    const posts = await prisma.posts.findMany({
      where: {
        published_at: {
          gte: timeCutoff,
        },
      },
      orderBy: { published_at: "desc" },
    });

    res.status(200).json(posts);
  } catch (e) {
    logger.log("Error getting recent posts, ", e);
    res.status(500).json({ error: "Server failed to get recent posts" });
  }
});

router.get(
  "/posts/search",
  query("query").isString().trim().isLength({ max: 100 }).escape(),
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    logger.log("Errors, ", errors);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const data = matchedData(req);

    const query = data.query;

    try {
      const posts = await prisma.posts.findMany({
        where: {
          OR: [
            { book_title: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { published_at: "desc" },
      });

      logger.log("Server posts: ", posts);
      res.status(200).json(posts);
    } catch (e) {
      logger.log("Error getting posts: ", e);
      res.status(500).json({ error: "Failed to get posts" });
    }
  }
);

router.get(
  "/posts/user/:username",
  param("username")
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage("Valid username is required"),
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const data = matchedData(req);
    const username = data.username;

    try {
      const posts = await prisma.posts.findMany({
        where: {
          username: username,
        },
        orderBy: { published_at: "desc" },
      });

      res.status(200).json(posts);
    } catch (e) {
      logger.log("Error getting user posts: ", e);
      res.status(500).json({ error: "Failed to get user posts" });
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

    logger.log("Comment data: ", data);

    try {
      const comment = await prisma.comments.create({
        data: {
          username: data.username,
          content: data.content,
          user_id: data.user_id,
          post_id: data.post_id,
          parent_comment_id: data.parent_comment_id || null,
          likes: 0,
          dislikes: 0,
        },
      });

      res.status(200).json(comment);
      return;
    } catch (e) {
      logger.log("Server error sending comment", e);

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
        parent_comment_id: null,
      },
      orderBy: {
        published_at: "desc",
      },
    });

    res.status(200).json(comments);
  } catch (e) {
    logger.log("Error getting posts: ", e);
    res.status(500).json({ error: "Failed to get posts" });
  }
});

router.get("/comments/replies/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const replies = await prisma.comments.findMany({
      where: {
        parent_comment_id: id,
      },
      orderBy: {
        published_at: "asc",
      },
    });

    res.status(200).json(replies);
  } catch (e) {
    logger.log("Error getting replies", e);
    res.status(500).json({ error: "Could not get replies" });
  }
});

router.get(
  "/reaction",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const uid = req.user?.uid;
      const post_id = req.query.query as string;

      logger.log("Post_id", post_id);
      logger.log("uid", uid);

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

      logger.log("Reaction server: ", reaction);

      res.status(200).json(reaction);
    } catch (e) {
      logger.log("Error getting user reaction: ", e);
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
              post_id: post_id,
            },
          },
          update: {
            type: type,
          },
          create: {
            user_id: uid,
            post_id: post_id,
            type: type,
          },
        });

        return { reaction, post: updatedPost };
      });

      res.status(200).json(result);
    } catch (e) {
      logger.log("Error updating reaction: ", e);
      res.status(500).json({ error: "Error updating reaction" });
    }
  }
);

router.get(
  "/comment-reaction",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const uid = req.user?.uid;
      const comment_id = req.query.query as string;

      if (!uid || !comment_id) {
        res.status(400).json({ error: "Missing either userid or comment_id" });
        return;
      }

      logger.log("Uid: ", uid);
      logger.log("Server Comment id:", comment_id);

      const reaction = await prisma.comment_reactions.findUnique({
        where: {
          user_comment_reaction: {
            user_id: uid as string,
            comment_id: comment_id,
          },
        },
      });

      logger.log("Comment reaction server: ", reaction);

      res.status(200).json(reaction);
    } catch (e) {
      logger.log("Error getting user reaction: ", e);
      res.status(500).json({ error: "Could not get user reaction" });
    }
  }
);

router.post(
  "/comment-reaction",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const uid = req.user?.uid as string;
      const { comment_id, type } = req.body;

      logger.log("Post comment_id", comment_id);

      if (!uid) {
        res.status(400).json({ error: "User id not found" });
      }

      const comment = await prisma.comments.findUnique({
        where: { id: comment_id },
        select: { likes: true, dislikes: true },
      });

      if (!comment) {
        res.status(404).json({ error: "Comm not found" });
        return;
      }

      const lastReaction = await prisma.comment_reactions.findUnique({
        where: {
          user_comment_reaction: {
            user_id: uid,
            comment_id: comment_id,
          },
        },
      });

      const result = await prisma.$transaction(async (tx) => {
        let likes = comment.likes;
        let dislikes = comment.dislikes;

        if (lastReaction) {
          if (lastReaction.type === "like") likes--;
          if (lastReaction.type === "dislike") dislikes--;
        }

        if (type === "like") likes++;
        if (type === "dislike") dislikes++;

        const updatedComment = await tx.comments.update({
          where: { id: comment_id },
          data: {
            likes: likes,
            dislikes: dislikes,
          },
        });

        if (type === "none") {
          if (lastReaction) {
            await tx.comment_reactions.delete({
              where: {
                user_comment_reaction: {
                  user_id: uid,
                  comment_id: comment_id,
                },
              },
            });
          }

          return { reaction: null, comment: updatedComment };
        }

        const reaction = await tx.comment_reactions.upsert({
          where: {
            user_comment_reaction: {
              user_id: uid,
              comment_id: comment_id,
            },
          },
          update: {
            type: type,
          },
          create: {
            user_id: uid,
            comment_id: comment_id,
            type: type,
          },
        });

        return { reaction, comment: updatedComment };
      });

      res.status(200).json(result);
    } catch (e) {
      logger.log("Error updating reaction: ", e);
      res.status(500).json({ error: "Error updating reaction" });
    }
  }
);

router.get(
  "/posts/friends",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const uid = req.user?.uid;

    try {
      // Get all accepted relationships for the current user
      const relationships = await prisma.relationships.findMany({
        where: {
          OR: [
            { requester_id: uid, status: "ACCEPTED" },
            { addressee_id: uid, status: "ACCEPTED" },
          ],
        },
      });

      // Get all friend user IDs (excluding self)
      const friendIds = relationships.map((r) =>
        r.requester_id === uid ? r.addressee_id : r.requester_id
      );

      // Get all posts by friends
      const posts = await prisma.posts.findMany({
        where: {
          user_id: { in: friendIds },
        },
        orderBy: { published_at: "desc" },
      });

      res.status(200).json(posts);
    } catch (e) {
      logger.log("Error getting friends' posts:", e);
      res.status(500).json({ error: "Failed to get friends' posts" });
    }
  }
);

export default router;
