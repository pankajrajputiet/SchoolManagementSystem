const ApiError = require('../utils/ApiError');

/**
 * Middleware that restricts access to specific roles.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'teacher')
 */
const role = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

module.exports = { role };
