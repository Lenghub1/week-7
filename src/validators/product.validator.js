import { check } from "express-validator";

export const createProductValidator = [
  check("title").not().isEmpty().withMessage("Product title cannot be empty."),
  check("description")
    .not()
    .isEmpty()
    .isLength({ min: 10 })
    .withMessage(
      "Description field cannot be empty and must have at least 10 characters long."
    ),
];
