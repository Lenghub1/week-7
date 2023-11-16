import { check } from "express-validator";
export const createPasswordValidator = [
  check("newPassword")
    .not()
    .isEmpty()
    .withMessage("New password is required.")
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
