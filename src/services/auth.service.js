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
      return jwt
        .sign({ email }, process.env.ACCOUNT_ACTIVATION_TOKEN, {
          expiresIn: process.env.ACCOUNT_ACTICATION_TOKEN_EXPIRES,
        })
        .replaceAll(".", "RUKHAK2023"); // Prevent page not found on client side.
    },

    async createNewUser(next, resultSendEmail, data) {
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
        active: false, // Account not yet activate
      });

      return user;
    },

    createEmail(token, data) {
      const { email } = data;
      const emailData = {
        from: "RUKHAK TEAM <example@gmail.com>",
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

    verifyResult(next, resultSendEmail) {
      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error.",
          })
        );
      }
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
      if (user && user.active === false) {
        return next(
          APIError({
            status: 401,
            message: "Please sign up first!",
          })
        );
      }

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
  googleSignIn: {
    verifyIdToken(next, client, data) {
      const { credential } = data;
      return client
        .verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        })
        .then(async (response) => {
          const { email_verified, given_name, family_name, email } =
            response.payload;
          if (email_verified) {
            const user = await User.findOne({ email });
            if (user) {
              return user;
            }
            const newUser = new User({
              firstName: given_name,
              lastName: family_name,
              email,
              active: true,
              signupMethod: "google",
            });
            await newUser.save({ validateBeforeSave: false });

            return newUser;
          }
          return next(
            new APIError({
              status: 400,
              message:
                "Google login failed. Please try again later or choose another method.",
            })
          );
        });
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

      const refreshToken = cookies?.jwt;
      return refreshToken;
    },

    async verifySession(refreshToken, next) {
      const session = await Session.findOne({ refreshToken });
      if (!session) {
        return next({
          status: 403, // Forbidden
        });
      }
      return session;
    },

    verifyRefreshToken(next, refreshToken, session) {
      return jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || session.userId.toString() !== decoded.userId)
            return next(new APIError({ status: 403 }));
          const userId = decoded.userId;
          const accessToken = authService.signAccessToken(userId);
          return accessToken;
        }
      );
    },
  },
  signupSeller: {
    async verifyUserById(req, next) {
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

    async createSeller(sellerData, user) {
      const {
        storeName,
        storeAddress,
        phoneNumber,
        storeLocation,
        dateOfBirth,
      } = sellerData;
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
        dateOfBirth,
      });
      await User.findByIdAndRemove(user.id);
      await seller.save();

      return seller;
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

    async updateSellerStatus(seller, action) {
      if (action === "approve") {
        seller.sellerStatus = "active";
        await seller.save();
      } else {
        seller.sellerStatus = "inactive";
        seller.role = "user";
        await seller.save();
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
        from: "RUKHAK TEAM <example@gmail.com>",
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

    verifyResult(next, resultSendEmail) {
      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error. Unable to send email.",
          })
        );
      }
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

    async createNewPassword(data, user) {
      const { newPassword } = data;
      user.password = newPassword;
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpires = undefined;
      await user.save();
    },
  },
  updatePassword: {
    async getCurrentUser(req) {
      const user = await User.findById(req.user._id);
      return user;
    },

    async verifyAndUpdatePassword(user, data, next) {
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
    },

    async removeSession(user) {
      await Session.deleteMany({ userId: user._id });
    },
  },
  enable2FA: {
    async verifyUserEnable2FA(req, next, data) {
      const { password } = data;
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(
          new APIError({
            status: 404,
            message: "User not found.",
          })
        );
      } else if (user && user.enable2FA) {
        return next(
          new APIError({
            status: 400,
            message: "User already enabled 2FA.",
          })
        );
      } else if (user && !(await user.verifyPassword(password))) {
        return next(
          new APIError({
            status: 401,
            message: "Please double check your password and try again.",
          })
        );
      }

      return user;
    },

    async enable(user) {
      user.enable2FA = true;
      await user.save();
    },
  },
  disable2FA: {
    async verifyUserDisable2FA(req, next, data) {
      const { password } = data;
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(
          new APIError({
            status: 404,
            message: "User not found.",
          })
        );
      } else if (user && !user.enable2FA) {
        return next(
          new APIError({
            status: 400,
            message: "2FA already disable.",
          })
        );
      } else if (user && !(await user.verifyPassword(password))) {
        return next(
          new APIError({
            status: 401,
            message: "Please double check your password and try again.",
          })
        );
      }

      return user;
    },

    async disable(user) {
      user.enable2FA = false;
      await user.save();
    },
  },
  twoFA: {
    createEmail(email, OTP) {
      const emailData = {
        from: "RUKHAK TEAM <example@gmail.com>",
        to: email,
        subject: "2 Step Verification",
        html: `<h1>Please use numbers below to continue to the app:</h1>
                <p>${OTP}</p>`,
      };
      return emailData;
    },

    verifyResult(next, resultSendEmail) {
      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error.",
          })
        );
      }
    },
  },
  logOut: {
    checkJWT(next, cookies) {
      if (!cookies?.jwt)
        return next(
          new APIError({
            status: 401,
          })
        );
      return cookies.jwt;
    },

    async clearCookieLogOut(res, next, refreshToken) {
      const session = await Session.findOneAndDelete({ refreshToken });
      if (session) {
        console.log(session);
        console.log("JKKKKKKK");
        res.clearCookie("jwt");
      }
    },
  },
};

export default authService;
