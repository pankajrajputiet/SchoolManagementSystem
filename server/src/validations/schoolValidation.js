const Joi = require('joi');

const createSchool = Joi.object({
  name: Joi.string().required().trim().max(200).messages({
    'any.required': 'School name is required',
    'string.max': 'School name cannot exceed 200 characters',
  }),
  code: Joi.string().optional().trim().max(20).uppercase().messages({
    'string.max': 'School code cannot exceed 20 characters',
  }),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
  }).optional(),
  phone: Joi.string().optional().trim(),
  email: Joi.string().optional().email().lowercase(),
  website: Joi.string().optional().uri(),
  adminContact: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().optional().email(),
  }).optional(),
  principalName: Joi.string().optional().trim(),
  establishedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  affiliatedBoard: Joi.string().valid('CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'),
  schoolType: Joi.string().valid('public', 'private', 'government', 'international').default('private'),
  maxStudents: Joi.number().integer().min(100).default(5000),
  academicYear: Joi.string().optional(),
  settings: Joi.object({
    smsEnabled: Joi.boolean().optional(),
    emailEnabled: Joi.boolean().optional(),
    autoAttendance: Joi.boolean().optional(),
    gradingScale: Joi.string().optional(),
  }).optional(),
  // Admin user credentials for the school
  adminName: Joi.string().optional().trim().max(100),
  adminEmail: Joi.string().optional().email().lowercase(),
  adminPassword: Joi.string().optional().min(6),
});

const updateSchool = Joi.object({
  name: Joi.string().optional().trim().max(200),
  code: Joi.string().optional().trim().max(20).uppercase(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postalCode: Joi.string().optional(),
  }).optional(),
  phone: Joi.string().optional().trim(),
  email: Joi.string().optional().email().lowercase(),
  website: Joi.string().optional().uri(),
  adminContact: Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().optional().email(),
  }).optional(),
  principalName: Joi.string().optional().trim(),
  establishedYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  affiliatedBoard: Joi.string().valid('CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'),
  schoolType: Joi.string().valid('public', 'private', 'government', 'international'),
  maxStudents: Joi.number().integer().min(100),
  academicYear: Joi.string().optional(),
  settings: Joi.object({
    smsEnabled: Joi.boolean().optional(),
    emailEnabled: Joi.boolean().optional(),
    autoAttendance: Joi.boolean().optional(),
    gradingScale: Joi.string().optional(),
  }).optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createSchool,
  updateSchool,
};
