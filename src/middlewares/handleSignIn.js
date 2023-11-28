import catchAsync from "../utils/catchAsync.js";
import Session from "../models/session.model.js";
import authService from "../services/auth.service.js";
import axios from "axios";
import dotenv from "dotenv";
import authController from "../controllers/auth.controller.js";

dotenv.config();

// Handle sign in
// 1. Get cookie
// 2. Get devices data
// 3. Get IP address from request
// 4. Search for location, coordinates base on IP address
// 5. Sign access and refresh tokens
// 6. Clear cookie if it exist
// 7. Save new session to database
// 8. Create secure cookie with refresh token
// 9. Send authorization access token to client
const handleSignIn = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  const { deviceType, deviceName } = req.body;

  const clientIp =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress ||
    "";
  let address;
  let coordinates;
  const response = await axios.get(
    `https://ipinfo.io/${clientIp}/json?token=${process.env.IPINFO_TOKEN}`
  );
  const location = response.data;
  if (location.region && location.country && location.loc) {
    address = `${location.region}, ${location.country}`;
    coordinates = location.loc.split(",").map((element) => Number(element));
  } else {
    address = "Unlocated";
    coordinates = [0, 0];
  }

  const accessToken = authService.signAccessToken(req.user._id);
  const newRefreshToken = authService.signRefreshToken(req.user._id);
  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const session = await Session.findOne({ refreshToken });

    // Detected refresh token reuse!
    if (!session) {
      // clear out ALL sessions
      await Session.deleteMany({ userId: req.user._id });
    }

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  }
  await Session.create({
    userId: req.user._id,
    accessToken,
    refreshToken: newRefreshToken,
    loginAt: Date.now(),
    deviceName,
    deviceType,
    deviceLocation: {
      coordinates,
      address,
    },
  });
  authController.signCookie(res, newRefreshToken);
  res.status(200).json({
    message: "Login succeed.",
    data: {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      signupMethod: req.user.signupMethod,
      accessToken,
    },
  });
});

export default handleSignIn;
