import { describe, test, expect, beforeEach } from "vitest";
import Tire from "../../models/Tire.js";
import Truck from "../../models/Truck.js";
import { TIRE_STATUS } from "../../utils/constants.js";

describe("Tire Model", () => {
  let testTruck;

  beforeEach(async () => {
    // Create test truck
    testTruck = await Truck.create({
      plateNumber: "MODEL-TEST",
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

  describe("Tire Creation", () => {
    test("should create a valid tire", async () => {
      const tire = await Tire.create({
        reference: "TIRE-MODEL-001",
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

      expect(tire).toBeDefined();
      expect(tire.reference).toBe("TIRE-MODEL-001");
      expect(tire.status).toBe(TIRE_STATUS.NEW);
    });

    test("should fail without required fields", async () => {
      await expect(
        Tire.create({
          reference: "TIRE-INCOMPLETE",
          // Missing required fields
        })
      ).rejects.toThrow();
    });

    test("should fail with invalid dimension format", async () => {
      await expect(
        Tire.create({
          reference: "TIRE-INVALID-DIM",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_LEFT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 50000,
          brand: "Michelin",
          model: "XZE",
          dimension: "invalid-format",
          purchasePrice: 450,
        })
      ).rejects.toThrow();
    });

    test("should fail with currentKm < installationKm", async () => {
      await expect(
        Tire.create({
          reference: "TIRE-INVALID-KM",
          vehicle: testTruck._id,
          vehicleType: "Truck",
          position: "FRONT_LEFT",
          installationDate: new Date("2024-01-01"),
          installationKm: 50000,
          currentKm: 40000, // Less than installation
          brand: "Michelin",
          model: "XZE",
          dimension: "315/80R22.5",
          purchasePrice: 450,
        })
      ).rejects.toThrow(/cannot be less than installation mileage/);
    });

    test("should convert reference to uppercase", async () => {
      const tire = await Tire.create({
        reference: "tire-lowercase",
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

      expect(tire.reference).toBe("TIRE-LOWERCASE");
    });

    test("should set default status to NEW", async () => {
      const tire = await Tire.create({
        reference: "TIRE-DEFAULT-STATUS",
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

      expect(tire.status).toBe(TIRE_STATUS.NEW);
    });
  });

  describe("Virtual Fields", () => {
    test("should calculate kmTraveled correctly", async () => {
      const tire = await Tire.create({
        reference: "TIRE-KM-TRAVELED",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 75000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      expect(tire.kmTraveled).toBe(25000);
    });

    test("should calculate age in days", async () => {
      const installationDate = new Date();
      installationDate.setDate(installationDate.getDate() - 30); // 30 days ago

      const tire = await Tire.create({
        reference: "TIRE-AGE",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: installationDate,
        installationKm: 50000,
        currentKm: 50000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      expect(tire.age).toBeGreaterThanOrEqual(30);
      expect(tire.age).toBeLessThanOrEqual(31);
    });
  });

  describe("Tire Methods", () => {
    let tire;

    beforeEach(async () => {
      tire = await Tire.create({
        reference: "TIRE-METHODS",
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

    describe("calculateKmTraveled()", () => {
      test("should calculate kilometers traveled", () => {
        tire.currentKm = 75000;
        expect(tire.calculateKmTraveled()).toBe(25000);
      });

      test("should return 0 for new tire", () => {
        expect(tire.calculateKmTraveled()).toBe(0);
      });
    });

    describe("checkWear()", () => {
      test("should return NEW for 0-30000 km", () => {
        tire.currentKm = 70000; // 20000 km traveled
        const status = tire.checkWear();
        expect(status).toBe(TIRE_STATUS.NEW);
      });

      test("should return GOOD for 30001-60000 km", () => {
        tire.currentKm = 85000; // 35000 km traveled
        const status = tire.checkWear();
        expect(status).toBe(TIRE_STATUS.GOOD);
      });

      test("should return WORN for 60001-80000 km", () => {
        tire.currentKm = 115000; // 65000 km traveled
        const status = tire.checkWear();
        expect(status).toBe(TIRE_STATUS.WORN);
      });

      test("should return TO_REPLACE for 80001+ km", () => {
        tire.currentKm = 135000; // 85000 km traveled
        const status = tire.checkWear();
        expect(status).toBe(TIRE_STATUS.TO_REPLACE);
      });
    });

    describe("needsReplacement()", () => {
      test("should return true when status is TO_REPLACE", () => {
        tire.status = TIRE_STATUS.TO_REPLACE;
        expect(tire.needsReplacement()).toBe(true);
      });

      test("should return false when status is not TO_REPLACE", () => {
        tire.status = TIRE_STATUS.NEW;
        expect(tire.needsReplacement()).toBe(false);
      });
    });

    describe("updateCurrentKm()", () => {
      test("should update mileage and recalculate wear", async () => {
        await tire.updateCurrentKm(85000);

        expect(tire.currentKm).toBe(85000);
        expect(tire.status).toBe(TIRE_STATUS.GOOD);
      });

      test("should fail when decreasing mileage", async () => {
        try {
          await tire.updateCurrentKm(40000);
          expect(true).toBe(false);
        } catch (error) {
          expect(error.message).toMatch(/cannot be less than current mileage/);
        }
      });

      test("should update status to TO_REPLACE at high mileage", async () => {
        await tire.updateCurrentKm(135000);
        expect(tire.status).toBe(TIRE_STATUS.TO_REPLACE);
      });
    });
  });

  describe("Pre-save Middleware", () => {
    test("should auto-update status on save", async () => {
      const tire = await Tire.create({
        reference: "TIRE-AUTO-STATUS",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 85000,
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      expect(tire.status).toBe(TIRE_STATUS.GOOD);
    });

    test("should update status when currentKm is modified", async () => {
      const tire = await Tire.create({
        reference: "TIRE-MODIFY-KM",
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

      expect(tire.status).toBe(TIRE_STATUS.NEW);

      tire.currentKm = 115000;
      await tire.save();

      expect(tire.status).toBe(TIRE_STATUS.WORN);
    });

    test("should validate currentKm >= installationKm on save", async () => {
      const tire = await Tire.create({
        reference: "TIRE-VALIDATE-KM",
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

      tire.currentKm = 40000;

      await expect(tire.save()).rejects.toThrow(
        /cannot be less than installation mileage/
      );
    });
  });

  describe("Unique Constraints", () => {
    test("should enforce unique reference", async () => {
      await Tire.create({
        reference: "TIRE-UNIQUE",
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

      await expect(
        Tire.create({
          reference: "TIRE-UNIQUE",
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
        })
      ).rejects.toThrow();
    });
  });

  describe("Wear Calculation Thresholds", () => {
    test("should be NEW at exactly 30000 km", async () => {
      const tire = await Tire.create({
        reference: "TIRE-THRESHOLD-1",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 80000, // Exactly 30000 km
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      expect(tire.status).toBe(TIRE_STATUS.NEW);
    });

    test("should be GOOD at exactly 60000 km", async () => {
      const tire = await Tire.create({
        reference: "TIRE-THRESHOLD-2",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 110000, // Exactly 60000 km
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      expect(tire.status).toBe(TIRE_STATUS.GOOD);
    });

    test("should be WORN at exactly 80000 km", async () => {
      const tire = await Tire.create({
        reference: "TIRE-THRESHOLD-3",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 130000, // Exactly 80000 km
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      expect(tire.status).toBe(TIRE_STATUS.WORN);
    });

    test("should be TO_REPLACE at 80001 km", async () => {
      const tire = await Tire.create({
        reference: "TIRE-THRESHOLD-4",
        vehicle: testTruck._id,
        vehicleType: "Truck",
        position: "FRONT_LEFT",
        installationDate: new Date("2024-01-01"),
        installationKm: 50000,
        currentKm: 130001, // 80001 km
        brand: "Michelin",
        model: "XZE",
        dimension: "315/80R22.5",
        purchasePrice: 450,
      });

      expect(tire.status).toBe(TIRE_STATUS.TO_REPLACE);
    });
  });
});
