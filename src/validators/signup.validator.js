import { check } from "express-validator";
import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";

export const createSignupValidator = [
  check("firstName").not().isEmpty().withMessage("First name cannot be empty."),
  check("lastName").not().isEmpty().withMessage("Last name cannot be empty."),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });

      if (user && user.active) {
        throw new Error("Email is already in use.");
      } else if (user && !user.active) {
        throw new Error(
          "Email recently signed up. Please wait 10 minutes before signing up again or check your email to activate your account."
        );
      }

      return true;
    }),
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 0,
      minUppercase: 0,
    })
    .withMessage("Password must contain a minimum of 8 characters")
    .custom((value) => {
      console.log(value.trim() !== value);
      if (value.trim() !== value) {
        throw new Error("Password can not be start or end with space.");
      }
      return true;
    }),
];
