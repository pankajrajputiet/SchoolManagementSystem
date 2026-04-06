const Joi = require('joi');
const { SECTIONS, GENDERS } = require('../constants');

const createStudent = Joi.object({
  schoolId: Joi.string().trim().required(),
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  phone: Joi.string().allow('').optional(),
  rollNumber: Joi.string().trim().required(),
  class: Joi.string().hex().length(24).required(),
  section: Joi.string().valid(...SECTIONS).default('A'),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid(...GENDERS).required(),
  parentName: Joi.string().trim().required(),
  parentPhone: Joi.string().trim().required(),
  address: Joi.string().allow('').optional(),
  bloodGroup: Joi.string().allow('').optional(),
});

const updateStudent = Joi.object({
  schoolId: Joi.string().trim().required(),
  name: Joi.string().trim().max(100).optional(),
  phone: Joi.string().allow('').optional(),
  rollNumber: Joi.string().trim().optional(),
  class: Joi.string().hex().length(24).optional(),
  section: Joi.string().valid(...SECTIONS).optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid(...GENDERS).optional(),
  parentName: Joi.string().trim().optional(),
  parentPhone: Joi.string().trim().optional(),
  address: Joi.string().allow('').optional(),
  bloodGroup: Joi.string().allow('').optional(),
});

module.exports = { createStudent, updateStudent };
