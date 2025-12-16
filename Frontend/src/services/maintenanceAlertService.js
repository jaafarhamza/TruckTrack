import api from "./api";

// Get all maintenance alerts
export const getAllAlerts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.vehicleType) queryParams.append("vehicleType", params.vehicleType);
  if (params.maintenanceType)
    queryParams.append("maintenanceType", params.maintenanceType);
  if (params.status) queryParams.append("status", params.status);

  const response = await api.get(
    `/maintenance-alerts?${queryParams.toString()}`
  );
  return response.data;
};

// Get upcoming maintenance
export const getUpcoming = async (days = 30) => {
  const response = await api.get(`/maintenance-alerts/upcoming?days=${days}`);
  return response.data;
};

// Get vehicle maintenance status
export const getVehicleStatus = async (vehicleType, vehicleId) => {
  const response = await api.get(
    `/maintenance-alerts/vehicle/${vehicleType}/${vehicleId}`
  );
  return response.data;
};

// Alert status labels
export const ALERT_STATUS = {
  OVERDUE: { label: "Overdue", color: "#ef4444" },
  DUE_SOON: { label: "Due Soon", color: "#f59e0b" },
  OK: { label: "OK", color: "#22c55e" },
};

// Priority labels
export const PRIORITY = {
  high: { label: "High", color: "#ef4444" },
  medium: { label: "Medium", color: "#f59e0b" },
  low: { label: "Low", color: "#22c55e" },
};
