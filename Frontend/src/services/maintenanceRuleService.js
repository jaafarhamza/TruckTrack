import api from "./api";

// Get all maintenance rules
export const getAllRules = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.type) queryParams.append("type", params.type);
  if (params.active !== undefined) queryParams.append("active", params.active);

  const response = await api.get(
    `/maintenance-rules?${queryParams.toString()}`
  );
  return response.data;
};

// Get rule by ID
export const getRuleById = async (id) => {
  const response = await api.get(`/maintenance-rules/${id}`);
  return response.data;
};

// Get rule statistics
export const getRuleStats = async () => {
  const response = await api.get("/maintenance-rules/stats");
  return response.data;
};

// Create maintenance rule
export const createRule = async (ruleData) => {
  const response = await api.post("/maintenance-rules", ruleData);
  return response.data;
};

// Update maintenance rule
export const updateRule = async (id, ruleData) => {
  const response = await api.put(`/maintenance-rules/${id}`, ruleData);
  return response.data;
};

// Toggle active status
export const toggleActive = async (id) => {
  const response = await api.patch(`/maintenance-rules/${id}/toggle`);
  return response.data;
};

// Delete maintenance rule
export const deleteRule = async (id) => {
  const response = await api.delete(`/maintenance-rules/${id}`);
  return response.data;
};

// Maintenance types for dropdowns
export const MAINTENANCE_TYPES = [
  { value: "TIRE", label: "Tire" },
  { value: "OIL_CHANGE", label: "Oil Change" },
  { value: "CHECKUP", label: "Checkup" },
  { value: "BRAKES", label: "Brakes" },
  { value: "FILTERS", label: "Filters" },
  { value: "BELT", label: "Belt" },
];
