import { check } from "express-validator";

export const createLoginValidator = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required to login.")
    .isEmail()
    .withMessage("Email is invalid.")
    .trim(),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required to login."),
];
