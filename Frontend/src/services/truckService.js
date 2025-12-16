import api from "./api";

// Get all trucks with pagination and filtering
export const getAllTrucks = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.status) queryParams.append("status", params.status);
  if (params.brand) queryParams.append("brand", params.brand);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `/trucks?${queryString}` : "/trucks";

  const response = await api.get(url);
  return response.data;
};

// Get truck by ID
export const getTruckById = async (id) => {
  const response = await api.get(`/trucks/${id}`);
  return response.data;
};

// Create new truck
export const createTruck = async (truckData) => {
  const response = await api.post("/trucks", truckData);
  return response.data;
};

// Update truck
export const updateTruck = async (id, truckData) => {
  const response = await api.put(`/trucks/${id}`, truckData);
  return response.data;
};

// Delete truck (soft delete)
export const deleteTruck = async (id) => {
  const response = await api.delete(`/trucks/${id}`);
  return response.data;
};

// Get available trucks
export const getAvailableTrucks = async () => {
  const response = await api.get("/trucks/available");
  return response.data;
};

// Update truck mileage
export const updateTruckMileage = async (id, mileage) => {
  const response = await api.patch(`/trucks/${id}/mileage`, { mileage });
  return response.data;
};
