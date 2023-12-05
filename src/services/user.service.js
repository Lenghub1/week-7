import User from "../models/user.model.js";
import APIError from "../utils/APIError.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Session from "../models/session.model.js";
import APIFeatures from "../utils/APIFeatures.js";
import utils from "../utils/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userService = {
  async getAll(query) {
    const features = new APIFeatures(User, query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();

    let users = await features.execute();
    users = users[0];

    if (!users)
      throw new APIError({
        status: 404,
        message: "There is no document found.",
      });

    users.metadata = utils.getPaginateMetadata(users.metadata, query);
    return users;
  },
  getOne: {
    async verifyUser(next, userId) {
      const user = await User.findById(userId).populate({ path: "sessions" });
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
  },
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

  updateEmail: {
    async verifyUser(next, data) {
      const { currentEmail } = data;
      const user = await User.findOne({ email: currentEmail });
      if (!user) {
        return next(
          new APIError({
            status: 401,
            message: "User not found!",
          })
        );
      }
      return user;
    },

    async verifyNewEmail(next, data) {
      const { email } = data;
      const newEmail = email;
      const userWithEmail = await User.findOne({ email: newEmail });
      if (userWithEmail) {
        return next(
          new APIError({
            status: 409, // Indicates a conflict
            message: "Email address is already in use by another user.",
          })
        );
      }
      return newEmail;
    },

    async createEmail(OTP, email) {
      const emailTemplate = await fs.promises.readFile(
        path.join(__dirname, "..", "emails", "updateEmail.html"),
        "utf-8"
      );
      const emailData = {
        from: "Rukhak Team <noreply@rukhak.com>",
        to: email,
        subject: "Rukhak, Confirm Email Address",
        html: emailTemplate.replaceAll("${OTP}", OTP),
      };
      return emailData;
    },

    verifyResultSendEmail(next, resultSendEmail) {
      if (!resultSendEmail) {
        return next(
          new APIError({
            status: 500,
            message: "Internal server error.",
          })
        );
      }
    },

    async update(user, data) {
      const { newEmail } = data;
      user.email = newEmail;
      await user.save();
      return newEmail;
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
        subject: "Rukhak, Enable 2-Step Verification",
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

  deleteAccount: {
    async verifyPassword(next, data, user) {
      const { password } = data;
      if (!(await user.verifyPassword(password))) {
        return next(
          new APIError({
            status: 400,
            message: "Password is incorrect!",
          })
        );
      }
    },

    async delete(user, data) {
      const { reasonDeleteAccount } = data;
      user.active = false;
      user.reasonDeleteAccount = reasonDeleteAccount;
      // We don't want to lost user's email and make it possible for user to sign up again
      const slugEmail = user.slugEmailBeforeDelete(user.email);
      user.email = slugEmail;
      await user.save({ validateBeforeSave: false });
      // Log out all devices
      await Session.deleteMany({ userId: user._id });
    },
  },
};

export default userService;
