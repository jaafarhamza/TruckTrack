import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database Configuration
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/trucktrack",

  // JWT Configuration
  jwtSecret:
    process.env.JWT_SECRET || "default-secret-key",
  jwtExpire: process.env.JWT_EXPIRE || "24h",
};
