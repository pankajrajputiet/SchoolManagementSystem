const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const subjectService = require('../services/subjectService');

const create = asyncHandler(async (req, res) => {
  const subject = await subjectService.createSubject(req.body);
  const response = new ApiResponse(201, 'Subject created successfully', subject);
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await subjectService.getSubjects(req.query);
  const response = new ApiResponse(200, 'Subjects fetched', result);
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id);
  const response = new ApiResponse(200, 'Subject fetched', subject);
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const subject = await subjectService.updateSubject(req.params.id, req.body);
  const response = new ApiResponse(200, 'Subject updated', subject);
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await subjectService.deleteSubject(req.params.id);
  const response = new ApiResponse(200, 'Subject deleted');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove };
