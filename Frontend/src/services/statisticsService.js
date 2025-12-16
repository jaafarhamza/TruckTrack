import api from "./api";

// Get dashboard summary
export const getDashboardSummary = async () => {
  const response = await api.get("/statistics/dashboard");
  return response.data;
};

// Get fleet overview
export const getFleetOverview = async () => {
  const response = await api.get("/statistics/fleet");
  return response.data;
};

// Get trip statistics
export const getTripStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await api.get(`/statistics/trips?${params.toString()}`);
  return response.data;
};

// Get fuel statistics
export const getFuelStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await api.get(`/statistics/fuel?${params.toString()}`);
  return response.data;
};

// Get maintenance statistics
export const getMaintenanceStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await api.get(
    `/statistics/maintenance?${params.toString()}`
  );
  return response.data;
};

// Get driver statistics
export const getDriverStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await api.get(`/statistics/drivers?${params.toString()}`);
  return response.data;
};

// Get financial summary
export const getFinancialSummary = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const response = await api.get(`/statistics/financial?${params.toString()}`);
  return response.data;
};

// Month names for charts
export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Format month data for charts
export const formatMonthData = (data) => {
  return data.map((item) => ({
    ...item,
    monthName: MONTH_NAMES[item.month - 1],
    label: `${MONTH_NAMES[item.month - 1]} ${item.year}`,
  }));
};
