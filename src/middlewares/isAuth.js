import catchAsync from "../utils/catchAsync.js";
import { promisify } from "util";
import APIError from "../utils/APIError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startWith("Bearer ")) {
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
  console.log(decoded);
  const currentUser = User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new APIError({
        status: 401,
        message: "The user belonging to this tokenn does no longer exist.",
      })
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new APIError({
        status: 401,
        message: "User recently changed password! Please log in again.",
      })
    );
  }

  req.user = currentUser;
  next();
});

export default isAuth;
