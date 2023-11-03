import { check } from "express-validator";

const createPostValidator = [
  check("title").not().isEmpty().withMessage("The Post Title cannot be empty"),
  check("description")
    .not()
    .isEmail()
    .isLength({ min: 10 })
    .withMessage(
      "The Post Description must be not empty and longer than 10 character long"
    ),
];

export default createPostValidator;
