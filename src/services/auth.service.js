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
      const activationLink = `${authService.setURL()}/auth/activate/${token}`;
      const emailData = {
        from: "RUKHAK TEAM <example@gmail.com>",
        to: email,
        subject: "Activate Your Account",
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f9f9f9;
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
    
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
    
                h1 {
                  color: #3498db;
                }
    
                p {
                  font-size: 16px;
                  line-height: 1.5;
                  color: #555;
                }
    
                .activation-link {
                  margin-top: 20px;
                  background-color: #3498db;
                  color: #fff;
                  padding: 10px;
                  border-radius: 5px;
                  text-align: center;
                  font-size: 18px;
                }
    
                .note {
                  margin-top: 20px;
                  font-size: 14px;
                  color: #777;
                }
    
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #777;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Activate Your Account</h1>
    
                <p>Hello</p>
    
                <p>Welcome to RUKHAK TEAM! To get started, please click <strong>Continue</strong> to activate your account:</p>
    
                <div class="activation-link">
                  <a href="${activationLink}" style="color: #fff; text-decoration: none;">Continue</a>
                </div>
    
                <p>If you didn't make this request, you can ignore this email.</p>
    
                <div class="note">
                  <p><strong>Note:</strong> This link will expire in 10 minutes for security reasons.</p>
                </div>
    
                <p>Thank You,<br>RUKHAK TEAM</p>
    
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} RUKHAK TEAM. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
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
      if (!user || !(await user.verifyPassword(password))) {
        return next(
          new APIError({
            status: 400,
            message: "Email or password is incorrected.", // For more secure and prevent malicious from knowing which field they input wrong.
          })
        );
      } else if (user && user.active === false) {
        return next(
          APIError({
            status: 401,
            message: "Please sign up first!",
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
      return cookies?.jwt;
    },

    async verifySession(next, cookieRefreshToken) {
      const session = await Session.findOne({
        refreshToken: cookieRefreshToken,
      });

      // Detected refresh token reuse! (Found the JWT from cookie but not found the session in db)
      if (!session) {
        return jwt.verify(
          cookieRefreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          async (err, decoded) => {
            if (err) return next(new APIError({ status: 403 })); // Forbidden
            // Required all devices with cuurent user's id to log in again!
            await Session.deleteMany({ userId: decoded.userId });
            return next(new APIError({ status: 403 }));
          }
        );
      }
      return session;
    },

    verifyRefreshToken(next, cookieRefreshToken, session) {
      return jwt.verify(
        cookieRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          // error means refresh token may expired (required to log in again )
          if (err || session.userId.toString() !== decoded.userId) {
            await session.deleteOne();
            return next(new APIError({ status: 403 }));
          }

          const userId = decoded.userId;
          const accessToken = authService.signAccessToken(userId);
          const refreshToken = authService.signRefreshToken(userId);
          session.accessToken = accessToken;
          session.refreshToken = refreshToken;
          await session.save();
          const data = { accessToken, refreshToken };
          return data;
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
      const resetLink = `${authService.setURL()}/auth/reset-password/${resetToken}`;
      const emailData = {
        from: "RUKHAK TEAM <example@gmail.com>",
        to: email,
        subject: "Password Reset Request",
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f9f9f9;
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
    
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
    
                h1 {
                  color: #3498db;
                }
    
                p {
                  font-size: 16px;
                  line-height: 1.5;
                  color: #555;
                }
    
                .reset-link {
                  margin-top: 20px;
                  background-color: #3498db;
                  color: #fff;
                  padding: 10px;
                  border-radius: 5px;
                  text-align: center;
                  font-size: 18px;
                }
    
                .note {
                  margin-top: 20px;
                  font-size: 14px;
                  color: #777;
                }
    
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #777;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Password Reset Request</h1>
    
                <p>Hello</p>
    
                <p>We received a request to reset your password. If you made this request, please use the link below to reset your password:</p>
    
                <div class="reset-link">
                  <a href="${resetLink}" style="color: #fff; text-decoration: none;">Reset Password</a>
                </div>
    
                <p>If you didn't make this request, you can ignore this email.</p>
    
                <div class="note">
                  <p><strong>Note:</strong> This link will expire in 10 minutes for security reasons.</p>
                </div>
    
                <p>Thank You,<br>RUKHAK TEAM</p>
    
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} RUKHAK TEAM. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
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
  twoFA: {
    createEmail(email, OTP) {
      const emailData = {
        from: "Rukhak Team <noreply@rukhak.com>",
        to: email,
        subject: "Rukhak 2-Step Verification Code",
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f9f9f9;
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
    
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
    
                h1 {
                  color: #3498db;
                }
    
                p {
                  font-size: 16px;
                  line-height: 1.5;
                  color: #555;
                }
    
                .otp-container {
                  margin-top: 20px;
                  padding: 10px;
                  font-weight: 800;
                  text-align: center;
                  font-size: 20px;
                }
    
                .important-note {
                  margin-top: 20px;
                  color: #fff;
                  padding: 10px;
                  border-radius: 5px;
                }
    
                .footer {
                  margin-top: 20px;
                  text-align: center;
                  color: #777;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Rukhak 2-Step Verification Code</h1>
    
                <p>Hello</p>
    
                <p><strong>${OTP}</strong> is your Rukahk 2-Step Verification code.</p>
    
                <p>Enter the above code into the 2-Step Verification screen to finish logging in. This code will expire in 10 minutes.</p>
    
                <div class="otp-container">
                  ${OTP}
                </div>
    
                <div class="important-note">
                  <p><strong>IMPORTANT:</strong> Don't share your security codes with anyone. Rukhak will never ask you for your codes. This can include things like texting your code, screensharing, etc. By sharing your security codes with someone else, you are putting your account and its content at high risk.</p>
                </div>
    
                <p>Thank You,<br>The Rukhak Team</p>
    
                <p><strong>Do not reply to this email directly.</strong> You are receiving this email because there was a Rukhak login attempt from a new browser or device. If you did not make this request, you are strongly advised to change your password.</p>
    
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Rukhak Corporation. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
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
    checkJWT(res, cookies) {
      if (!cookies?.jwt) return res.status(204); // No Content
      return cookies.jwt;
    },

    async verifySession(res, refreshToken) {
      const session = await Session.findOneAndDelete({ refreshToken });
      if (!session) {
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
      }
    },
  },
};

export default authService;
