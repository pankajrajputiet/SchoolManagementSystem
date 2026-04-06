const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const classService = require('../services/classService');

const create = asyncHandler(async (req, res) => {
  const cls = await classService.createClass(req.body);
  const response = new ApiResponse(201, cls, 'Class created successfully');
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await classService.getClasses(req.query);
  const response = new ApiResponse(200, result,'Classes fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const cls = await classService.getClassById(req.params.id);
  const response = new ApiResponse(200, cls, 'Class fetched');
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const cls = await classService.updateClass(req.params.id, req.body);
  const response = new ApiResponse(200, 'Class updated', cls);
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await classService.deleteClass(req.params.id);
  const response = new ApiResponse(200, 'Class deleted');
  res.status(response.statusCode).json(response);
});

const addStudents = asyncHandler(async (req, res) => {
  const cls = await classService.addStudentsToClass(req.params.id, req.body.studentIds);
  const response = new ApiResponse(200, 'Students added to class', cls);
  res.status(response.statusCode).json(response);
});

const removeStudent = asyncHandler(async (req, res) => {
  const cls = await classService.removeStudentFromClass(req.params.id, req.params.studentId);
  const response = new ApiResponse(200, cls, 'Student removed from class');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove, addStudents, removeStudent };
