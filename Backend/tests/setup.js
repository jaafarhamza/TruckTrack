import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";

// test environment variables
dotenv.config({ path: ".env" });

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    console.log("✓ Test database connected");
  } catch (error) {
    console.error("Failed to setup test database:", error);
    throw error;
  }
}, 60000);

// Clean up after each test
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error("Failed to clean up after test:", error);
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    // Disconnect from database
    await mongoose.disconnect();

    // Stop in-memory MongoDB instance
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log("✓ Test database disconnected");
  } catch (error) {
    console.error("Failed to cleanup test database:", error);
  }
});
