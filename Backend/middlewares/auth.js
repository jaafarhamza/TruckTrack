import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import User from "../models/User.js";
import { errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

//Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    //Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    //Check if token exists
    if (!token) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Not authorized, no token provided"
      );
    }

    try {
      //Verify token
      const decoded = jwt.verify(token, config.jwtSecret);

      //Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "User not found");
      }

      if (!user.active) {
        return errorResponse(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "User account is deactivated"
        );
      }

      //Attach user to request
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      return errorResponse(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Not authorized, token failed"
      );
    }
  } catch (error) {
    return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
  }
};
