import User from "../models/User.js";
import CustomError from "../utils/CustomError.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get all users

export const getAllUsers = async () => {
  const users = await User.find().select("-password");
  return users;
};

// Get user by ID

export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

// Update user role

export const updateUserRole = async (userId, newRole) => {
  // Validate role
  if (!["ADMIN", "DRIVER"].includes(newRole)) {
    throw new CustomError(
      "Invalid role. Must be ADMIN or DRIVER",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

// Deactivate user account

export const deactivateUser = async (userId, currentUserId) => {
    // not allow admin to deactivate himself
  if (userId.toString() === currentUserId.toString()) {
    throw new CustomError(
      "You cannot deactivate your own account",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { active: false },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

// Activate user account

export const activateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { active: true },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};

// Delete user

export const deleteUser = async (userId, currentUserId) => {
  // not allow admin to delete himself
  if (userId.toString() === currentUserId.toString()) {
    throw new CustomError(
      "You cannot delete your own account",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return {
    id: user._id,
    email: user.email,
    username: user.username,
  };
};
