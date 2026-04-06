const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  const response = new ApiResponse(201, result, 'User registered successfully');
  res.status(response.statusCode).json(response);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  const response = new ApiResponse(200, result, 'Login successful');
  res.status(response.statusCode).json(response);
});

const logout = asyncHandler(async (_req, res) => {
  const response = new ApiResponse(200, null, 'Logged out successfully');
  res.status(response.statusCode).json(response);
});

const getMe = asyncHandler(async (req, res) => {
  const response = new ApiResponse(200, req.user, 'Profile fetched');
  res.status(response.statusCode).json(response);
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  const response = new ApiResponse(200, user, 'Profile updated');
  res.status(response.statusCode).json(response);
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  const response = new ApiResponse(200, result.message);
  res.status(response.statusCode).json(response);
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe,
  changePassword,
};
