const Joi = require('joi');
const { NOTIFICATION_TYPES, ROLES } = require('../constants');

const createNotification = Joi.object({
  title: Joi.string().trim().required(),
  message: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(NOTIFICATION_TYPES))
    .default(NOTIFICATION_TYPES.GENERAL),
  targetRole: Joi.string()
    .valid('all', ...Object.values(ROLES))
    .default('all'),
  targetUsers: Joi.array().items(Joi.string().hex().length(24)).optional(),
  expiresAt: Joi.date().optional(),
});

const updateNotification = Joi.object({
  title: Joi.string().trim().optional(),
  message: Joi.string().optional(),
  type: Joi.string()
    .valid(...Object.values(NOTIFICATION_TYPES))
    .optional(),
  targetRole: Joi.string()
    .valid('all', ...Object.values(ROLES))
    .optional(),
  isActive: Joi.boolean().optional(),
  expiresAt: Joi.date().allow(null).optional(),
});

module.exports = { createNotification, updateNotification };
