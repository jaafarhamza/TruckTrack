import api from "./api";

// Get all tires with pagination and filters

export const getAllTires = async (params = {}) => {
  const response = await api.get("/tires", { params });
  return response.data;
};

// Get tire by ID

export const getTireById = async (id) => {
  const response = await api.get(`/tires/${id}`);
  return response.data;
};

// Create new tire

export const createTire = async (tireData) => {
  const response = await api.post("/tires", tireData);
  return response.data;
};

// Update tire

export const updateTire = async (id, tireData) => {
  const response = await api.put(`/tires/${id}`, tireData);
  return response.data;
};

// Delete tire

export const deleteTire = async (id) => {
  const response = await api.delete(`/tires/${id}`);
  return response.data;
};

// Get tires for a specific vehicle

export const getTiresByVehicle = async (vehicleId, vehicleType) => {
  const response = await api.get(`/tires/vehicle/${vehicleId}`, {
    params: { vehicleType },
  });
  return response.data;
};

// Update tire mileage

export const updateTireMileage = async (id, currentKm) => {
  const response = await api.patch(`/tires/${id}/mileage`, { currentKm });
  return response.data;
};

// Get tires needing replacement

export const getTiresNeedingReplacement = async () => {
  const response = await api.get("/tires/alerts/replacement");
  return response.data;
};

// Get tire statistics

export const getTireStatistics = async () => {
  const response = await api.get("/tires/statistics");
  return response.data;
};
