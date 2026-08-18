const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });

  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Invalid format for field ${err.path}: ${err.value}`, 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ApiResponse.error(res, `Duplicate entry. A record with this ${field} already exists.`, 409);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    return ApiResponse.error(res, 'Validation failed', 400, errors);
  }

  return ApiResponse.error(
    res,
    err.isOperational ? err.message : 'Internal server error occurred',
    err.statusCode,
    err.errors
  );
};

module.exports = globalErrorHandler;
