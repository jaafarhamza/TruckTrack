import Fuel from "../models/Fuel.js";

export const createFuelRecord = async (fuelData) => {
  const fuel = new Fuel(fuelData);
  await fuel.save();
  return await Fuel.findById(fuel._id).populate("vehicle").populate("trip");
};

export const getAllFuelRecords = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    vehicle,
    vehicleModel,
    trip,
    startDate,
    endDate,
    station,
    city,
    fuelType,
  } = filters;

  const query = {};

  if (search) {
    query.$or = [
      { station: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { invoice: { $regex: search, $options: "i" } },
    ];
  }

  if (vehicle) query.vehicle = vehicle;
  if (vehicleModel) query.vehicleModel = vehicleModel;
  if (trip) query.trip = trip;
  if (station) query.station = { $regex: station, $options: "i" };
  if (city) query.city = { $regex: city, $options: "i" };
  if (fuelType) query.fuelType = fuelType;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [fuelRecords, totalItems] = await Promise.all([
    Fuel.find(query)
      .populate("vehicle")
      .populate("trip")
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Fuel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    fuelRecords,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getFuelRecordById = async (id) => {
  const fuel = await Fuel.findById(id).populate("vehicle").populate("trip");
  if (!fuel) {
    throw new Error("Fuel record not found");
  }
  return fuel;
};

export const updateFuelRecord = async (id, updateData) => {
  const fuel = await Fuel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("vehicle")
    .populate("trip");

  if (!fuel) {
    throw new Error("Fuel record not found");
  }

  return fuel;
};

export const deleteFuelRecord = async (id) => {
  const fuel = await Fuel.findByIdAndDelete(id);
  if (!fuel) {
    throw new Error("Fuel record not found");
  }
  return fuel;
};

export const getFuelByVehicle = async (vehicleId, vehicleModel) => {
  const fuelRecords = await Fuel.find({
    vehicle: vehicleId,
    vehicleModel: vehicleModel,
  })
    .populate("trip")
    .sort({ date: -1 });

  return fuelRecords;
};

export const getFuelStatistics = async (filters = {}) => {
  const { vehicle, vehicleModel, startDate, endDate } = filters;

  const query = {};
  if (vehicle) query.vehicle = vehicle;
  if (vehicleModel) query.vehicleModel = vehicleModel;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const fuelRecords = await Fuel.find(query).sort({ date: 1 });

  if (fuelRecords.length === 0) {
    return {
      totalRecords: 0,
      totalVolume: 0,
      totalCost: 0,
      averageUnitCost: 0,
      totalDistance: 0,
      averageConsumption: 0,
      costPerKm: 0,
    };
  }

  let totalVolume = 0;
  let totalCost = 0;
  let totalDistance = 0;
  let consumptionSum = 0;
  let consumptionCount = 0;

  for (let i = 0; i < fuelRecords.length; i++) {
    const record = fuelRecords[i];
    totalVolume += record.volume;
    totalCost += record.totalCost;

    if (i > 0) {
      const distance = record.currentKm - fuelRecords[i - 1].currentKm;
      if (distance > 0) {
        totalDistance += distance;
        const consumption = (record.volume / distance) * 100;
        consumptionSum += consumption;
        consumptionCount++;
      }
    }
  }

  return {
    totalRecords: fuelRecords.length,
    totalVolume: Math.round(totalVolume * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    averageUnitCost: Math.round((totalCost / totalVolume) * 100) / 100,
    totalDistance,
    averageConsumption:
      consumptionCount > 0
        ? Math.round((consumptionSum / consumptionCount) * 100) / 100
        : 0,
    costPerKm:
      totalDistance > 0
        ? Math.round((totalCost / totalDistance) * 100) / 100
        : 0,
  };
};

export const getEfficiencyReport = async (vehicleId, vehicleModel) => {
  const fuelRecords = await Fuel.find({
    vehicle: vehicleId,
    vehicleModel: vehicleModel,
  }).sort({ date: 1 });

  if (fuelRecords.length < 2) {
    return {
      message: "Insufficient data for efficiency report",
      records: [],
    };
  }

  const efficiencyData = [];

  for (let i = 1; i < fuelRecords.length; i++) {
    const current = fuelRecords[i];
    const previous = fuelRecords[i - 1];

    const distance = current.currentKm - previous.currentKm;
    if (distance > 0) {
      const efficiency = distance / current.volume; // km/liter
      const consumption = (current.volume / distance) * 100; // L/100km
      const costPerKm = current.totalCost / distance;

      efficiencyData.push({
        date: current.date,
        distance,
        volume: current.volume,
        efficiency: Math.round(efficiency * 100) / 100,
        consumption: Math.round(consumption * 100) / 100,
        costPerKm: Math.round(costPerKm * 100) / 100,
        station: current.station,
        city: current.city,
      });
    }
  }

  const avgEfficiency =
    efficiencyData.reduce((sum, d) => sum + d.efficiency, 0) /
    efficiencyData.length;
  const avgConsumption =
    efficiencyData.reduce((sum, d) => sum + d.consumption, 0) /
    efficiencyData.length;

  return {
    vehicleId,
    vehicleModel,
    totalRefuelings: fuelRecords.length,
    averageEfficiency: Math.round(avgEfficiency * 100) / 100,
    averageConsumption: Math.round(avgConsumption * 100) / 100,
    records: efficiencyData,
  };
};

export const getCostAnalysis = async (filters = {}) => {
  const { startDate, endDate, vehicleModel } = filters;

  const query = {};
  if (vehicleModel) query.vehicleModel = vehicleModel;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const fuelRecords = await Fuel.find(query).populate("vehicle");

  const costByVehicle = {};
  const costByMonth = {};
  const costByStation = {};

  fuelRecords.forEach((record) => {
    // By vehicle
    const vehicleKey = record.vehicle?._id?.toString() || "unknown";
    if (!costByVehicle[vehicleKey]) {
      costByVehicle[vehicleKey] = {
        vehicle: record.vehicle,
        totalCost: 0,
        totalVolume: 0,
        refuelings: 0,
      };
    }
    costByVehicle[vehicleKey].totalCost += record.totalCost;
    costByVehicle[vehicleKey].totalVolume += record.volume;
    costByVehicle[vehicleKey].refuelings += 1;

    // By month
    const monthKey = `${record.date.getFullYear()}-${String(
      record.date.getMonth() + 1
    ).padStart(2, "0")}`;
    if (!costByMonth[monthKey]) {
      costByMonth[monthKey] = { totalCost: 0, totalVolume: 0, refuelings: 0 };
    }
    costByMonth[monthKey].totalCost += record.totalCost;
    costByMonth[monthKey].totalVolume += record.volume;
    costByMonth[monthKey].refuelings += 1;

    // By station
    const stationKey = record.station;
    if (!costByStation[stationKey]) {
      costByStation[stationKey] = {
        totalCost: 0,
        totalVolume: 0,
        refuelings: 0,
      };
    }
    costByStation[stationKey].totalCost += record.totalCost;
    costByStation[stationKey].totalVolume += record.volume;
    costByStation[stationKey].refuelings += 1;
  });

  return {
    totalCost: fuelRecords.reduce((sum, r) => sum + r.totalCost, 0),
    totalVolume: fuelRecords.reduce((sum, r) => sum + r.volume, 0),
    totalRefuelings: fuelRecords.length,
    costByVehicle: Object.values(costByVehicle),
    costByMonth: Object.entries(costByMonth).map(([month, data]) => ({
      month,
      ...data,
    })),
    costByStation: Object.entries(costByStation).map(([station, data]) => ({
      station,
      ...data,
    })),
  };
};
