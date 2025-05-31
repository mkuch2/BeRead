import { Router, type Request, type Response } from "express";
import {
  body,
  validationResult,
  matchedData,
  query,
  type Result,
  type ValidationError,
} from "express-validator";
import prismaClient from "../prismaClient";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import verifyToken, { type AuthRequest } from "../middleware/authMiddleware";

const router: Router = Router();
const prisma = prismaClient;

// ========== SIGNUP ==========
router.post(
  "/signup",
  body("username")
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .escape(),
  body("name")
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("email").trim().notEmpty().isEmail(),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 8, max: 50 })
    .matches(/^[a-zA-Z0-9!@#$%^&*]+$/),
  body("firebase_uid").notEmpty().isString(),
  async (req, res) => {
    const result: Result<ValidationError> = validationResult(req);

    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const data = matchedData(req);
    const saltRounds = 10;
    const hash = bcrypt.hashSync(data.password, saltRounds);

    try {
      const user = await prisma.users.create({
        data: {
          username: data.username,
          name: data.name,
          email: data.email,
          password_hash: hash,
          firebase_uid: data.firebase_uid,
        },
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          username: user.username,
          name: user.name,
          email: user.email,
        },
      });
    } catch (e) {
      console.error("Unexpected signup error:", e);
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
        const target = (e.meta?.target as string[]) || [];
        const field = target[0] || "field";
        res.status(409).json({
          errors: [{ msg: `${field} is already taken`, meta: e.meta, code: e.code }],
        });
        return;
      }
      res.status(500).json({ errors: [{ msg: "An unexpected error occurred" }] });
    }
  }
);

// ========== DISPLAY PROFILE ==========
router.get("/display-profile", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    const userProfile = await prisma.users.findUnique({
      where: { email: userEmail },
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
      res.status(404).json({ msg: "User not found" });
      return;
    }

    const formattedProfile = {
      ...userProfile,
      currentlyReading: userProfile.currentlyReadingId ? {
        id: userProfile.currentlyReadingId,
        title: userProfile.currentlyReadingTitle || "",
        authors: userProfile.currentlyReadingAuthors ? userProfile.currentlyReadingAuthors.split(", ") : [],
        thumbnail: userProfile.currentlyReadingThumbnail,
      } : null,
      favoriteBooks: userProfile.favoriteBooks.map((book) => ({
        id: book.bookId,
        title: book.title,
        authors: book.authors ? book.authors.split(", ") : [],
        thumbnail: book.thumbnail,
      })),
    };

    res.status(200).json({ profile: formattedProfile });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// ========== ADD FAVORITE BOOK ==========
router.post("/favorite-books", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { bookId, title, authors, thumbnail } = req.body;
    const userFirebaseUid = req.user?.uid;
    
    if (!userFirebaseUid) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { firebase_uid: userFirebaseUid },
    });
    
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    const existingFavorite = await prisma.favoriteBook.findFirst({
      where: { 
        userId: user.firebase_uid,
        bookId: bookId 
      },
    });
    
    if (existingFavorite) {
      res.status(400).json({ msg: "Book already in favorites" });
      return;
    }

    const favoriteBook = await prisma.favoriteBook.create({
      data: {
        userId: user.firebase_uid,
        bookId,
        title,
        authors: Array.isArray(authors) ? authors.join(", ") : authors,
        thumbnail,
      },
    });

    res.status(201).json({ msg: "Book added to favorites", favoriteBook });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// ========== SET CURRENTLY READING BOOK ==========
router.post("/currently-reading", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { bookId, title, authors, thumbnail } = req.body;
    const userFirebaseUid = req.user?.uid;
    
    if (!userFirebaseUid) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { firebase_uid: userFirebaseUid },
    });
    
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    const updatedUser = await prisma.users.update({
      where: { firebase_uid: userFirebaseUid },
      data: {
        currentlyReadingId: bookId,
        currentlyReadingTitle: title,
        currentlyReadingAuthors: Array.isArray(authors) ? authors.join(", ") : authors,
        currentlyReadingThumbnail: thumbnail,
      },
    });

    res.status(200).json({ msg: "Currently reading book set successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// ========== REMOVE CURRENTLY READING BOOK ==========
router.delete("/currently-reading", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userFirebaseUid = req.user?.uid;
    
    if (!userFirebaseUid) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { firebase_uid: userFirebaseUid },
    });
    
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    await prisma.users.update({
      where: { firebase_uid: userFirebaseUid },
      data: {
        currentlyReadingId: null,
        currentlyReadingTitle: null,
        currentlyReadingAuthors: null,
        currentlyReadingThumbnail: null,
      },
    });

    res.status(200).json({ msg: "Currently reading book removed successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// ========== REMOVE FAVORITE BOOK ==========
router.delete("/favorite-books/:bookId", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { bookId } = req.params;
    const userFirebaseUid = req.user?.uid;
    
    if (!userFirebaseUid) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { firebase_uid: userFirebaseUid },
    });
    
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    const favoriteBook = await prisma.favoriteBook.findFirst({
      where: { 
        userId: user.firebase_uid,
        bookId: bookId 
      },
    });
    
    if (!favoriteBook) {
      res.status(404).json({ msg: "Favorite book not found" });
      return;
    }

    await prisma.favoriteBook.delete({
      where: { id: favoriteBook.id },
    });

    res.status(200).json({ msg: "Book removed from favorites" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});


export default router;