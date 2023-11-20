import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import Seller from "../models/seller.model.js";
import APIError from "../utils/APIError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const authService = {
  localHost: process.env.CLIENT_URL,

  productionURL: process.env.PRODUCTION_URL,

  setURL() {
    return (this.URL = this.productionURL || this.localHost);
  },

  signAccessToken(userId) {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });
  },

  signRefreshToken(userId) {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });
  },

  signup: {
    async signTokenForActivateAccount(data) {
      const { email } = data;

      return jwt.sign({ email }, process.env.ACCOUNT_ACTIVATION_TOKEN, {
        expiresIn: process.env.ACCOUNT_ACTICATION_TOKEN_EXPIRES,
      });
      // .replaceAll(".", "RUKHAK2023"); // Prevent page not found on client side.
    },

    async createNewUser(res, next, resultSendEmail, data) {
      const { email, password, firstName, lastName } = data;

      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error",
          })
        );
      }
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        active: false,
      });
      res.status(201).json({
        message: "Please Check your email to activate your rukhak account.",
        data: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    },

    createEmail(token, data) {
      const { email } = data;
      const emailData = {
        to: email,
        subject: "Activate Account",
        html: `<h1>Please use the following link to activate your account</h1>
        <p>Please reject this email, if you not request</p>
          <p>${authService.setURL()}/auth/activate/${token}</p>
          <hr />
          <p>This email may contain sensitive information</p>
          <p>${authService.setURL()}</p>`,
      };
      return emailData;
    },

    respondResendEmail(res, next, resultSendEmail) {
      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error.",
          })
        );
      }
      res.status(200).json({
        message: "Email successfully resend.",
      });
    },

    activateAccount(next, data) {
      const { token } = data;
      if (!token) {
        return next(
          new APIError({
            status: 401,
            message: "Token is undefined! Please signup again.",
          })
        );
      }
      return jwt.verify(
        token,
        process.env.ACCOUNT_ACTIVATION_TOKEN,
        async (err, decoded) => {
          if (err) {
            return next(
              new APIError({
                status: 401,
                message: "Link Expired! Please signup again",
              })
            );
          }

          const { email } = decoded;

          if (!email) {
            return next(
              new APIError({
                status: 401,
                message:
                  "Please sign up again! Make sure to fill in all required information.",
              })
            );
          }

          const user = await User.findOne({ email });

          if (!user) {
            return next(
              new APIError({
                status: 410,
                message: "Account activation expired. Please sign up again.",
              })
            );
          }

          user.active = true;
          await user.save();

          return user;
        }
      );
    },
  },

  login: {
    async verifyUserByEmailAndPassword(data, next) {
      const { email, password } = data;
      const user = await User.findOne({ email });
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
  },

  refreshToken: {
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

    verifyRefreshToken(res, next, refreshToken, session) {
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

          const accessToken = authService.signAccessToken(decoded.userId);
          session.accessToken = accessToken;
          await session.save();

          res.json({ accessToken });
        }
      );
    },
  },

  signupSeller: {
    async verifyUserById(req, res, next) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(
          new APIError({
            status: 404,
            message: "User does not exist.",
          })
        );
      }
      return user;
    },

    async createSeller(req, res, sellerData, user) {
      const { storeName, storeAddress, phoneNumber, storeLocation } =
        sellerData;
      user.role = "seller";
      const seller = new Seller({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: user.role,
        storeName,
        storeAddress,
        phoneNumber,
        storeLocation,
      });
      await User.findByIdAndRemove(user.id);
      await seller.save();
      res.status(200).json({
        message: "Signup as seller succeed.",
        data: {
          id: seller._id,
          firstName: seller.firstName,
          lastName: seller.lastName,
          email: seller.email,
          role: seller.role,
          sellerStatus: seller.sellerStatus,
          storeName: seller.storeName,
          storeAddress: seller.storeAddress,
          storeLocation: seller.storeLocation,
        },
      });
    },

    async verifySeller(sellerId, next) {
      const seller = await User.findById(sellerId);
      if (!seller) {
        next(
          new APIError({
            status: 404,
            message: `Document Not Found: User id ${sellerId}, does not exist in data base.`,
          })
        );
      }
      return seller;
    },

    async updateSellerStatus(req, res, next, seller, action) {
      if (action === "approve") {
        seller.sellerStatus = "active";
        await seller.save();
        res.status(201).json({
          message: "Seller status approved successfully.",
          data: {
            sellerStatus: seller.sellerStatus,
          },
        });
      } else {
        seller.sellerStatus = "inactive";
        seller.role = "user";
        await seller.save();
        res.status(201).json({
          message: "Seller status rejected!",
          data: {
            sellerStatus: seller.sellerStatus,
          },
        });
      }
    },
  },

  forgotPassword: {
    async verifyUserByEmail(next, data) {
      const { email } = data;
      const user = await User.findOne({ email });
      if (!user) {
        return next(
          new APIError({
            status: 404,
            message: "Email does not exist.",
          })
        );
      }
      return user;
    },

    createEmail(data, resetToken) {
      const { email } = data;
      const emailData = {
        to: email,
        subject: "Reset Password",
        html: `<h1>Please use the following link to reset your password.</h1>
          <p>${authService.setURL()}/auth/reset-password/${resetToken}</p>
          <hr />
          <p>Please reject this email, if you not request to reset password.</p>
          <p>${authService.setURL()}</p>`,
      };
      return emailData;
    },

    respondSendEmail(res, next, resultSendEmail) {
      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error. Unable to send email.",
          })
        );
      }
      res.status(200).json({
        message: "Please check your email to reset your password.",
      });
    },

    hashToken(data) {
      const { resetToken } = data;
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      return hashedToken;
    },

    async verifyUserByToken(hashedToken, next) {
      const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpires = undefined;
        await user.save();
        return next(
          new APIError({
            status: 400,
            message: "Token is invalid or has expired, Please request again.",
          })
        );
      }

      return user;
    },

    async createNewPassword(res, data, user) {
      const { newPassword } = data;
      user.password = newPassword;
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpires = undefined;
      await user.save();
      res.status(201).json({
        message: "Password has been reseted.",
      });
    },
  },

  updatePassword: {
    async getCurrentUser(req) {
      const user = await User.findById(req.user._id);
      return user;
    },

    async verifyAndUpdatePassword(res, user, data, next) {
      const { currentPassword, newPassword } = data;
      if (!(await user.verifyPassword(currentPassword))) {
        return next(
          new APIError({
            status: 401,
            message: "Your current password is incorrect.",
          })
        );
      }
      user.password = newPassword;
      await user.save();
      res.status(201).json({
        message: "Password has been updated.",
      });
    },
  },

  logOut: {
    checkJWT(req, res, next, cookies) {
      if (!cookies?.jwt)
        return next(
          new APIError({
            status: 204, // No content
          })
        );
      return cookies.jwt;
    },

    async clearCookieLogOut(req, res, next, refreshToken) {
      const session = await Session.findOne({ refreshToken });
      if (!session) {
        res.clearCookie("jwt", {
          httpOnly: true,
          samSite: "None",
          secure: true,
        });
        return next(
          new APIError({
            status: 204, // No content
          })
        );
      }

      await Session.findOneAndRemove({ refreshToken });

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      res.status(204);
    },
  },
};

export default authService;
