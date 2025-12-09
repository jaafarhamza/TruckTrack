import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,

  // Database Configuration
  mongodbUri: process.env.MONGODB_URI,

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE,
};
