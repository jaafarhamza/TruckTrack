import { errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS, USER_ROLES } from "../utils/constants.js";

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Verify user is authenticated
    if (!req.user) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Not authenticated. Please login first"
      );
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        HTTP_STATUS.FORBIDDEN,
        "Access denied. Insufficient permissions"
      );
    }

    next();
  };
};
// check if user is an admin

export const isAdmin = checkRole([USER_ROLES.ADMIN]);

// check if user is a driver
export const isDriver = checkRole([USER_ROLES.DRIVER]);
