import * as authService from "../services/authService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "User registered successfully",
      result
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    return successResponse(res, HTTP_STATUS.OK, "Login successful", result);
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

export const getProfil = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Profile retrieved successfully",
      { user }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
