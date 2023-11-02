import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import sendEmailWithNodemailer from "../utils/email.js";

const signup = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);

  const token = jwt.sign({ email }, process.env.ACCOUNT_ACTIVATION_TOKEN, {
    expiresIn: process.env.ACCOUNT_ACTICATION_TOKEN_EXPIRES,
  });

  const emailData = {
    from: "noreply@rukhak.com",
    to: email,
    subject: "ACCOUNT ACTIVATION LINK",
    html: `<h1>Please use the following link to activate your account</h1>
    <p>http://localhost:3000/auth/activate/${token}</p>
    <hr />
    <p>This email may contain sensitive information</p>
    <p>http://localhost:3000</p>`,
  };

  sendEmailWithNodemailer(req, res, emailData);
});

export const authController = { signup };
