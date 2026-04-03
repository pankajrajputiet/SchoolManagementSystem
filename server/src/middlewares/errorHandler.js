const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { errorCounter } = require('../config/prometheus');

const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message };

  // Track errors in Prometheus
  const errorType = err.name || 'UnknownError';
  errorCounter.labels({ type: errorType }).inc();

  // Log the error
  logger.error(`${err.message}`, { stack: err.stack, url: req.originalUrl });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid resource ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    error = new ApiError(409, `Duplicate field value: ${field}. Please use another value`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, messages.join('. '));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Joi validation error
  if (err.isJoi) {
    const messages = err.details.map((d) => d.message);
    error = new ApiError(400, messages.join('. '));
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
