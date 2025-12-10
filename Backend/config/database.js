import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
  try {
    // Mongoose connection options
    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoUri, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // Setup event handlers
    setupEventHandlers();
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

const setupEventHandlers = () => {
  const db = mongoose.connection;

  // Connection events
  db.on("connected", () => {
    // console.log("Mongoose connected to MongoDB");
  });

  db.on("error", (err) => {
    // console.error("Mongoose connection error:", err);
  });

  db.on("disconnected", () => {
    // console.log("Mongoose disconnected from MongoDB");
  });

  process.on("SIGINT", async () => {
    await disconnectDB();
    process.exit(0);
  });

  process.once("SIGUSR2", async () => {
    await disconnectDB();
    process.kill(process.pid, "SIGUSR2");
  });
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    // console.log("MongoDB connection closed gracefully");
  } catch (error) {
    // console.error("Error closing MongoDB connection:", error.message);
  }
};

export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

export const getConnection = () => {
  return mongoose.connection;
};
