const ApiError = require('../utils/ApiError');

/**
 * Factory function that returns a middleware to validate req.body / req.query / req.params
 * against a Joi schema.
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema
 * @param {'body'|'query'|'params'} source - Which part of the request to validate
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join('. ');
      throw new ApiError(400, messages);
    }

    req[source] = value;
    next();
  };
};

module.exports = { validate };
