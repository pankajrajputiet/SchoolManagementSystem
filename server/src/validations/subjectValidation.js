const Joi = require('joi');
const { SUBJECT_TYPES } = require('../constants');

const createSubject = Joi.object({
  name: Joi.string().trim().required(),
  code: Joi.string().trim().uppercase().required(),
  class: Joi.string().hex().length(24).required(),
  teacher: Joi.string().hex().length(24).optional(),
  type: Joi.string()
    .valid(...Object.values(SUBJECT_TYPES))
    .default(SUBJECT_TYPES.THEORY),
});

const updateSubject = Joi.object({
  name: Joi.string().trim().optional(),
  code: Joi.string().trim().uppercase().optional(),
  class: Joi.string().hex().length(24).optional(),
  teacher: Joi.string().hex().length(24).allow(null).optional(),
  type: Joi.string()
    .valid(...Object.values(SUBJECT_TYPES))
    .optional(),
});

module.exports = { createSubject, updateSubject };
