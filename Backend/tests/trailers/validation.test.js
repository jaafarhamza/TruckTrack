import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import { createTestUser, generateTestToken } from "../helpers/testHelpers.js";

describe("Trailer Validation Tests", () => {
  let adminToken;

  beforeEach(async () => {
    const adminUser = await createTestUser({
      username: "admin",
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN",
      firstName: "Admin",
      lastName: "User",
      active: true,
    });
    adminToken = generateTestToken(adminUser._id, "ADMIN");
  });

  describe("Create Trailer Validation", () => {
    test("should fail without plate number", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid plate number format", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL@123!",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without type", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid type", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "INVALID_TYPE",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without brand", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with brand too short", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "G",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with brand too long", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "A".repeat(51),
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without model", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid year (too old)", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 1899,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid year (too far in future)", async () => {
      const futureYear = new Date().getFullYear() + 2;
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: futureYear,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid status", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          status: "INVALID_STATUS",
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without load capacity", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative load capacity", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: -5000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without length", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with zero or negative length", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 0,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without width", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without height", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without purchase date", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid purchase date format", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "invalid-date",
          purchasePrice: 45000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without purchase price", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative purchase price", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: -50000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with color too long", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
          color: "A".repeat(31),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid axles (too few)", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
          axles: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid axles (too many)", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
          axles: 6,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative tare weight", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
          tareWeight: -1000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should accept valid trailer with all optional fields", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-123",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          status: "AVAILABLE",
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: "2022-01-01",
          purchasePrice: 45000,
          color: "White",
          serialNumber: "GD123456789",
          axles: 2,
          tareWeight: 5000,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test("should accept valid trailer with only required fields", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "MINIMAL-123",
          type: "REFRIGERATED",
          brand: "Utility",
          model: "3000R",
          year: 2023,
          loadCapacity: 20000,
          length: 13.6,
          width: 2.5,
          height: 2.7,
          purchaseDate: "2023-01-01",
          purchasePrice: 55000,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trailer.status).toBe("AVAILABLE");
      expect(response.body.data.trailer.axles).toBe(2);
    });
  });

  describe("Query Parameter Validation", () => {
    test("should fail with invalid page number", async () => {
      const response = await request(app)
        .get("/api/trailers?page=0")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid limit", async () => {
      const response = await request(app)
        .get("/api/trailers?limit=101")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid status filter", async () => {
      const response = await request(app)
        .get("/api/trailers?status=INVALID")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid type filter", async () => {
      const response = await request(app)
        .get("/api/trailers?type=INVALID_TYPE")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid sort field", async () => {
      const response = await request(app)
        .get("/api/trailers?sortBy=invalidField")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid sort order", async () => {
      const response = await request(app)
        .get("/api/trailers?sortOrder=invalid")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should accept valid query parameters", async () => {
      const response = await request(app)
        .get(
          "/api/trailers?page=1&limit=10&status=AVAILABLE&type=FLATBED&sortBy=plateNumber&sortOrder=asc"
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("ID Parameter Validation", () => {
    test("should fail with invalid MongoDB ID format", async () => {
      const response = await request(app)
        .get("/api/trailers/invalid-id-format")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid ID in update", async () => {
      const response = await request(app)
        .put("/api/trailers/not-a-valid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ brand: "Wabash" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid ID in delete", async () => {
      const response = await request(app)
        .delete("/api/trailers/123")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
