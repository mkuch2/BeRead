import { Router } from "express";
import {
  body,
  validationResult,
  matchedData,
  type Result,
  type ValidationError,
} from "express-validator";

const router: Router = Router();

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
  (req, res) => {
    const result: Result<ValidationError> = validationResult(req);

    console.log(result.array());
    //Result object has validation errors
    if (!result.isEmpty()) {
      //Send back array of all errors
      res.status(400).json({ errors: result.array() });
      return;
    }

    const data = matchedData(req);

    console.log(data);
    res.status(200).send("POST data received successfully");
  }
);

export default router;
