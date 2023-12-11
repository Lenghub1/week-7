import { check } from "express-validator";
import User from "@/models/user.model";

export const createSignupValidator = [
  check("storeName")
    .not()
    .isEmpty()
    .withMessage("Store's name cannot be empty.")
    .trim(),
  check("storeAddress")
    .not()
    .isEmpty()
    .withMessage("Store's Address cannot be empty.")
    .trim(),
  check("phoneNumber")
    .not()
    .isEmpty()
    .withMessage("Phone number is requred.")
    .trim()
    .custom(async (value) => {
      const result = /^[0-9\s\-()]{8,}$/.test(value);
      const user = await User.findOne({ phoneNumber: value });
      if (user) {
        throw new Error("Phone number is already existed.");
      } else if (!result) {
        throw new Error("Invalid phone number.");
      }
      return true;
    }),
  check("dateOfBirth").not.isEmpty().withMessage("Birthday is required."),
];
