import { check, query } from "express-validator";

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

export const sellerProductQueryValidator = [
  // Price filter check
  query("unitPrice")
    .optional()
    .custom((value) => {
      if (
        typeof value !== "object" ||
        !value.hasOwnProperty("gte") ||
        !value.hasOwnProperty("lte")
      ) {
        throw new Error(
          "unitPrice query must be of shape 'unitPrice[gte]=10&unitPrice[lte]=100'"
        );
      }

      return true;
    }),
  query("unitPrice.gte")
    .optional()
    .isInt({ min: 0 })
    .withMessage("unitPrice must be a natural number."),
  query("unitPrice.lte")
    .optional()
    .isInt({ min: 0 })
    .withMessage("unitPrice must be a natural number."),

  // availableStock filter check
  query("availableStock")
    .optional()
    .custom((value) => {
      if (
        typeof value !== "object" ||
        !value.hasOwnProperty("gte") ||
        !value.hasOwnProperty("lte")
      ) {
        throw new Error(
          "availableStock query must be of shape 'quantity[gte]=10&quantity[lte]=100'"
        );
      }

      return true;
    }),
  query("availableStock.gte")
    .optional()
    .isInt()
    .withMessage("Quantity must be an integer."),
  query("availableStock.lte")
    .optional()
    .isInt()
    .withMessage("Quantity must be an integer."),

  // Category filter check
  query("categories")
    .optional()
    .not()
    .isNumeric()
    .withMessage("Categories must be text split by comma.")
    .escape(),

  // Sort
  query("sort")
    .optional()
    .customSanitizer((value, { req }) => {
      const availableFields = value.split(",");

      // field that must not be sorted
      const excludedFields = ["_id", "__v", "media"];
      const sanitizedFields = availableFields.filter(
        (each) => !excludedFields.includes(each.trim())
      );
      return (req.query.sort = sanitizedFields.join(","));
    }),

  // Pagination
  query("limit")
    .optional()
    .isInt({ max: 350 })
    .withMessage("Limit must be between 0 to 350."),

  // Search (query)
  query("q").optional().escape(),
];
