import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import sendEmailWithNodemailer from "../utils/email.js";
import jwt from "jsonwebtoken";

const authService = {
  signTokenForActivateAccount(email, firstName, lastName, password) {
    return jwt
      .sign(
        { email, password, firstName, lastName },
        process.env.ACCOUNT_ACTIVATION_TOKEN,
        {
          expiresIn: process.env.ACCOUNT_ACTICATION_TOKEN_EXPIRES,
        }
      )
      .replaceAll(".", "RUKHAK2023");
  },

  sendEmailActivateAccount(req, res, token, email) {
    const emailData = {
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

  verifyJWTForActivateAccount(req, res, next, token) {
    return jwt.verify(
      token,
      process.env.ACCOUNT_ACTIVATION_TOKEN,
      async (err, decoded) => {
        console.log(decoded);
        if (err) {
          return next(
            new APIError({
              status: 401,
              message: "Link Expired! Please signup again",
            })
          );
        }

        const { email, firstName, lastName, password } = decoded;

        if (!email || !firstName || !lastName || !password) {
          return next(
            new APIError({
              status: 401,
              message:
                "Please sign up again! Make sure to fill in all required information.",
            })
          );
        }

        const user = await User.create({
          email,
          password,
          firstName,
          lastName,
        });

        console.log(email);
        res.status(200).json({
          message: "Account activated. Please log in to continue.",
          data: {
            user,
          },
        });
      }
    );
  },

  signAccessToken(userId) {
    return jwt.sign(
      {
        userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );
  },

  signRefreshToken(userId) {
    return jwt.sign(
      {
        userId,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    );
  },

  verifyRefreshToken(req, res, next, refreshToken, session) {
    return jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err || session.userId !== decoded.userId) {
          return next(
            new APIError({
              status: 403,
              message: "Forbidden",
            })
          );
        }

        const accessToken = this.signAccessToken(decoded.userId);
        const refreshToken = this.signRefreshToken(decoded.userId);
        session.refreshToken = refreshToken;
        session.accessToken = accessToken;
        await session.save();

        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
        });

        res.json({ accessToken });
      }
    );
  },
};

export default authService;
