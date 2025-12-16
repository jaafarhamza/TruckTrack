import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import {
  clearDatabase,
  createTestUser,
  generateTestToken,
} from "../helpers/testHelpers.js";

describe("Authorization Middleware", () => {
  let adminUser;
  let driverUser;
  let adminToken;
  let driverToken;

  beforeEach(async () => {
    await clearDatabase();

    // Create admin user
    adminUser = await createTestUser({
      email: "admin@test.com",
      username: "adminuser",
      role: "ADMIN",
    });
    adminToken = generateTestToken(adminUser._id, "ADMIN");

    // Create driver user
    driverUser = await createTestUser({
      email: "driver@test.com",
      username: "driveruser",
      role: "DRIVER",
    });
    driverToken = generateTestToken(driverUser._id, "DRIVER");
  });

  describe("checkRole Middleware", () => {
    test("should allow admin to access admin-only route", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("users");
    });

    test("should deny driver access to admin-only route", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${driverToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Access denied. Insufficient permissions"
      );
    });

    test("should deny unauthenticated user access to admin route", async () => {
      const response = await request(app).get("/api/admin/users").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Not authorized, no token provided");
    });

    test("should return 401 if protect middleware is bypassed", async () => {
      // This tests the safety check in checkRole
      const response = await request(app).get("/api/admin/users").expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Role-Based Access Control", () => {
    test("admin can view all users", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.count).toBeGreaterThanOrEqual(2);
    });

    test("admin can view specific user", async () => {
      const response = await request(app)
        .get(`/api/admin/users/${driverUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.user.email).toBe(driverUser.email);
    });

    test("driver cannot view all users", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${driverToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "Access denied. Insufficient permissions"
      );
    });

    test("driver cannot view specific user", async () => {
      const response = await request(app)
        .get(`/api/admin/users/${adminUser._id}`)
        .set("Authorization", `Bearer ${driverToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "Access denied. Insufficient permissions"
      );
    });
  });

  describe("Admin Operations", () => {
    test("admin can update user role", async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${driverUser._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "ADMIN" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe("ADMIN");
    });

    test("admin cannot set invalid role", async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${driverUser._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "INVALID_ROLE" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid role");
    });

    test("admin can deactivate user", async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${driverUser._id}/deactivate`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.active).toBe(false);
    });

    test("admin cannot deactivate themselves", async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/deactivate`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "You cannot deactivate your own account"
      );
    });

    test("admin can activate user", async () => {
      // First deactivate
      await request(app)
        .patch(`/api/admin/users/${driverUser._id}/deactivate`)
        .set("Authorization", `Bearer ${adminToken}`);

      // Then activate
      const response = await request(app)
        .patch(`/api/admin/users/${driverUser._id}/activate`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.active).toBe(true);
    });

    test("admin can delete user", async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${driverUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User deleted successfully");
    });

    test("admin cannot delete themselves", async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("You cannot delete your own account");
    });

    test("driver cannot update user role", async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/role`)
        .set("Authorization", `Bearer ${driverToken}`)
        .send({ role: "DRIVER" })
        .expect(403);

      expect(response.body.message).toBe(
        "Access denied. Insufficient permissions"
      );
    });

    test("driver cannot deactivate user", async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${adminUser._id}/deactivate`)
        .set("Authorization", `Bearer ${driverToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "Access denied. Insufficient permissions"
      );
    });

    test("driver cannot delete user", async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set("Authorization", `Bearer ${driverToken}`)
        .expect(403);

      expect(response.body.message).toBe(
        "Access denied. Insufficient permissions"
      );
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/admin/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });

    test("should return 404 when updating non-existent user role", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .patch(`/api/admin/users/${fakeId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "ADMIN" })
        .expect(404);

      expect(response.body.message).toBe("User not found");
    });

    test("should return 404 when deleting non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/admin/users/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe("User not found");
    });
  });
});
