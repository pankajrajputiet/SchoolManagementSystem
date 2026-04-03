const Joi = require('joi');
const { SECTIONS } = require('../constants');

const createClass = Joi.object({
  name: Joi.string().trim().required(),
  section: Joi.string().valid(...SECTIONS).default('A'),
  classTeacher: Joi.string().hex().length(24).optional(),
  academicYear: Joi.string().required(),
  maxStrength: Joi.number().integer().min(1).default(40),
});

const updateClass = Joi.object({
  name: Joi.string().trim().optional(),
  section: Joi.string().valid(...SECTIONS).optional(),
  classTeacher: Joi.string().hex().length(24).allow(null).optional(),
  academicYear: Joi.string().optional(),
  maxStrength: Joi.number().integer().min(1).optional(),
});

const addStudents = Joi.object({
  studentIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

module.exports = { createClass, updateClass, addStudents };
