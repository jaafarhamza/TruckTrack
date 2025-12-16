import api from "./api";

export const getAllDrivers = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.active !== undefined) queryParams.append("active", params.active);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `/drivers?${queryString}` : "/drivers";

  const response = await api.get(url);
  return response.data;
};

export const getDriverById = async (id) => {
  const response = await api.get(`/drivers/${id}`);
  return response.data;
};

export const getActiveDrivers = async () => {
  const response = await api.get("/drivers/active");
  return response.data;
};

export const getDriverStats = async () => {
  const response = await api.get("/drivers/stats");
  return response.data;
};

export const createDriver = async (driverData) => {
  const response = await api.post("/drivers", driverData);
  return response.data;
};

export const updateDriver = async (id, driverData) => {
  const response = await api.put(`/drivers/${id}`, driverData);
  return response.data;
};

export const toggleDriverStatus = async (id) => {
  const response = await api.patch(`/drivers/${id}/toggle-status`);
  return response.data;
};
