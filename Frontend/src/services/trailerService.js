import api from "./api";

// Get all trailers with pagination and filtering
export const getAllTrailers = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.status) queryParams.append("status", params.status);
  if (params.type) queryParams.append("type", params.type);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = queryString ? `/trailers?${queryString}` : "/trailers";

  const response = await api.get(url);
  return response.data;
};

// Get trailer by ID
export const getTrailerById = async (id) => {
  const response = await api.get(`/trailers/${id}`);
  return response.data;
};

// Create new trailer
export const createTrailer = async (trailerData) => {
  const response = await api.post("/trailers", trailerData);
  return response.data;
};

// Update trailer
export const updateTrailer = async (id, trailerData) => {
  const response = await api.put(`/trailers/${id}`, trailerData);
  return response.data;
};

// Delete trailer (soft delete)
export const deleteTrailer = async (id) => {
  const response = await api.delete(`/trailers/${id}`);
  return response.data;
};

// Get available trailers
export const getAvailableTrailers = async () => {
  const response = await api.get("/trailers/available");
  return response.data;
};
