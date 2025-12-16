import express from "express";
import { config } from "./config/env.js";
import { connectDB, isConnected } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import truckRoutes from "./routes/truckRoutes.js";
import trailerRoutes from "./routes/trailerRoutes.js";
import tireRoutes from "./routes/tireRoutes.js";
import fuelRoutes from "./routes/fuelRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import cors from "cors";
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Routes
app.get("/api", (req, res) => {
  res.json({
    message: "TruckTrack API is running",
    status: "success",
    database: isConnected() ? "connected" : "disconnected",
    environment: config.nodeEnv,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    database: isConnected() ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/trailers", trailerRoutes);
app.use("/api/tires", tireRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB(config.mongodbUri);

    // Start Express server
    app.listen(config.port, () => {
      // console.log(`Server running on port ${config.port}`);
      // console.log(`Environment: ${config.nodeEnv}`);
      // console.log(`API: http://localhost:${config.port}`);
    });
  } catch (error) {
    // console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// start the server if not in test environment
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
