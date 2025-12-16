import * as trailerService from "../services/trailerService.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../utils/constants.js";

// Create a new trailer

export const createTrailer = async (req, res) => {
  try {
    const trailer = await trailerService.createTrailer(req.body);

    return successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Trailer created successfully",
      { trailer }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get all trailers with pagination

export const getAllTrailers = async (req, res) => {
  try {
    const { page, limit, status, type, search, sortBy, sortOrder } = req.query;

    const result = await trailerService.getAllTrailers({
      page,
      limit,
      status,
      type,
      search,
      sortBy,
      sortOrder,
    });

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trailers retrieved successfully",
      result
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get trailer by ID

export const getTrailerById = async (req, res) => {
  try {
    const trailer = await trailerService.getTrailerById(req.params.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trailer retrieved successfully",
      { trailer }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Update trailer

export const updateTrailer = async (req, res) => {
  try {
    const trailer = await trailerService.updateTrailer(req.params.id, req.body);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trailer updated successfully",
      { trailer }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Delete trailer (soft delete)

export const deleteTrailer = async (req, res) => {
  try {
    const trailer = await trailerService.deleteTrailer(req.params.id);

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Trailer deleted successfully (set to OUT_OF_SERVICE)",
      { trailer }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Get available trailers

export const getAvailableTrailers = async (req, res) => {
  try {
    const trailers = await trailerService.getAvailableTrailers();

    return successResponse(
      res,
      HTTP_STATUS.OK,
      "Available trailers retrieved successfully",
      { trailers, count: trailers.length }
    );
  } catch (error) {
    return errorResponse(
      res,
      error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};
