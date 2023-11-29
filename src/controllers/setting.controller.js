import catchAsync from "../utils/catchAsync.js";
import settingService from "../services/setting.service.js";
import sendEmailWithNodemailer from "../utils/email.js";

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

  createNewAddress: catchAsync(async (req, res, next) => {
    const data = req.body;
    const user = await settingService.address.verifyUser(req, next);
    const address = await settingService.address.createAddress(
      next,
      user,
      data
    );
    return res.status(201).json({
      message: "Address successfully created!",
      data: {
        address,
      },
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
