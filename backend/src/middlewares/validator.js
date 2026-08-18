const ApiResponse = require('../utils/apiResponse');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return ApiResponse.error(res, 'Request validation failed', 400, errorMessages);
    }
    next();
  };
};

module.exports = validate;
