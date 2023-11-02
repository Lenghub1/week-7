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
  check("unitPrice")
    .not()
    .isEmpty()
    .isInt({
      min: 0,
    })
    .withMessage("The product price must be a positive number."),
  check("availableStock")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Please enter the available stock."),
  check("media").not().isEmpty().withMessage("Please upload images!"),
];
