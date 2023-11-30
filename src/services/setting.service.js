import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Session from "../models/session.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const settingService = {
  updateName: {
    async verifyUserAndUpdate(req, next, data) {
      const { firstName, lastName } = data;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName },
        { new: true }
      );
      if (!user) {
        return next(new APIError({ status: 404, message: "User not found." }));
      }
      return user;
    },
  },

  getUserSessions: {
    async verifyUser(next, data) {
      const { userId } = data;
      const user = await User.findById(userId);
      if (!user) {
        return next(
          new APIError({
            status: 404,
            message: "User not found!",
          })
        );
      }
      return user;
    },
    async getSessions(user) {
      const sessions = await Session.find({ userId: user._id }).select(
        "-__v -refreshToken -accessToken"
      );
      return sessions;
    },
  },

  logOutOne: {
    async verifySession(next, user, data) {
      const { sessionId } = data;
      const session = await Session.findOneAndDelete({
        _id: sessionId,
        userId: user._id.toString(),
      });
      if (!session) {
        return next(
          new APIError({
            status: 404,
            message: "Device not found!",
          })
        );
      }
      return session;
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

    // Log out other devices.
    async removeSession(user) {
      await Session.deleteMany({ userId: user._id });
    },
  },

  enable2FA: {
    async verifyUser(req, next, action) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(
          new APIError({
            status: 404,
            message: "User not found!",
          })
        );
      } else if (user && user.enable2FA && action === "enable") {
        return next(
          new APIError({
            status: 400,
            message: "Your 2-Step-Verification is already enabled.",
          })
        );
      } else if (user && !user.enable2FA && action === "disable") {
        return next(
          new APIError({
            status: 400,
            message: "Your 2-Step-Verification is already disabled.",
          })
        );
      }
      return user;
    },

    async verifyPassword(next, user, data) {
      const { password } = data;
      if (
        user &&
        !(await user.verifyPassword(password)) &&
        user.signupMethod === "email"
      ) {
        return next(
          new APIError({
            status: 401,
            message: "Please double check your password and try again.",
          })
        );
      }
    },

    async createEmail(OTP, email) {
      const emailTemplate = await fs.promises.readFile(
        path.join(__dirname, "..", "emails", "twoFA.html"),
        "utf-8"
      );
      const emailData = {
        from: "Rukhak Team <noreply@rukhak.com>",
        to: email,
        subject: "Rukhak 2-Step Verification Code",
        html: emailTemplate.replaceAll("${OTP}", OTP),
      };
      return emailData;
    },

    confirmResultSendEmail(next, resultSendEmail) {
      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error!",
          })
        );
      }
    },

    async enable(user, action) {
      if (action === "enable") {
        user.enable2FA = true;
        await user.save();
      } else {
        user.enable2FA = false;
        await user.save();
      }
    },
  },
};

export default settingService;
