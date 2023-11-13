import catchAsync from "../utils/catchAsync.js";
import { promisify } from "util";
import APIError from "../utils/APIError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

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
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.ACCESS_TOKEN_SECRET
  );

  const currentUser = await User.findById({ _id: decoded.userId });

  if (!currentUser.active || !currentUser) {
    return next(
      new APIError({
        status: 401,
        message: "The user belonging to this token does no longer exist.",
      })
    );
  }

  req.user = currentUser;
  next();
});

export default isAuth;
