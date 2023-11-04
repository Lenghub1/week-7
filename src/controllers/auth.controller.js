import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import sendEmailWithNodemailer from "../utils/email.js";
import APIError from "../utils/APIError.js";

const signup = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, password } = req.body;
  console.log(email);

  const token = jwt.sign(
    { email, password, firstName, lastName },
    process.env.ACCOUNT_ACTIVATION_TOKEN,
    {
      expiresIn: process.env.ACCOUNT_ACTICATION_TOKEN_EXPIRES,
    }
  );

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

const account_activation = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(
      new APIError({
        status: 401,
        message: "Token is not defined! Please signup again.",
      })
    );
  }

  jwt.verify(
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
      res.json({
        message: "Account activated. Please log in to continue.",
        data: {
          user,
        },
      });
    }
  );
});

const login = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  // 1. Check if there is no user found in database or the password is incorrect
  if (!user || !(await user.verifyPassword(password))) {
    return next(
      new APIError({
        status: 400,
        message: "Email or password is incorrected.", // For more secure and prevent malicious from knowing which field they input wrong.
      })
    );
  }

  const role = user.role; // might be useful in future

  // 2. Sign access and refresh tokens
  const accessToken = jwt.sign(
    { _id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    }
  );
  const newRefreshToken = jwt.sign(
    { _id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    }
  );
  // 3. Create an array to store new refresh token
  let newRefreshTokenArray = [];
  if (cookies?.jwt)
    newRefreshTokenArray = user.refreshToken.filter(
      (rt) => rt !== cookies?.jwt
    );
  else if (!cookies?.jwt) newRefreshTokenArray = user.refreshToken;

  // 4. Detect refresh token reuse
  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const foundToken = await User.findOne({ refreshToken });

    // Detected refresh token is really reuse
    if (!foundToken) {
      // clear all previos refresh tokens
      newRefreshTokenArray = [];
    }

    // Not detected
    res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "None" });
  }

  // 5. Saving new refresh token
  user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await user.save();

  // 6. Create secure cookie with refresh token
  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: process.env.COOKIES_EXPIRES * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "login succeed.",
    role,
    accessToken,
  });
});

export const authController = { signup, account_activation, login };
