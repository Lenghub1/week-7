import { check } from "express-validator";

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
    .trim(),
];
