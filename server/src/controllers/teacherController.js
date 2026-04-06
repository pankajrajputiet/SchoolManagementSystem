const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const teacherService = require('../services/teacherService');

const create = asyncHandler(async (req, res) => {
  const teacher = await teacherService.createTeacher(req.body, req.user);
  const response = new ApiResponse(201, teacher, 'Teacher created successfully');
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await teacherService.getTeachers(req.query);
  const response = new ApiResponse(200, result, 'Teachers fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getTeacherById(req.params.id);
  const response = new ApiResponse(200, 'Teacher fetched', teacher);
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const teacher = await teacherService.updateTeacher(req.params.id, req.body);
  const response = new ApiResponse(200, 'Teacher updated', teacher);
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await teacherService.deleteTeacher(req.params.id);
  const response = new ApiResponse(200, 'Teacher deleted');
  res.status(response.statusCode).json(response);
});

const getMyProfile = asyncHandler(async (req, res) => {
  const teacher = await teacherService.getTeacherByUserId(req.user._id);
  const response = new ApiResponse(200, teacher, 'Profile fetched');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove, getMyProfile };
