const ApiResponse = require('../utils/apiResponse');

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${req.user ? req.user.role : 'Guest'}`,
        403
      );
    }
    next();
  };
};

module.exports = { restrictTo };
