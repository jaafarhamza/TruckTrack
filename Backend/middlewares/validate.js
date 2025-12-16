import { validationResult } from "express-validator";
import { errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

//Middleware to handle validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return errorResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Validation failed",
      formattedErrors
    );
  }

  next();
};
