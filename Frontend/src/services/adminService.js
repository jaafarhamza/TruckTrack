import api from "./api";

// Get all users
export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

// Update user role
export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

// Activate user
export const activateUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/activate`);
  return response.data;
};

// Deactivate user
export const deactivateUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/deactivate`);
  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};
