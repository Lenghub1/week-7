import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import sendEmailWithNodemailer from "../utils/email.js";
import jwt from "jsonwebtoken";

const authService = {
  signAccountActivateToken(email, password, firstName, lastName) {
    let token = jwt
      .sign(
        { email, password, firstName, lastName },
        process.env.ACCOUNT_ACTIVATION_TOKEN,
        {
          expiresIn: process.env.ACCOUNT_ACTICATION_TOKEN_EXPIRES,
        }
      )
      .replaceAll(".", "RUKHAKTOKEN");
    return token;
  },

  sendEmailActivateAccount(req, res, token, email) {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "ACCOUNT ACTIVATION LINK",
      html: `<h1>Please use the following link to activate your account</h1>
      <p>http://localhost:3000/auth/activate/${token}</p>
    <hr />
      <p>This email may contain sensitive information</p>
      <p>http://localhost:3000</p>`,
    };
    sendEmailWithNodemailer(req, res, emailData);
  },

  verifyJWT(req, res, next, token) {
    jwt.verify(
      token,
      process.env.ACCOUNT_ACTIVATION_TOKEN,
      async (err, decoded) => {
        // Check token expire or not yet
        if (err) {
          return next(
            new APIError({
              status: 401,
              message: "Link Expired! Please signup again",
            })
          );
        }

        // If token not expire get the data from token
        const { email, firstName, lastName, password } = decoded;

        // Check if there is any field is missing
        if (!email || !firstName || !lastName || !password) {
          return next(
            new APIError({
              status: 401,
              message:
                "Please sign up again! Make sure to fill in all required information.",
            })
          );
        }

        // Save to database
        const user = await User.create({
          email,
          password,
          firstName,
          lastName,
        });

        // Send respond
        res.json({
          message: "Account activated. Please log in to continue.",
          data: {
            user,
          },
        });
      }
    );
  },
};

export default authService;
