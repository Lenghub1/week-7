import catchAsync from "../utils/catchAsync.js";
import userService from "../services/user.service.js";
import sendEmailWithNodemailer from "../utils/email.js";
import authController from "./auth.controller.js";

const userController = {
  // Get all users
  // 1. Get query
  // 2. Find all users
  // 3. Return users
  getAllUsers: catchAsync(async (req, res, next) => {
    const { query } = req;
    const users = await userService.getAll(query);
    return res.status(200).json({
      message: "Users retrieved.",
      users,
    });
  }),

  // Get one user
  // 1. Get user id from params
  // 2. Verify a user
  // 3. Return a user
  getOneUser: catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userService.getOne.verifyUser(next, userId);
    return res.status(200).json({
      message: "success!",
      data: user,
    });
  }),

  // Update first or last names
  // 1. Get user data
  // 2. Verify with db
  // 3. Update the name
  updateName: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await userService.updateName.verifyUserAndUpdate(
      req,
      next,
      data
    );
    return res.status(200).json({
      message: "Name successfully changed!",
      data: {
        user,
      },
    });
  }),

  // Confirm email before update
  // 1. Get current email and new email
  // 2. Get current user
  // 3. Verify new email. Make sure does not exist in db
  // 4. Generate OTP code
  // 5. Send email along the otp code
  confirmNewEmail: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await userService.updateEmail.verifyUser(next, data);
    const newEmail = await userService.updateEmail.verifyNewEmail(next, data);
    const OTP = await user.createOTPToken();
    await user.save({ validateBeforeSave: false });
    const emailData = await userService.updateEmail.createEmail(OTP, newEmail);
    const resultSendEmail = await sendEmailWithNodemailer(emailData);
    await userService.updateEmail.verifyResultSendEmail(next, resultSendEmail);
    return res.status(200).json({
      message: `We've sent a 6-digit verification code to your email (${newEmail}). Kindly check your inbox and confirm your email address by entering the code.`,
      data: {
        newEmail,
      },
    });
  }),

  // Update email
  // 1. Get current user
  // 2. Get new email
  // 3. Update new email
  updateEmail: catchAsync(async (req, res, next) => {
    const { user } = req;
    const data = req.body;
    const email = await userService.updateEmail.update(user, data);
    return res.status(201).json({
      message: "Email successfully updated!",
      data: {
        email,
      },
    });
  }),

  // Delete Account
  // 1. Get current user
  // 2. Clear cookie
  deleteAccount: catchAsync(async (req, res, next) => {
    const data = req.body;
    const { user } = req;
    await userService.deleteAccount.verifyPassword(next, data, user);
    await userService.deleteAccount.delete(user, data);
    authController.clearCookie(res);
    res.status(204).send(); // No Content
  }),

  // Log out one device
  // 1. Get session Id from request
  // 2. Find session in db and delete if exist
  // 3. Else Return error
  logOutOne: catchAsync(async (req, res, next) => {
    const data = req.params;
    const { user } = req;
    const session = await userService.logOutOne.verifySession(next, user, data);
    return res.status(200).json({
      message: `device ${session.deviceType} successfully loggd out!`,
    });
  }),

  // Update Password
  // 1. Get current password and new password
  // 2. Find user in data base
  // 3. Verify current password and Update new password
  // 4. Delete session and reauthenticate
  updatePassword: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await userService.updatePassword.getCurrentUser(req);
    await userService.updatePassword.verifyAndUpdatePassword(user, data, next);
    await userService.updatePassword.removeSession(user);
    req.user = user;
    return next();
  }),

  // Enable/Disable 2FA (User log in with email)
  // 1. Find User in database
  // 2. Compare password
  // 3. Enable/Disable 2FA (if password is correct)
  enable2FAByPassword: catchAsync(async (req, res, next) => {
    const data = req.body;
    const { action } = req.params;
    const user = await userService.enable2FA.verifyUser(req, next, action);
    await userService.enable2FA.verifyPassword(next, user, data);
    await userService.enable2FA.enable(user, action);
    return res.status(200).json({
      message: `2-Step-Verification successfully ${action}d!`,
    });
  }),

  // Enable/Disable 2FA by OTP (User log in with OAuth)
  // 1. Get action (enable/disable)
  // 2. Create OTP code
  // 3. Create email to send
  // 4. Send email along OTP
  // 5. Verify the result sending email
  enable2FAByOTP: catchAsync(async (req, res, next) => {
    const { action } = req.params;
    const user = await userService.enable2FA.verifyUser(req, next, action);
    const OTP = await user.createOTPToken();
    await user.save({ validateBeforeSave: false });
    const emailData = await userService.enable2FA.createEmail(OTP, user.email);
    const resultSendEmail = sendEmailWithNodemailer(emailData);
    await userService.enable2FA.confirmResultSendEmail(next, resultSendEmail);
    return res.status(201).json({
      message:
        "Please verify your OTP code that we have sent to your email address.",
      data: {
        email: user.email,
      },
    });
  }),

  // Enable 2FA
  // 1. get action (enable/disable)
  // 2. get user
  // 3. Start enable/disable 2FA
  enable2FA: catchAsync(async (req, res, next) => {
    const { action } = req.params;
    const { user } = req;
    await userService.enable2FA.enable(user, action);
    return res.status(200).json({
      message: `2-Step-Verification successfully ${action}d!`,
    });
  }),
};

export default userController;
