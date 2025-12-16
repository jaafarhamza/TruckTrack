import api from "./api";

export const createFuelRecord = async (fuelData) => {
  const response = await api.post("/fuel", fuelData);
  return response.data;
};

export const getAllFuelRecords = async (filters = {}) => {
  const params = {};

  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.search) params.search = filters.search;
  if (filters.vehicle) params.vehicle = filters.vehicle;
  if (filters.vehicleModel) params.vehicleModel = filters.vehicleModel;
  if (filters.trip) params.trip = filters.trip;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.station) params.station = filters.station;
  if (filters.city) params.city = filters.city;
  if (filters.fuelType) params.fuelType = filters.fuelType;

  const response = await api.get("/fuel", { params });
  return response.data;
};

export const getFuelRecordById = async (id) => {
  const response = await api.get(`/fuel/${id}`);
  return response.data;
};

export const updateFuelRecord = async (id, fuelData) => {
  const response = await api.put(`/fuel/${id}`, fuelData);
  return response.data;
};

export const deleteFuelRecord = async (id) => {
  const response = await api.delete(`/fuel/${id}`);
  return response.data;
};

export const getFuelByVehicle = async (vehicleId, vehicleModel) => {
  const response = await api.get(`/fuel/vehicle/${vehicleId}`, {
    params: { vehicleModel },
  });
  return response.data;
};

export const getFuelStatistics = async (filters = {}) => {
  const params = {};

  if (filters.vehicle) params.vehicle = filters.vehicle;
  if (filters.vehicleModel) params.vehicleModel = filters.vehicleModel;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await api.get("/fuel/statistics/all", { params });
  return response.data;
};

export const getEfficiencyReport = async (vehicleId, vehicleModel) => {
  const response = await api.get(`/fuel/efficiency/${vehicleId}`, {
    params: { vehicleModel },
  });
  return response.data;
};

export const getCostAnalysis = async (filters = {}) => {
  const params = {};

  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.vehicleModel) params.vehicleModel = filters.vehicleModel;

  const response = await api.get("/fuel/cost-analysis/all", { params });
  return response.data;
};
