import api from "./api";

// Get all trips with pagination and filters
export const getAllTrips = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.driver) queryParams.append("driver", params.driver);
  if (params.truck) queryParams.append("truck", params.truck);

  const response = await api.get(`/trips?${queryParams.toString()}`);
  return response.data;
};

// Get trip by ID
export const getTripById = async (id) => {
  const response = await api.get(`/trips/${id}`);
  return response.data;
};

// Get trip stats
export const getTripStats = async () => {
  const response = await api.get("/trips/stats");
  return response.data;
};

// Get my trips (for driver)
export const getMyTrips = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append("status", params.status);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const response = await api.get(`/trips/my-trips?${queryParams.toString()}`);
  return response.data;
};

// Get my trip by ID (for driver)
export const getMyTripById = async (id) => {
  const response = await api.get(`/trips/my-trips/${id}`);
  return response.data;
};

// Get my trip stats (for driver)
export const getMyTripStats = async () => {
  const response = await api.get("/trips/my-trips/stats");
  return response.data;
};

// Start my trip (for driver)
export const startMyTrip = async (id, startKm) => {
  const response = await api.patch(`/trips/my-trips/${id}/start`, { startKm });
  return response.data;
};

// Complete my trip (for driver)
export const completeMyTrip = async (id, endKm, remarks) => {
  const response = await api.patch(`/trips/my-trips/${id}/complete`, {
    endKm,
    remarks,
  });
  return response.data;
};

// Get driver trips
export const getDriverTrips = async (driverId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append("status", params.status);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const response = await api.get(
    `/trips/driver/${driverId}?${queryParams.toString()}`
  );
  return response.data;
};

// Create trip
export const createTrip = async (tripData) => {
  const response = await api.post("/trips", tripData);
  return response.data;
};

// Update trip
export const updateTrip = async (id, tripData) => {
  const response = await api.put(`/trips/${id}`, tripData);
  return response.data;
};

// Start trip
export const startTrip = async (id, startKm) => {
  const response = await api.patch(`/trips/${id}/start`, { startKm });
  return response.data;
};

// Complete trip
export const completeTrip = async (id, endKm, remarks) => {
  const response = await api.patch(`/trips/${id}/complete`, { endKm, remarks });
  return response.data;
};

// Cancel trip
export const cancelTrip = async (id, reason) => {
  const response = await api.patch(`/trips/${id}/cancel`, { reason });
  return response.data;
};

// Update trip fuel
export const updateTripFuel = async (id, volume, cost) => {
  const response = await api.patch(`/trips/${id}/fuel`, { volume, cost });
  return response.data;
};

// Delete trip
export const deleteTrip = async (id) => {
  const response = await api.delete(`/trips/${id}`);
  return response.data;
};
