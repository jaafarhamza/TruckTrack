import { describe, test, expect } from "vitest";
import request from "supertest";
import app from "../../server.js";
import { createTestUser, generateTestToken } from "../helpers/testHelpers.js";

describe("Truck Validation Tests", () => {
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

  describe("Create Truck Validation", () => {
    test("should fail without plate number", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid plate number format", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC@123!",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without brand", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with brand too short", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "V",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with brand too long", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "A".repeat(51),
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without model", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid year (too old)", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 1899,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid year (too far in future)", async () => {
      const futureYear = new Date().getFullYear() + 2;
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: futureYear,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative mileage", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          mileage: -1000,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid status", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          status: "INVALID_STATUS",
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without load capacity", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative load capacity", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: -5000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative average consumption", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          averageConsumption: -10,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without purchase date", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid purchase date format", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "invalid-date",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail without purchase price", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative purchase price", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: -50000,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with color too long", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
          color: "A".repeat(31),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should accept valid truck with all optional fields", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          mileage: 50000,
          status: "AVAILABLE",
          loadCapacity: 25000,
          averageConsumption: 28.5,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
          color: "White",
          serialNumber: "YV2A22CBXLA123456",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test("should accept valid truck with only required fields", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "MINIMAL-123",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          loadCapacity: 25000,
          purchaseDate: "2020-01-01",
          purchasePrice: 85000,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.truck.mileage).toBe(0);
      expect(response.body.data.truck.status).toBe("AVAILABLE");
    });
  });

  describe("Query Parameter Validation", () => {
    test("should fail with invalid page number", async () => {
      const response = await request(app)
        .get("/api/trucks?page=0")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid limit", async () => {
      const response = await request(app)
        .get("/api/trucks?limit=101")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid status filter", async () => {
      const response = await request(app)
        .get("/api/trucks?status=INVALID")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid sort field", async () => {
      const response = await request(app)
        .get("/api/trucks?sortBy=invalidField")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid sort order", async () => {
      const response = await request(app)
        .get("/api/trucks?sortOrder=invalid")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should accept valid query parameters", async () => {
      const response = await request(app)
        .get(
          "/api/trucks?page=1&limit=10&status=AVAILABLE&sortBy=plateNumber&sortOrder=asc"
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("ID Parameter Validation", () => {
    test("should fail with invalid MongoDB ID format", async () => {
      const response = await request(app)
        .get("/api/trucks/invalid-id-format")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid ID in update", async () => {
      const response = await request(app)
        .put("/api/trucks/not-a-valid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ brand: "Volvo" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid ID in delete", async () => {
      const response = await request(app)
        .delete("/api/trucks/123")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid ID in mileage update", async () => {
      const response = await request(app)
        .patch("/api/trucks/abc/mileage")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ mileage: 50000 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Mileage Update Validation", () => {
    test("should fail without mileage in body", async () => {
      const validId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .patch(`/api/trucks/${validId}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with negative mileage", async () => {
      const validId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .patch(`/api/trucks/${validId}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ mileage: -1000 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with non-integer mileage", async () => {
      const validId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .patch(`/api/trucks/${validId}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ mileage: "not-a-number" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
