import { describe, test, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../server.js";
import Tire from "../../models/Tire.js";
import Truck from "../../models/Truck.js";
import Trailer from "../../models/Trailer.js";
import { createTestUser, generateTestToken } from "../helpers/testHelpers.js";

describe("Tire CRUD Operations", () => {
  let adminToken;
  let driverToken;
  let adminUser;
  let driverUser;
  let testTruck;
  let testTrailer;

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

    // Create test truck
    testTruck = await Truck.create({
      plateNumber: "TRUCK-TEST",
      brand: "Volvo",
      model: "FH16",
      year: 2020,
      mileage: 50000,
      status: "AVAILABLE",
      loadCapacity: 25000,
      purchaseDate: new Date("2020-01-01"),
      purchasePrice: 85000,
    });

    // Create test trailer
    testTrailer = await Trailer.create({
      plateNumber: "TRAILER-TEST",
      type: "FLATBED",
      brand: "Schmitz",
      model: "S.KO",
      year: 2021,
      status: "AVAILABLE",
      loadCapacity: 30000,
      length: 13.6,
      width: 2.48,
      height: 2.7,
      purchaseDate: new Date("2021-01-01"),
      purchasePrice: 35000,
    });
  });

  describe("POST /api/tires - Create Tire", () => {
    const validTireData = {
      reference: "TIRE-001",
      vehicle: null, // Will be set in tests
      vehicleType: "Truck",
      position: "FRONT_LEFT",
      installationDate: "2024-01-15",
      installationKm: 50000,
      currentKm: 50000,
      brand: "Michelin",
      model: "XZE",
      dimension: "315/80R22.5",
      pressure: 110,
      purchasePrice: 450.0,
    };

    test("should create a tire successfully as admin", async () => {
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          vehicle: testTruck._id,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Tire created successfully");
      expect(response.body.data.tire).toBeDefined();
      expect(response.body.data.tire.reference).toBe("TIRE-001");
      expect(response.body.data.tire.brand).toBe("Michelin");
      expect(response.body.data.tire.status).toBe("NEW");
      expect(response.body.data.tire.kmTraveled).toBe(0);
    });

    test("should create tire for trailer", async () => {
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          reference: "TIRE-TRAILER-001",
          vehicle: testTrailer._id,
          vehicleType: "Trailer",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.tire.vehicleType).toBe("Trailer");
    });

    test("should fail to create tire without authentication", async () => {
      const response = await request(app)
        .post("/api/tires")
        .send({
          ...validTireData,
          vehicle: testTruck._id,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test("should fail to create tire as driver (not admin)", async () => {
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${driverToken}`)
        .send({
          ...validTireData,
          vehicle: testTruck._id,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Access denied");
    });

    test("should fail with duplicate reference", async () => {
      // Create first tire
      await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          vehicle: testTruck._id,
        });

      // Try to create duplicate
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          vehicle: testTruck._id,
          position: "FRONT_RIGHT", // Different position
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Tire reference already exists");
    });

    test("should fail with duplicate position on same vehicle", async () => {
      // Create first tire
      await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          vehicle: testTruck._id,
        });

      // Try to create tire with same position
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          reference: "TIRE-002",
          vehicle: testTruck._id,
          position: "FRONT_LEFT", // Same position
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already occupied");
    });

    test("should fail with non-existent vehicle", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          vehicle: fakeId,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("not found");
    });

    test("should fail with missing required fields", async () => {
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          reference: "TIRE-001",
          vehicle: testTruck._id,
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should fail with invalid dimension format", async () => {
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          vehicle: testTruck._id,
          dimension: "invalid-format",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should convert reference to uppercase", async () => {
      const response = await request(app)
        .post("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ...validTireData,
          reference: "tire-lowercase",
          vehicle: testTruck._id,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.tire.reference).toBe("TIRE-LOWERCASE");
    });
  });

  describe("GET /api/tires - Get All Tires", () => {
    beforeEach(async () => {
      // Create test tires
      await Tire.create([
        {
          reference: "TIRE-001",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_LEFT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 65000,
          status: "GOOD",
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-002",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_RIGHT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 135000,
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-003",
          vehicle: testTrailer._id,
          vehicleType: "Trailer",
          position: "REAR_LEFT",
          installationDate: new Date("2024-02-01"),
          installationKm: 0,
          currentKm: 20000,
          status: "NEW",
          brand: "Continental",
          model: "HSR2",
          dimension: "385/65R22.5",
          purchasePrice: 380,
        },
      ]);
    });

    test("should get all tires with pagination", async () => {
      const response = await request(app)
        .get("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tires).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.totalItems).toBe(3);
    });

    test("should filter tires by status", async () => {
      const response = await request(app)
        .get("/api/tires?status=TO_REPLACE")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tires).toHaveLength(1);
      expect(response.body.data.tires[0].status).toBe("TO_REPLACE");
    });

    test("should filter tires by vehicle type", async () => {
      const response = await request(app)
        .get("/api/tires?vehicleType=Truck")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tires).toHaveLength(2);
    });

    test("should filter tires by position", async () => {
      const response = await request(app)
        .get("/api/tires?position=FRONT_LEFT")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tires).toHaveLength(1);
      expect(response.body.data.tires[0].position).toBe("FRONT_LEFT");
    });

    test("should search tires by reference", async () => {
      const response = await request(app)
        .get("/api/tires?search=TIRE-002")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tires).toHaveLength(1);
      expect(response.body.data.tires[0].reference).toBe("TIRE-002");
    });

    test("should paginate results", async () => {
      const response = await request(app)
        .get("/api/tires?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tires).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(2);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
    });

    test("should allow driver to view tires", async () => {
      const response = await request(app)
        .get("/api/tires")
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test("should populate vehicle information", async () => {
      const response = await request(app)
        .get("/api/tires")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tires[0].vehicle).toBeDefined();
      expect(response.body.data.tires[0].vehicle.plateNumber).toBeDefined();
    });
  });

  describe("GET /api/tires/:id - Get Tire by ID", () => {
    let tire;

    beforeEach(async () => {
      tire = await Tire.create({
        reference: "TIRE-SINGLE",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 65000,
        status: "GOOD",
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });
    });

    test("should get tire by ID", async () => {
      const response = await request(app)
        .get(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tire.reference).toBe("TIRE-SINGLE");
      expect(response.body.data.tire.kmTraveled).toBe(15000);
      expect(response.body.data.tire.age).toBeDefined();
    });

    test("should return 404 for non-existent tire", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/tires/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Tire not found");
    });

    test("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/tires/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/tires/:id - Update Tire", () => {
    let tire;

    beforeEach(async () => {
      tire = await Tire.create({
        reference: "TIRE-UPDATE",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 65000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });
    });

    test("should update tire as admin", async () => {
      const response = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          brand: "Continental",
          model: "HSR2",
          pressure: 115,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tire.brand).toBe("Continental");
      expect(response.body.data.tire.model).toBe("HSR2");
      expect(response.body.data.tire.pressure).toBe(115);
    });

    test("should fail to update as driver", async () => {
      const response = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${driverToken}`)
        .send({ brand: "Continental" });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test("should fail to update with duplicate reference", async () => {
      // Create another tire
      await Tire.create({
        reference: "TIRE-ANOTHER",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_RIGHT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 50000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      const response = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reference: "TIRE-ANOTHER" });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Tire reference already exists");
    });

    test("should fail to update with duplicate position", async () => {
      // Create another tire
      await Tire.create({
        reference: "TIRE-POS",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "REAR_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 50000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      const response = await request(app)
        .put(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ position: "REAR_LEFT" });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already occupied");
    });
  });

  describe("DELETE /api/tires/:id - Delete Tire", () => {
    let tire;

    beforeEach(async () => {
      tire = await Tire.create({
        reference: "TIRE-DELETE",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 50000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });
    });

    test("should delete tire as admin", async () => {
      const response = await request(app)
        .delete(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify tire is deleted
      const deletedTire = await Tire.findById(tire._id);
      expect(deletedTire).toBeNull();
    });

    test("should fail to delete as driver", async () => {
      const response = await request(app)
        .delete(`/api/tires/${tire._id}`)
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/tires/vehicle/:vehicleId - Get Tires by Vehicle", () => {
    beforeEach(async () => {
      await Tire.create([
        {
          reference: "TIRE-V1",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_LEFT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 50000,
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-V2",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_RIGHT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 50000,
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-V3",
          vehicle: testTrailer._id,
          vehicleType: "Trailer",
          position: "REAR_LEFT",
          installationDate: new Date("2024-01-01"),
          installationKm: 0,
          currentKm: 0,
          brand: "Continental",
          model: "HSR2",
          dimension: "385/65R22.5",
          purchasePrice: 380,
        },
      ]);
    });

    test("should get tires for specific truck", async () => {
      const response = await request(app)
        .get(`/api/tires/vehicle/${testTruck._id}?vehicleType=Truck`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tires).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
    });

    test("should get tires for specific trailer", async () => {
      const response = await request(app)
        .get(`/api/tires/vehicle/${testTrailer._id}?vehicleType=Trailer`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.tires).toHaveLength(1);
    });

    test("should fail without vehicle type", async () => {
      const response = await request(app)
        .get(`/api/tires/vehicle/${testTruck._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/tires/:id/mileage - Update Tire Mileage", () => {
    let tire;

    beforeEach(async () => {
      tire = await Tire.create({
        reference: "TIRE-MILEAGE",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 50000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });
    });

    test("should update mileage successfully", async () => {
      const response = await request(app)
        .patch(`/api/tires/${tire._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ currentKm: 70000 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tire.currentKm).toBe(70000);
      expect(response.body.data.tire.kmTraveled).toBe(20000);
      expect(response.body.data.tire.status).toBe("NEW");
    });

    test("should update status to GOOD when km > 30000", async () => {
      const response = await request(app)
        .patch(`/api/tires/${tire._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ currentKm: 85000 });

      expect(response.status).toBe(200);
      expect(response.body.data.tire.status).toBe("GOOD");
      expect(response.body.data.tire.kmTraveled).toBe(35000);
    });

    test("should update status to WORN when km > 60000", async () => {
      const response = await request(app)
        .patch(`/api/tires/${tire._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ currentKm: 115000 });

      expect(response.status).toBe(200);
      expect(response.body.data.tire.status).toBe("WORN");
    });

    test("should update status to TO_REPLACE when km > 80000", async () => {
      const response = await request(app)
        .patch(`/api/tires/${tire._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ currentKm: 135000 });

      expect(response.status).toBe(200);
      expect(response.body.data.tire.status).toBe("TO_REPLACE");
    });

    test("should fail to decrease mileage", async () => {
      const response = await request(app)
        .patch(`/api/tires/${tire._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ currentKm: 40000 });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "cannot be less than current mileage"
      );
    });

    test("should fail without mileage value", async () => {
      const response = await request(app)
        .patch(`/api/tires/${tire._id}/mileage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/tires/alerts/replacement - Get Tires Needing Replacement", () => {
    beforeEach(async () => {
      await Tire.create([
        {
          reference: "TIRE-GOOD",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_LEFT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 70000,
          status: "GOOD",
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-REPLACE-1",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_RIGHT",
          installationDate: new Date("2023-01-01"),
          installationKm: 50000,
          currentKm: 135000,
          status: "TO_REPLACE",
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-REPLACE-2",
          vehicle: testTrailer._id,
          vehicleType: "Trailer",
          position: "REAR_LEFT",
          installationDate: new Date("2023-01-01"),
          installationKm: 0,
          currentKm: 90000,
          status: "TO_REPLACE",
          brand: "Continental",
          model: "HSR2",
          dimension: "385/65R22.5",
          purchasePrice: 380,
        },
      ]);
    });

    test("should get only tires needing replacement", async () => {
      const response = await request(app)
        .get("/api/tires/alerts/replacement")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tires).toHaveLength(2);
      expect(response.body.data.count).toBe(2);
      expect(response.body.data.tires[0].status).toBe("TO_REPLACE");
    });

    test("should allow driver to view replacement alerts", async () => {
      const response = await request(app)
        .get("/api/tires/alerts/replacement")
        .set("Authorization", `Bearer ${driverToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/tires/statistics - Get Tire Statistics", () => {
    beforeEach(async () => {
      await Tire.create([
        {
          reference: "TIRE-STAT-1",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_LEFT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 60000,
          status: "NEW",
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-STAT-2",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_RIGHT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 85000,
          status: "GOOD",
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-STAT-3",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "REAR_LEFT",
          installationDate: new Date("2023-01-01"),
          installationKm: 50000,
          currentKm: 120000,
          status: "WORN",
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        },
        {
          reference: "TIRE-STAT-4",
          vehicle: testTrailer._id,
          vehicleType: "Trailer",
          position: "REAR_RIGHT",
          installationDate: new Date("2023-01-01"),
          installationKm: 0,
          currentKm: 90000,
          status: "TO_REPLACE",
          brand: "Continental",
          model: "HSR2",
          dimension: "385/65R22.5",
          purchasePrice: 380,
        },
      ]);
    });

    test("should get tire statistics", async () => {
      const response = await request(app)
        .get("/api/tires/statistics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.byStatus).toBeDefined();
      expect(response.body.data.byStatus.NEW).toBe(1);
      expect(response.body.data.byStatus.GOOD).toBe(1);
      expect(response.body.data.byStatus.WORN).toBe(1);
      expect(response.body.data.byStatus.TO_REPLACE).toBe(1);
    });
  });
});
