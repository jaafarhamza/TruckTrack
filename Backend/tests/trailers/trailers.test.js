import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import Trailer from "../../models/Trailer.js";
import { createTestUser, generateTestToken } from "../helpers/testHelpers.js";

describe("Trailer CRUD Operations", () => {
  let adminToken;
  let driverToken;
  let adminUser;
  let driverUser;

  beforeEach(async () => {
    // Create admin user
    adminUser = await createTestUser({
      username: "admin",
      email: "admin@test.com",
      password: "password123",
      role: "ADMIN",
      firstName: "Admin",
      lastName: "User",
      active: true,
    });
    adminToken = generateTestToken(adminUser._id, "ADMIN");

    // Create driver user
    driverUser = await createTestUser({
      username: "driver",
      email: "driver@test.com",
      password: "password123",
      role: "DRIVER",
      firstName: "Driver",
      lastName: "User",
      license: "DL123456",
      active: true,
    });
    driverToken = generateTestToken(driverUser._id, "DRIVER");
  });

  describe("POST /api/trailers - Create Trailer", () => {
    const validTrailerData = {
      plateNumber: "TRL-1234",
      type: "FLATBED",
      brand: "Great Dane",
      model: "Freedom LT",
      year: 2022,
      status: "AVAILABLE",
      loadCapacity: 25000,
      length: 16.15,
      width: 2.6,
      height: 2.7,
      purchaseDate: "2022-01-15",
      purchasePrice: 45000,
      axles: 2,
      tareWeight: 5000,
      color: "White",
      serialNumber: "GD123456789",
    };

    test("should create a trailer successfully as admin", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTrailerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Trailer created successfully");
      expect(response.body.data.trailer).toBeDefined();
      expect(response.body.data.trailer.plateNumber).toBe("TRL-1234");
      expect(response.body.data.trailer.type).toBe("FLATBED");
      expect(response.body.data.trailer.age).toBeDefined();
      expect(response.body.data.trailer.volume).toBeDefined();
      expect(response.body.data.trailer.maxPayload).toBe(20000);
    });

    test("should fail to create trailer without authentication", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .send(validTrailerData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("should fail to create trailer as driver (not admin)", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${driverToken}`)
        .send(validTrailerData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access denied");
    });

    test("should fail with duplicate plate number", async () => {
      // Create first trailer
      await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTrailerData);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTrailerData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    test("should fail with duplicate serial number", async () => {
      // Create first trailer
      await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTrailerData);

      // Try to create with different plate but same serial
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTrailerData,
          plateNumber: "TRL-9999",
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    test("should fail with missing required fields", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "TRL-1234",
          type: "FLATBED",
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should convert plate number to uppercase", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTrailerData,
          plateNumber: "trl-1234",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.trailer.plateNumber).toBe("TRL-1234");
    });

    test("should calculate volume correctly", async () => {
      const response = await request(app)
        .post("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTrailerData);

      expect(response.status).toBe(201);
      const expectedVolume = (16.15 * 2.6 * 2.7).toFixed(2);
      expect(response.body.data.trailer.volume).toBe(
        parseFloat(expectedVolume)
      );
    });
  });

  describe("GET /api/trailers - Get All Trailers", () => {
    beforeEach(async () => {
      // Create test trailers
      await Trailer.create([
        {
          plateNumber: "TRAILER-001",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          status: "AVAILABLE",
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: new Date("2022-01-01"),
          purchasePrice: 45000,
          axles: 2,
        },
        {
          plateNumber: "TRAILER-002",
          type: "REFRIGERATED",
          brand: "Utility",
          model: "3000R",
          year: 2023,
          status: "ON_TRIP",
          loadCapacity: 20000,
          length: 13.6,
          width: 2.5,
          height: 2.7,
          purchaseDate: new Date("2023-01-01"),
          purchasePrice: 55000,
          axles: 3,
        },
        {
          plateNumber: "TRAILER-003",
          type: "FLATBED",
          brand: "Wabash",
          model: "DuraPlate",
          year: 2021,
          status: "UNDER_MAINTENANCE",
          loadCapacity: 24000,
          length: 16,
          width: 2.6,
          height: 2.7,
          purchaseDate: new Date("2021-01-01"),
          purchasePrice: 42000,
          axles: 2,
        },
      ]);
    });

    test("should get all trailers with pagination", async () => {
      const response = await request(app)
        .get("/api/trailers")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trailers).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalItems).toBe(3);
    });

    test("should filter trailers by status", async () => {
      const response = await request(app)
        .get("/api/trailers?status=AVAILABLE")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trailers).toHaveLength(1);
      expect(response.body.data.trailers[0].status).toBe("AVAILABLE");
    });

    test("should filter trailers by type", async () => {
      const response = await request(app)
        .get("/api/trailers?type=FLATBED")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trailers).toHaveLength(2);
    });

    test("should search trailers", async () => {
      const response = await request(app)
        .get("/api/trailers?search=TRAILER-002")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trailers).toHaveLength(1);
      expect(response.body.data.trailers[0].plateNumber).toBe("TRAILER-002");
    });

    test("should paginate results", async () => {
      const response = await request(app)
        .get("/api/trailers?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trailers).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(2);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
    });

    test("should sort trailers", async () => {
      const response = await request(app)
        .get("/api/trailers?sortBy=year&sortOrder=asc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trailers[0].year).toBe(2021);
      expect(response.body.data.trailers[2].year).toBe(2023);
    });

    test("should allow driver to view trailers", async () => {
      const response = await request(app)
        .get("/api/trailers")
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/trailers/:id - Get Trailer by ID", () => {
    let trailer;

    beforeEach(async () => {
      trailer = await Trailer.create({
        plateNumber: "TEST-123",
        type: "TANKER",
        brand: "Polar",
        model: "Insulated",
        year: 2022,
        status: "AVAILABLE",
        loadCapacity: 30000,
        length: 14,
        width: 2.5,
        height: 3,
        purchaseDate: new Date("2022-01-01"),
        purchasePrice: 60000,
        axles: 3,
      });
    });

    test("should get trailer by ID", async () => {
      const response = await request(app)
        .get(`/api/trailers/${trailer._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trailer.plateNumber).toBe("TEST-123");
      expect(response.body.data.trailer.age).toBeDefined();
      expect(response.body.data.trailer.volume).toBeDefined();
    });

    test("should return 404 for non-existent trailer", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/trailers/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("not found");
    });

    test("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/trailers/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/trailers/:id - Update Trailer", () => {
    let trailer;

    beforeEach(async () => {
      trailer = await Trailer.create({
        plateNumber: "UPDATE-123",
        type: "FLATBED",
        brand: "Great Dane",
        model: "Freedom LT",
        year: 2022,
        status: "AVAILABLE",
        loadCapacity: 25000,
        length: 16.15,
        width: 2.6,
        height: 2.7,
        purchaseDate: new Date("2022-01-01"),
        purchasePrice: 45000,
        axles: 2,
      });
    });

    test("should update trailer as admin", async () => {
      const response = await request(app)
        .put(`/api/trailers/${trailer._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          brand: "Wabash",
          model: "DuraPlate",
          status: "UNDER_MAINTENANCE",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trailer.brand).toBe("Wabash");
      expect(response.body.data.trailer.model).toBe("DuraPlate");
      expect(response.body.data.trailer.status).toBe("UNDER_MAINTENANCE");
    });

    test("should fail to update as driver", async () => {
      const response = await request(app)
        .put(`/api/trailers/${trailer._id}`)
        .set("Authorization", `Bearer ${driverToken}`)
        .send({ brand: "Wabash" });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test("should fail to update with duplicate plate number", async () => {
      // Create another trailer
      await Trailer.create({
        plateNumber: "ANOTHER-123",
        type: "REFRIGERATED",
        brand: "Utility",
        model: "3000R",
        year: 2023,
        status: "AVAILABLE",
        loadCapacity: 20000,
        length: 13.6,
        width: 2.5,
        height: 2.7,
        purchaseDate: new Date("2023-01-01"),
        purchasePrice: 55000,
        axles: 3,
      });

      const response = await request(app)
        .put(`/api/trailers/${trailer._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ plateNumber: "ANOTHER-123" });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    test("should update dimensions", async () => {
      const response = await request(app)
        .put(`/api/trailers/${trailer._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ length: 18, width: 2.8, height: 3 });

      expect(response.status).toBe(200);
      expect(response.body.data.trailer.length).toBe(18);
      expect(response.body.data.trailer.width).toBe(2.8);
      expect(response.body.data.trailer.height).toBe(3);
    });
  });

  describe("DELETE /api/trailers/:id - Delete Trailer (Soft Delete)", () => {
    let trailer;

    beforeEach(async () => {
      trailer = await Trailer.create({
        plateNumber: "DELETE-123",
        type: "CONTAINER",
        brand: "CIMC",
        model: "Standard",
        year: 2022,
        status: "AVAILABLE",
        loadCapacity: 28000,
        length: 12,
        width: 2.4,
        height: 2.6,
        purchaseDate: new Date("2022-01-01"),
        purchasePrice: 35000,
        axles: 2,
      });
    });

    test("should soft delete trailer as admin", async () => {
      const response = await request(app)
        .delete(`/api/trailers/${trailer._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trailer.status).toBe("OUT_OF_SERVICE");

      // Verify trailer still exists in database
      const deletedTrailer = await Trailer.findById(trailer._id);
      expect(deletedTrailer).toBeDefined();
      expect(deletedTrailer.status).toBe("OUT_OF_SERVICE");
    });

    test("should fail to delete as driver", async () => {
      const response = await request(app)
        .delete(`/api/trailers/${trailer._id}`)
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/trailers/available - Get Available Trailers", () => {
    beforeEach(async () => {
      await Trailer.create([
        {
          plateNumber: "AVAIL-001",
          type: "FLATBED",
          brand: "Great Dane",
          model: "Freedom LT",
          year: 2022,
          status: "AVAILABLE",
          loadCapacity: 25000,
          length: 16.15,
          width: 2.6,
          height: 2.7,
          purchaseDate: new Date("2022-01-01"),
          purchasePrice: 45000,
          axles: 2,
        },
        {
          plateNumber: "AVAIL-002",
          type: "REFRIGERATED",
          brand: "Utility",
          model: "3000R",
          year: 2023,
          status: "AVAILABLE",
          loadCapacity: 20000,
          length: 13.6,
          width: 2.5,
          height: 2.7,
          purchaseDate: new Date("2023-01-01"),
          purchasePrice: 55000,
          axles: 3,
        },
        {
          plateNumber: "BUSY-001",
          type: "TANKER",
          brand: "Polar",
          model: "Insulated",
          year: 2021,
          status: "ON_TRIP",
          loadCapacity: 30000,
          length: 14,
          width: 2.5,
          height: 3,
          purchaseDate: new Date("2021-01-01"),
          purchasePrice: 60000,
          axles: 3,
        },
      ]);
    });

    test("should get only available trailers", async () => {
      const response = await request(app)
        .get("/api/trailers/available")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trailers).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.trailers[0].status).toBe("AVAILABLE");
    });

    test("should allow driver to view available trailers", async () => {
      const response = await request(app)
        .get("/api/trailers/available")
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
