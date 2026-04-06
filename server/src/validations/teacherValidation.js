const Joi = require('joi');

const createTeacher = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().allow('').optional(),
  employeeId: Joi.string().trim().required(),
  schoolId: Joi.string().trim().required(),
  qualification: Joi.string().trim().required(),
  experience: Joi.number().integer().min(0).default(0),
  salary: Joi.number().min(0).optional(),
});

const updateTeacher = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  phone: Joi.string().allow('').optional(),
  employeeId: Joi.string().trim().optional(),
  schoolId: Joi.string().trim().optional(),
  qualification: Joi.string().trim().optional(),
  experience: Joi.number().integer().min(0).optional(),
  salary: Joi.number().min(0).optional(),
});

module.exports = { createTeacher, updateTeacher };
