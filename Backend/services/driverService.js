import User from "../models/User.js";
import CustomError from "../utils/CustomError.js";
import { HTTP_STATUS, USER_ROLES } from "../utils/constants.js";

export const getAllDrivers = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    active,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const query = { role: USER_ROLES.DRIVER };

  if (active !== undefined) {
    query.active = active === "true" || active === true;
  }

  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { license: { $regex: search, $options: "i" } },
    ];
  }

  // pagination
  const skip = (page - 1) * limit;

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination
  const [drivers, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return {
    drivers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const getDriverById = async (driverId) => {
  const driver = await User.findOne({
    _id: driverId,
    role: USER_ROLES.DRIVER,
  }).select("-password");

  if (!driver) {
    throw new CustomError("Driver not found", HTTP_STATUS.NOT_FOUND);
  }

  return driver;
};

export const getActiveDrivers = async () => {
  const drivers = await User.find({
    role: USER_ROLES.DRIVER,
    active: true,
  })
    .select("-password")
    .sort({ firstName: 1, lastName: 1 });

  return drivers;
};

export const getDriverStats = async () => {
  const [total, active, inactive] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.DRIVER }),
    User.countDocuments({ role: USER_ROLES.DRIVER, active: true }),
    User.countDocuments({ role: USER_ROLES.DRIVER, active: false }),
  ]);

  return {
    total,
    active,
    inactive,
  };
};
