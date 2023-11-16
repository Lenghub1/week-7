import { check } from "express-validator";

export const createEmailValidator = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required to login.")
    .isEmail()
    .withMessage("Email is invalid.")
    .trim(),
];
