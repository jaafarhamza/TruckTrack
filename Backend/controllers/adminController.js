import * as adminService from "../services/adminService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get all users

export const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Users retrieved successfully",
      {
        count: users.length,
        users,
      }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get user by ID

export const getUserById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);

    return successResponse(res, HTTP_STATUS.OK, "User retrieved successfully", {
      user,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update user role

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    const user = await adminService.updateUserRole(id, role);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "User role updated successfully",
      {
        user,
      }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Deactivate user account

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminService.deactivateUser(id, req.user.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "User account deactivated successfully",
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

// Activate user account

export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminService.activateUser(id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "User account activated successfully",
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

// Delete user

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await adminService.deleteUser(id, req.user.id);

    return successResponse(res, HTTP_STATUS.OK, "User deleted successfully", {
      deletedUser,
    });
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
