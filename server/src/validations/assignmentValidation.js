const Joi = require('joi');

const createAssignment = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().allow('').optional(),
  subject: Joi.string().hex().length(24).required(),
  class: Joi.string().hex().length(24).required(),
  dueDate: Joi.date().required(),
});

const updateAssignment = Joi.object({
  title: Joi.string().trim().optional(),
  description: Joi.string().allow('').optional(),
  dueDate: Joi.date().optional(),
});

const gradeSubmission = Joi.object({
  grade: Joi.number().min(0).max(100).required(),
  feedback: Joi.string().allow('').optional(),
});

module.exports = { createAssignment, updateAssignment, gradeSubmission };
