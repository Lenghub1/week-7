import catchAsync from "../utils/catchAsync.js";
import settingService from "../services/setting.service.js";
import sendEmailWithNodemailer from "../utils/email.js";
import authController from "./auth.controller.js";

const settingController = {
  // Update first or last names
  // 1. Get user data
  // 2. Verify with db
  // 3. Update the name
  updateName: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await settingService.updateName.verifyUserAndUpdate(
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
    const user = await settingService.updateEmail.verifyUser(next, data);
    const newEmail = await settingService.updateEmail.verifyNewEmail(
      next,
      data
    );
    const OTP = await user.createOTPToken();
    await user.save({ validateBeforeSave: false });
    const emailData = await settingService.updateEmail.createEmail(
      OTP,
      newEmail
    );
    const resultSendEmail = await sendEmailWithNodemailer(emailData);
    await settingService.updateEmail.verifyResultSendEmail(
      next,
      resultSendEmail
    );
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
    const user = req.user;
    const data = req.body;
    const email = await settingService.updateEmail.update(user, data);
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
    const user = req.user;
    await settingService.deleteAccount.verifyPassword(next, data, user);
    await settingService.deleteAccount.delete(user, data);
    authController.clearCookie(res);
    res.status(204).send(); // No Content
  }),

  // Get user's sessions
  // 1. Get data
  // 2. Verify User
  // 3. Find session in db and return
  getUserSessions: catchAsync(async (req, res, next) => {
    const user = req.user;
    const sessions = await settingService.getUserSessions.getSessions(user);
    return res.status(200).json({
      message: "Sessions retrieved.",
      result: sessions.length,
      sessions,
    });
  }),

  // Log out one device
  // 1. Get session Id from request
  // 2. Find session in db and delete if exist
  // 3. Else Return error
  logOutOne: catchAsync(async (req, res, next) => {
    const data = req.params;
    const user = req.user;
    const session = await settingService.logOutOne.verifySession(
      next,
      user,
      data
    );
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
    const user = await settingService.updatePassword.getCurrentUser(req);
    await settingService.updatePassword.verifyAndUpdatePassword(
      user,
      data,
      next
    );
    await settingService.updatePassword.removeSession(user);
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
    const user = await settingService.enable2FA.verifyUser(req, next, action);
    await settingService.enable2FA.verifyPassword(next, user, data);
    await settingService.enable2FA.enable(user, action);
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
    const user = await settingService.enable2FA.verifyUser(req, next, action);
    const OTP = await user.createOTPToken();
    await user.save({ validateBeforeSave: false });
    const emailData = await settingService.enable2FA.createEmail(
      OTP,
      user.email
    );
    const resultSendEmail = sendEmailWithNodemailer(emailData);
    await settingService.enable2FA.confirmResultSendEmail(
      next,
      resultSendEmail
    );
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
    const user = req?.user;
    await settingService.enable2FA.enable(user, action);
    return res.status(200).json({
      message: `2-Step-Verification successfully ${action}d!`,
    });
  }),
};

export default settingController;
