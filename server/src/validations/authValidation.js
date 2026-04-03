const Joi = require('joi');
const { ROLES } = require('../constants');

const register = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required(),
  phone: Joi.string().allow('').optional(),
});

const login = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const updateProfile = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  phone: Joi.string().allow('').optional(),
  avatar: Joi.string().allow('').optional(),
});

const changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = {
  register,
  login,
  updateProfile,
  changePassword,
};
