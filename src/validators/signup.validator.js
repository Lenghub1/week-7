import { check } from "express-validator";
import User from "../models/user.model.js";

export const createSignupValidator = [
  check("firstName").not().isEmpty().withMessage("First name cannot be empty."),
  check("lastName").not().isEmpty().withMessage("Last name cannot be empty."),
  check("email")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) throw new Error("Email is already existed.");
    }),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 0,
      minSymbols: 0,
      minUppercase: 0,
    })
    .withMessage("Password must contain a minimum of 8 characters"),
  // .custom((value) => {
  //   if (value[0] == " " || value[value.length - 1] == " ") {
  //     throw new Error("Password cannot start or end with space.");
  //   }
  // }),
];
