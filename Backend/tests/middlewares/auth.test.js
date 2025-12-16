import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import {
  clearDatabase,
  createTestUser,
  generateTestToken,
  generateExpiredToken,
} from "../helpers/testHelpers.js";

describe("JWT Authentication Middleware", () => {
  let testUser;
  let validToken;

  // Setup before each test
  beforeEach(async () => {
    await clearDatabase();

    // Create a test user
    testUser = await createTestUser({
      email: "middleware@example.com",
      username: "middlewareuser",
    });

    // Generate a valid token
    validToken = generateTestToken(testUser._id, testUser.role);
  });

  describe("Valid Token", () => {
    test("should allow access with valid JWT token", async () => {
      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Profile retrieved successfully");
      expect(response.body.data.user).toBeDefined();
    });

    test("should attach user data to request object", async () => {
      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.data.user._id).toBe(testUser._id.toString());
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.username).toBe(testUser.username);
    });

    test("should not return password in user data", async () => {
      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.data.user).not.toHaveProperty("password");
    });
  });

  describe("Missing Token", () => {
    test("should fail when no Authorization header is provided", async () => {
      const response = await request(app).get("/api/auth/profil").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not authorized, no token provided");
    });

    test("should fail when Authorization header is empty", async () => {
      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", "")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not authorized, no token provided");
    });

    test("should fail when Bearer prefix is missing", async () => {
      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", validToken)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not authorized, no token provided");
    });
  });

  describe("Invalid Token", () => {
    test("should fail with malformed token", async () => {
      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not authorized, token failed");
    });

    test("should fail with completely invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", "Bearer invalidtoken")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not authorized, token failed");
    });

    test("should fail with expired token", async () => {
      const expiredToken = generateExpiredToken(testUser._id);

      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not authorized, token failed");
    });
  });

  describe("User Validation", () => {
    test("should fail when user does not exist", async () => {
      // Generate token with non-existent user ID
      const fakeUserId = "507f1f77bcf86cd799439011";
      const fakeToken = generateTestToken(fakeUserId);

      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", `Bearer ${fakeToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });

    test("should fail when user account is deactivated", async () => {
      // Deactivate the user
      testUser.active = false;
      await testUser.save();

      const response = await request(app)
        .get("/api/auth/profil")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User account is deactivated");
    });
  });
});
