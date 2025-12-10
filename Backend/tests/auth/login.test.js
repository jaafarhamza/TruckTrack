import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import {
  clearDatabase,
  createTestUser,
  mockUserData,
} from "../helpers/testHelpers.js";

describe("POST /api/auth/login", () => {
  // Clear database before each test
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Successful Login", () => {
    test("should login with valid credentials", async () => {
      // Create a user first "Arrange"
      await request(app).post("/api/auth/register").send(mockUserData.driver);

      // Login with the user "Act"
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: mockUserData.driver.email,
          password: mockUserData.driver.password,
        })
        .expect(200);
      // "Assert"
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user.email).toBe(mockUserData.driver.email);
    });

    test("should return JWT token on successful login", async () => {
      // Create a user first "Arrange"
      await request(app).post("/api/auth/register").send(mockUserData.driver);

      // Login "Act"
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: mockUserData.driver.email,
          password: mockUserData.driver.password,
        })
        .expect(200);

      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe("string");
      expect(response.body.data.token.split(".")).toHaveLength(3);
    });

    test("should not return password in response", async () => {
      // Create a user first "Arrange"
      await request(app).post("/api/auth/register").send(mockUserData.driver);

      // Login "Act"
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: mockUserData.driver.email,
          password: mockUserData.driver.password,
        })
        .expect(200);

      expect(response.body.data.user).not.toHaveProperty("password");
    });
  });

  describe("Login Failures", () => {
    test("should fail with non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    test("should fail with incorrect password", async () => {
      // Create a user first
      await request(app).post("/api/auth/register").send(mockUserData.driver);

      // Try to login with wrong password
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: mockUserData.driver.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });

    test("should fail when user account is inactive", async () => {
      // Create an inactive user
      await createTestUser({
        email: "inactive@example.com",
        username: "inactiveuser",
        password: "password123",
        active: false,
      });

      // Try to login
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "inactive@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Account is deactivated");
    });

    test("should fail with missing email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          password: "password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    test("should fail with missing password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    test("should fail with invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });
  });
});
