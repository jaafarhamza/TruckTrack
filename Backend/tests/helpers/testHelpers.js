import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "../../config/env.js";

// Clear all data from database collections

export const clearDatabase = async () => {
  await User.deleteMany({});
};

// Create a test user with specified data

export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    role: "DRIVER",
    firstName: "Test",
    lastName: "User",
    phone: "1234567890",
    license: "DL123456",
    active: true,
  };

  const user = await User.create({ ...defaultUser, ...userData });
  return user;
};

// Generate a valid JWT token for testing

export const generateTestToken = (userId, role = "DRIVER") => {
  return jwt.sign(
    {
      id: userId,
      username: "testuser",
      email: "test@example.com",
      role: role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

// Generate an expired JWT token for testing

export const generateExpiredToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
      username: "testuser",
      email: "test@example.com",
      role: "DRIVER",
    },
    config.jwtSecret,
    { expiresIn: "-1h" } // Expired 1 hour ago
  );
};

// Mock user data for registration

export const mockUserData = {
  admin: {
    username: "adminuser",
    email: "admin@example.com",
    password: "admin123",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
    phone: "9876543210",
  },
  driver: {
    username: "driveruser",
    email: "driver@example.com",
    password: "driver123",
    role: "DRIVER",
    firstName: "Driver",
    lastName: "User",
    phone: "5555555555",
    license: "DL987654",
  },
};
