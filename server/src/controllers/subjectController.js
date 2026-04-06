const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const subjectService = require('../services/subjectService');

const create = asyncHandler(async (req, res) => {
  const subject = await subjectService.createSubject(req.body, req.user);
  const response = new ApiResponse(201, subject, 'Subject created successfully');
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await subjectService.getSubjects(req.query, req.querySchoolId);
  const response = new ApiResponse(200, result, 'Subjects fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const subject = await subjectService.getSubjectById(req.params.id);
  const response = new ApiResponse(200, subject, 'Subject fetched');
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const subject = await subjectService.updateSubject(req.params.id, req.body);
  const response = new ApiResponse(200, subject, 'Subject updated');
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await subjectService.deleteSubject(req.params.id);
  const response = new ApiResponse(200, 'Subject deleted');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove };
