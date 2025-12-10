import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import { clearDatabase, mockUserData } from "../helpers/testHelpers.js";
import User from "../../models/User.js";

describe("POST /api/auth/register", () => {
  // Clear database before each test
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Successful Registration", () => {
    test("should register a new DRIVER user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(mockUserData.driver)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data.user.email).toBe(mockUserData.driver.email);
      expect(response.body.data.user.role).toBe("DRIVER");
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    test("should register a new ADMIN user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(mockUserData.admin)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("ADMIN");
      expect(response.body.data.user.email).toBe(mockUserData.admin.email);
    });

    test("should hash the password before saving", async () => {
      await request(app)
        .post("/api/auth/register")
        .send(mockUserData.driver)
        .expect(201);

      const user = await User.findOne({
        email: mockUserData.driver.email,
      }).select("+password");
      expect(user.password).not.toBe(mockUserData.driver.password);
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
    });

    test("should generate a valid JWT token", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(mockUserData.driver)
        .expect(201);

      expect(response.body.data.token).toBeDefined();
      expect(typeof response.body.data.token).toBe("string");
      expect(response.body.data.token.split(".")).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe("Validation Errors", () => {
    test("should fail with duplicate email", async () => {
      // Create first user
      await request(app).post("/api/auth/register").send(mockUserData.driver);

      // Try to create another user with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...mockUserData.driver,
          username: "differentuser",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Email already registered");
    });

    test("should fail with duplicate username", async () => {
      // Create first user
      await request(app).post("/api/auth/register").send(mockUserData.driver);

      // Try to create another user with same username
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...mockUserData.driver,
          email: "different@example.com",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Username already taken");
    });

    test("should fail with missing required fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          // Missing username, password, firstName, lastName
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors).toBeDefined();
    });

    test("should fail with invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...mockUserData.driver,
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    test("should fail with short username", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...mockUserData.driver,
          username: "ab", // Less than 3 characters
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    test("should fail with short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...mockUserData.driver,
          password: "12345", // Less than 6 characters
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    test("should succeed when ADMIN role without license", async () => {
      // Admin users don't need license, so we don't include it
      const response = await request(app)
        .post("/api/auth/register")
        .send(mockUserData.admin)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
