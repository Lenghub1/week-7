import catchAsync from "../../utils/catchAsync.js";
import APIError from "../../utils/APIError.js";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";

// Verify user login
// 1. Receive header request.
// 2. Check for token.
// 3. Find session in database
// 4. Find user with the id
const isAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new APIError({
        status: 401,
        message: "You are not logged in! Please log in to get access",
      })
    );
  }

  const token = authHeader.split(" ")[1];
  const session = await Session.findOne({ accessToken: token });
  if (!session) {
    return next(
      new APIError({
        status: 401,
        message: "Session expired! Please log in again.",
      })
    );
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.status(403).send(); // invalid token
    const currentUser = await User.findById(decoded.userId);

    if (!currentUser || currentUser.active === false) {
      return next(
        new APIError({
          status: 401,
          message: "The user belonging to this token does no longer exist.",
        })
      );
    }

    req.user = currentUser;
    return next();
  });
});

export default isAuth;
