const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const studentService = require('../services/studentService');

const create = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  const response = new ApiResponse(201, 'Student created successfully', student);
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await studentService.getStudents(req.query);
  const response = new ApiResponse(200, 'Students fetched', result);
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  const response = new ApiResponse(200, 'Student fetched', student);
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  const response = new ApiResponse(200, 'Student updated', student);
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  const response = new ApiResponse(200, 'Student deleted');
  res.status(response.statusCode).json(response);
});

const getMyProfile = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentByUserId(req.user._id);
  const response = new ApiResponse(200, 'Profile fetched', student);
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove, getMyProfile };
