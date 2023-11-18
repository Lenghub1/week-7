import { check } from "express-validator";

export const createEmailValidator = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Email is invalid.")
    .trim(),
];
