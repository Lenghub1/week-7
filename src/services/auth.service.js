import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import APIError from "../utils/APIError.js";
import sendEmailWithNodemailer from "../utils/email.js";
import jwt from "jsonwebtoken";

const authService = {
  signTokenForActivateAccount(data) {
    const { email, password, firstName, lastName } = data;
    console.log(email);
    return jwt.sign(
      { email, password, firstName, lastName },
      process.env.ACCOUNT_ACTIVATION_TOKEN,
      {
        expiresIn: process.env.ACCOUNT_ACTICATION_TOKEN_EXPIRES,
      }
    );
    // .replaceAll(".", "RUKHAK2023");
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

  verifyJWTForActivateAccount(req, res, next, data) {
    const { token } = data;
    if (!token) {
      return next(
        new APIError({
          status: 401,
          message: "Token is not defined! Please signup again.",
        })
      );
    }
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
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
          },
        });
      }
    );
  },

  async verifyUser(data, next) {
    const { email, password } = data;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.verifyPassword(password))) {
      return next(
        new APIError({
          status: 400,
          message: "Email or password is incorrected.", // For more secure and prevent malicious from knowing which field they input wrong.
        })
      );
    }

    return user;
  },

  checkCookie(cookies, next) {
    if (!cookies?.jwt) {
      return next(
        new APIError({
          status: 401,
          message:
            "Unauthorized: Access is denied due to invalid credentials. Please login again.",
        })
      );
    }

    return (refreshToken = cookies.jwt);
  },

  async verifySession(refreshToken, next) {
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      return next(
        new APIError({
          status: 403,
          message: "Forbidden",
        })
      );
    }
    return session;
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
        session.accessToken = accessToken;
        await session.save();

        res.json({ accessToken });
      }
    );
  },
};

export default authService;
