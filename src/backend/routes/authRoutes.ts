import { Router } from "express";
import {
  body,
  validationResult,
  matchedData,
  type Result,
  type ValidationError,
} from "express-validator";
import prismaClient from "../prismaClient";
import bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const router: Router = Router();
const prisma = prismaClient;

router.post(
  "/signup",
  body("username")
    .trim()
    .notEmpty()
    .isLength({
      min: 5,
      max: 50,
    })
    .matches(/^[a-zA-Z0-9_]+$/)
    .escape(),
  body("email").trim().notEmpty().isEmail(),
  body("password")
    .trim()
    .notEmpty()
    .isLength({
      min: 8,
      max: 50,
    })
    .matches(/^[a-zA-Z0-9!@#$%^&*]+$/),
  async (req, res) => {
    const result: Result<ValidationError> = validationResult(req);

    //Result object has validation errors
    if (!result.isEmpty()) {
      //Send back array of all errors
      res.status(400).json({ errors: result.array() });
      return;
    }

    //Get data as an object
    const data = matchedData(req);

    //Hash password
    const saltRounds = 10;
    const hash = bcrypt.hashSync(data.password, saltRounds);

    try {
      //Add user to database
      const user = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          password_hash: hash,
        },
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          username: user.username,
          email: user.email,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          //User with same username or email already exists in database
          const target = (e.meta?.target as string[]) || [];
          const field = target[0] || "field";

          res.status(409).json({
            errors: [
              {
                msg: `${field} is already taken`,
                meta: e.meta,
                code: e.code,
              },
            ],
          });
          return;
        }
      }
      res.status(500).json({
        errors: [
          {
            msg: "An unexpected error occurred",
          },
        ],
      });
    }
  }
);

export default router;
