import api from "./api";

// Register new user
export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Get current user profile
export const getProfile = async () => {
  const response = await api.get("/auth/profil");
  return response.data;
};

// Validate token
export const validateToken = async () => {
  const response = await api.get("/auth/profil");
  return response.data;
};

export default {
  register,
  login,
  getProfile,
  validateToken,
};
