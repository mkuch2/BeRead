import { type Request, type Response, Router } from "express";
import { logger } from "@/backend/utils/logger";
import prismaClient from "../prismaClient";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";
import {
  body,
  query,
  matchedData,
  validationResult,
  type Result,
  type ValidationError,
} from "express-validator";

const router: Router = Router();
const prisma = prismaClient;

router.get(
  "/display-profile",
  verifyToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userEmail = req.user?.email;
      logger.log("User email: ", userEmail);

      const userProfile = await prisma.users.findUnique({
        where: { email: userEmail },
        select: {
          username: true,
          bio: true,
          name: true,
          email: true,
        },
      });

      logger.log("User profile:", userProfile);

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
router.put(
  "/update-bio",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userEmail = req.user?.email;
      const { bio } = req.body;

      if (!userEmail) {
        res.status(401).json({ msg: "Unauthorized" });
        return;
      }

      const updatedUser = await prisma.users.update({
        where: { email: userEmail },
        data: { bio },
        select: {
          username: true,
          name: true,
          bio: true,
          email: true,
        },
      });

      res.status(200).json({ profile: updatedUser });
    } catch (e) {
      console.error("Error updating bio:", e);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);
router.get("/user", async (req: Request, res: Response): Promise<void> => {
  const uid = req.query.query as string;

  logger.log(uid);

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
      logger.log("Error: ", e.message);
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
    logger.log("Error getting user: ", e);
    res.status(500).json({ error: "Error getting user" });
  }
});

router.get("/user/profile/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  logger.log("Get username request parameters", req.params);

  if (!username) {
    res.status(400).json({ error: "Missing parameter required" });
    return;
  }

  try {
    const userProfile = await prisma.users.findUnique({
      where: {
        username: username,
      },
      select: {
        username: true,
        name: true,
        bio: true,
        email: true,
        currentlyReadingId: true,
        currentlyReadingTitle: true,
        currentlyReadingAuthors: true,
        currentlyReadingThumbnail: true,
        favoriteBooks: {
          select: {
            id: true,
            title: true,
            authors: true,
            thumbnail: true,
            bookId: true,
          },
        },
      },
    });

    if (!userProfile) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const formattedProfile = {
      ...userProfile,
      currentlyReading: userProfile.currentlyReadingId
        ? {
            id: userProfile.currentlyReadingId,
            title: userProfile.currentlyReadingTitle || "",
            authors: userProfile.currentlyReadingAuthors
              ? userProfile.currentlyReadingAuthors.split(", ")
              : [],
            thumbnail: userProfile.currentlyReadingThumbnail,
          }
        : null,
      favoriteBooks: userProfile.favoriteBooks.map((book) => ({
        id: book.bookId,
        title: book.title,
        authors: book.authors ? book.authors.split(", ") : [],
        thumbnail: book.thumbnail,
      })),
    };

    res.status(200).json(formattedProfile);
  } catch (e) {
    logger.log("Error getting user: ", e);
    res.status(500).json({ error: "Error getting user" });
  }
});

router.get("/user/username/:username", async (req: Request, res: Response) => {
  const username = req.params.username;

  if (!username) {
    res.status(400).json({ error: "Missing required parameter" });
  }

  try {
    const uid = await prisma.users.findUnique({
      where: {
        username: username,
      },
      select: {
        firebase_uid: true,
      },
    });

    res.status(200).json(uid);
  } catch (e) {
    logger.log("Error getting user, ", e);
    res.status(500).json({ error: "Could not get user" });
  }
});

router.put(
  "/user/:id/bio",
  verifyToken,
  body("bio").trim().notEmpty().isLength({ max: 160 }).escape(),
  async (req: Request, res: Response) => {
    const uid = req.params.id;

    const result: Result<ValidationError> = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const data = matchedData(req);

    logger.log("data: ", data);

    try {
      const updatedBio = await prisma.users.update({
        where: {
          firebase_uid: uid,
        },
        data: {
          bio: data.bio,
        },
        select: {
          bio: true,
        },
      });

      if (updatedBio) {
        res.status(200).json(updatedBio);
        return;
      } else {
        res.status(500).json({ error: "Could not update bio" });
      }
    } catch (e) {
      logger.log("Error updating bio, ", e);
      res.status(500).json({ error: "Error updating bio" });
    }
  }
);

router.get("/users", async (req: Request, res: Response): Promise<void> => {
  const query = req.query.query as string;
  if (!query) {
    res.json({ users: [] });
    return;
  }

  const users = await prisma.users.findMany({
    where: {
      username: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      username: true,
      name: true,
    },
  });

  res.json({ users });
});

export default router;
