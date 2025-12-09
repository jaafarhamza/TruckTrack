import User from "../models/User.js";
import CustomError from "../utils/CustomError.js";
import { HTTP_STATUS } from "../utils/constants.js";

//Register a new user
export const registerUser = async (userData) => {
  const {
    username,
    email,
    password,
    role,
    lastName,
    firstName,
    phone,
    license,
  } = userData;

  //Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new CustomError(
      existingUser.email === email
        ? "Email already registered"
        : "Username already taken",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  //Create user
  const user = await User.create({
    username,
    email,
    password,
    role,
    lastName,
    firstName,
    phone,
    license,
  });

  //Generate token
  const token = user.generateToken();

  //Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

//Login user
export const loginUser = async (email, password) => {
  //Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new CustomError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  //Check if user is active
  if (!user.active) {
    throw new CustomError("Account is deactivated", HTTP_STATUS.UNAUTHORIZED);
  }

  //Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new CustomError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  //Generate token
  const token = user.generateToken();

  //Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return { user: userResponse, token };
};

//Get user by ID
export const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new CustomError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return user;
};
