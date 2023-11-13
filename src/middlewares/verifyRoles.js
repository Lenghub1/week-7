import APIError from "../utils/APIError.js";

const verifyRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new APIError({
          status: 403,
          message: "You do not have permission to perform this action.",
        })
      );
    }
    next();
  };
};

export default verifyRoles;
