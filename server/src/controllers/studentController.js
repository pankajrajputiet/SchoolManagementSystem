const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const studentService = require('../services/studentService');

const create = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body, req.user);
  const response = new ApiResponse(201, student, 'Student created successfully');
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await studentService.getStudents(req.query);
  const response = new ApiResponse(200, result, 'Students fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  const response = new ApiResponse(200, student, 'Student fetched');
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  const response = new ApiResponse(200, student, 'Student updated');
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  const response = new ApiResponse(200, null, 'Student deleted');
  res.status(response.statusCode).json(response);
});

const getMyProfile = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentByUserId(req.user._id);
  const response = new ApiResponse(200, student, 'Profile fetched');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove, getMyProfile };
