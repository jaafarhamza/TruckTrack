import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import Truck from "../../models/Truck.js";
import { createTestUser, generateTestToken } from "../helpers/testHelpers.js";

describe("Truck CRUD Operations", () => {
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

  describe("POST /api/trucks - Create Truck", () => {
    const validTruckData = {
      plateNumber: "ABC-1234",
      brand: "Volvo",
      model: "FH16",
      year: 2020,
      mileage: 50000,
      status: "AVAILABLE",
      loadCapacity: 25000,
      averageConsumption: 28.5,
      purchaseDate: "2020-03-15",
      purchasePrice: 85000,
      color: "White",
      serialNumber: "YV2A22CBXLA123456",
    };

    test("should create a truck successfully as admin", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTruckData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Truck created successfully");
      expect(response.body.data.truck).toBeDefined();
      expect(response.body.data.truck.plateNumber).toBe("ABC-1234");
      expect(response.body.data.truck.brand).toBe("Volvo");
      expect(response.body.data.truck.age).toBeDefined();
    });

    test("should fail to create truck without authentication", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .send(validTruckData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("should fail to create truck as driver (not admin)", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${driverToken}`)
        .send(validTruckData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access denied");
    });

    test("should fail with duplicate plate number", async () => {
      // Create first truck
      await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTruckData);

      // Try to create duplicate
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTruckData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Plate number already exists");
    });

    test("should fail with duplicate serial number", async () => {
      // Create first truck
      await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validTruckData);

      // Try to create with different plate but same serial
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTruckData,
          plateNumber: "XYZ-9999",
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Serial number already exists");
    });

    test("should fail with missing required fields", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          plateNumber: "ABC-1234",
          brand: "Volvo",
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should convert plate number to uppercase", async () => {
      const response = await request(app)
        .post("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTruckData,
          plateNumber: "abc-1234",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.truck.plateNumber).toBe("ABC-1234");
    });
  });

  describe("GET /api/trucks - Get All Trucks", () => {
    beforeEach(async () => {
      // Create test trucks
      await Truck.create([
        {
          plateNumber: "TRUCK-001",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          mileage: 50000,
          status: "AVAILABLE",
          loadCapacity: 25000,
          purchaseDate: new Date("2020-01-01"),
          purchasePrice: 85000,
        },
        {
          plateNumber: "TRUCK-002",
          brand: "Scania",
          model: "R450",
          year: 2021,
          mileage: 30000,
          status: "ON_TRIP",
          loadCapacity: 26000,
          purchaseDate: new Date("2021-01-01"),
          purchasePrice: 90000,
        },
        {
          plateNumber: "TRUCK-003",
          brand: "Volvo",
          model: "FH13",
          year: 2019,
          mileage: 80000,
          status: "UNDER_MAINTENANCE",
          loadCapacity: 24000,
          purchaseDate: new Date("2019-01-01"),
          purchasePrice: 80000,
        },
      ]);
    });

    test("should get all trucks with pagination", async () => {
      const response = await request(app)
        .get("/api/trucks")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trucks).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalItems).toBe(3);
    });

    test("should filter trucks by status", async () => {
      const response = await request(app)
        .get("/api/trucks?status=AVAILABLE")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trucks).toHaveLength(1);
      expect(response.body.data.trucks[0].status).toBe("AVAILABLE");
    });

    test("should filter trucks by brand", async () => {
      const response = await request(app)
        .get("/api/trucks?brand=Volvo")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trucks).toHaveLength(2);
    });

    test("should search trucks", async () => {
      const response = await request(app)
        .get("/api/trucks?search=TRUCK-002")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trucks).toHaveLength(1);
      expect(response.body.data.trucks[0].plateNumber).toBe("TRUCK-002");
    });

    test("should paginate results", async () => {
      const response = await request(app)
        .get("/api/trucks?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trucks).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(2);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
    });

    test("should sort trucks", async () => {
      const response = await request(app)
        .get("/api/trucks?sortBy=year&sortOrder=asc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.trucks[0].year).toBe(2019);
      expect(response.body.data.trucks[2].year).toBe(2021);
    });

    test("should allow driver to view trucks", async () => {
      const response = await request(app)
        .get("/api/trucks")
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/trucks/:id - Get Truck by ID", () => {
    let truck;

    beforeEach(async () => {
      truck = await Truck.create({
        plateNumber: "TEST-123",
        brand: "Volvo",
        model: "FH16",
        year: 2020,
        mileage: 50000,
        status: "AVAILABLE",
        loadCapacity: 25000,
        purchaseDate: new Date("2020-01-01"),
        purchasePrice: 85000,
      });
    });

    test("should get truck by ID", async () => {
      const response = await request(app)
        .get(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.truck.plateNumber).toBe("TEST-123");
      expect(response.body.data.truck.age).toBeDefined();
    });

    test("should return 404 for non-existent truck", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/trucks/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Truck not found");
    });

    test("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/trucks/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/trucks/:id - Update Truck", () => {
    let truck;

    beforeEach(async () => {
      truck = await Truck.create({
        plateNumber: "UPDATE-123",
        brand: "Volvo",
        model: "FH16",
        year: 2020,
        mileage: 50000,
        status: "AVAILABLE",
        loadCapacity: 25000,
        purchaseDate: new Date("2020-01-01"),
        purchasePrice: 85000,
      });
    });

    test("should update truck as admin", async () => {
      const response = await request(app)
        .put(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          brand: "Scania",
          model: "R450",
          status: "UNDER_MAINTENANCE",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.truck.brand).toBe("Scania");
      expect(response.body.data.truck.model).toBe("R450");
      expect(response.body.data.truck.status).toBe("UNDER_MAINTENANCE");
    });

    test("should fail to update as driver", async () => {
      const response = await request(app)
        .put(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${driverToken}`)
        .send({ brand: "Scania" });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test("should fail to update with duplicate plate number", async () => {
      // Create another truck
      await Truck.create({
        plateNumber: "ANOTHER-123",
        brand: "Mercedes",
        model: "Actros",
        year: 2021,
        mileage: 30000,
        status: "AVAILABLE",
        loadCapacity: 26000,
        purchaseDate: new Date("2021-01-01"),
        purchasePrice: 90000,
      });

      const response = await request(app)
        .put(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ plateNumber: "ANOTHER-123" });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Plate number already exists");
    });

    test("should update mileage if increased", async () => {
      const response = await request(app)
        .put(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ mileage: 55000 });

      expect(response.status).toBe(200);
      expect(response.body.data.truck.mileage).toBe(55000);
    });
  });

  describe("DELETE /api/trucks/:id - Delete Truck (Soft Delete)", () => {
    let truck;

    beforeEach(async () => {
      truck = await Truck.create({
        plateNumber: "DELETE-123",
        brand: "Volvo",
        model: "FH16",
        year: 2020,
        mileage: 50000,
        status: "AVAILABLE",
        loadCapacity: 25000,
        purchaseDate: new Date("2020-01-01"),
        purchasePrice: 85000,
      });
    });

    test("should soft delete truck as admin", async () => {
      const response = await request(app)
        .delete(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.truck.status).toBe("OUT_OF_SERVICE");

      // Verify truck still exists in database
      const deletedTruck = await Truck.findById(truck._id);
      expect(deletedTruck).toBeDefined();
      expect(deletedTruck.status).toBe("OUT_OF_SERVICE");
    });

    test("should fail to delete as driver", async () => {
      const response = await request(app)
        .delete(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test("should fail to delete truck on trip", async () => {
      truck.status = "ON_TRIP";
      await truck.save();

      const response = await request(app)
        .delete(`/api/trucks/${truck._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("currently on a trip");
    });
  });

  describe("GET /api/trucks/available - Get Available Trucks", () => {
    beforeEach(async () => {
      await Truck.create([
        {
          plateNumber: "AVAIL-001",
          brand: "Volvo",
          model: "FH16",
          year: 2020,
          mileage: 50000,
          status: "AVAILABLE",
          loadCapacity: 25000,
          purchaseDate: new Date("2020-01-01"),
          purchasePrice: 85000,
        },
        {
          plateNumber: "AVAIL-002",
          brand: "Scania",
          model: "R450",
          year: 2021,
          mileage: 30000,
          status: "AVAILABLE",
          loadCapacity: 26000,
          purchaseDate: new Date("2021-01-01"),
          purchasePrice: 90000,
        },
        {
          plateNumber: "BUSY-001",
          brand: "Mercedes",
          model: "Actros",
          year: 2019,
          mileage: 80000,
          status: "ON_TRIP",
          loadCapacity: 24000,
          purchaseDate: new Date("2019-01-01"),
          purchasePrice: 80000,
        },
      ]);
    });

    test("should get only available trucks", async () => {
      const response = await request(app)
        .get("/api/trucks/available")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trucks).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.trucks[0].status).toBe("AVAILABLE");
    });

    test("should allow driver to view available trucks", async () => {
      const response = await request(app)
        .get("/api/trucks/available")
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PATCH /api/trucks/:id/mileage - Update Mileage", () => {
    let truck;

    beforeEach(async () => {
      truck = await Truck.create({
        plateNumber: "MILEAGE-123",
        brand: "Volvo",
        model: "FH16",
        year: 2020,
        mileage: 50000,
        status: "AVAILABLE",
        loadCapacity: 25000,
        purchaseDate: new Date("2020-01-01"),
        purchasePrice: 85000,
      });
    });

    test("should update mileage successfully", async () => {
      const response = await request(app)
        .patch(`/api/trucks/${truck._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ mileage: 55000 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.truck.mileage).toBe(55000);
    });

    test("should fail to decrease mileage", async () => {
      const response = await request(app)
        .patch(`/api/trucks/${truck._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ mileage: 40000 });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "cannot be less than current mileage"
      );
    });

    test("should fail without mileage value", async () => {
      const response = await request(app)
        .patch(`/api/trucks/${truck._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
