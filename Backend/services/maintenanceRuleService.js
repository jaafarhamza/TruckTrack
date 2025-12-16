import MaintenanceRule from "../models/MaintenanceRule.js";
import CustomError from "../utils/CustomError.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Get all maintenance rules
export const getAllRules = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    type,
    active,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const query = {};
  if (type) query.type = type;
  if (active !== undefined) query.active = active === "true";

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [rules, totalItems] = await Promise.all([
    MaintenanceRule.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    MaintenanceRule.countDocuments(query),
  ]);

  return {
    rules,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: parseInt(limit),
      hasNextPage: page * limit < totalItems,
      hasPrevPage: page > 1,
    },
  };
};

// Get rule by ID
export const getRuleById = async (ruleId) => {
  const rule = await MaintenanceRule.findById(ruleId);

  if (!rule) {
    throw new CustomError("Maintenance rule not found", HTTP_STATUS.NOT_FOUND);
  }

  return rule;
};

// Create maintenance rule
export const createRule = async (ruleData) => {
  const rule = new MaintenanceRule(ruleData);
  await rule.save();
  return rule;
};

// Update maintenance rule
export const updateRule = async (ruleId, updateData) => {
  const rule = await MaintenanceRule.findById(ruleId);

  if (!rule) {
    throw new CustomError("Maintenance rule not found", HTTP_STATUS.NOT_FOUND);
  }

  // Update allowed fields
  const allowedFields = [
    "type",
    "description",
    "kmInterval",
    "monthInterval",
    "estimatedCost",
    "active",
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      rule[field] = updateData[field];
    }
  });

  await rule.save();
  return rule;
};

// Delete maintenance rule
export const deleteRule = async (ruleId) => {
  const rule = await MaintenanceRule.findById(ruleId);

  if (!rule) {
    throw new CustomError("Maintenance rule not found", HTTP_STATUS.NOT_FOUND);
  }

  await MaintenanceRule.findByIdAndDelete(ruleId);
  return { message: "Maintenance rule deleted successfully" };
};

// Toggle active status
export const toggleActive = async (ruleId) => {
  const rule = await MaintenanceRule.findById(ruleId);

  if (!rule) {
    throw new CustomError("Maintenance rule not found", HTTP_STATUS.NOT_FOUND);
  }

  rule.active = !rule.active;
  await rule.save();

  return rule;
};

// Get rule statistics
export const getRuleStats = async () => {
  const [total, active, byType] = await Promise.all([
    MaintenanceRule.countDocuments(),
    MaintenanceRule.countDocuments({ active: true }),
    MaintenanceRule.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: ["$active", 1, 0] },
          },
          avgCost: { $avg: "$estimatedCost" },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    total,
    active,
    inactive: total - active,
    byType,
  };
};

// Get active rules by type
export const getActiveRulesByType = async (type) => {
  return MaintenanceRule.find({ type, active: true });
};
