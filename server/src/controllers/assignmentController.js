const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const assignmentService = require('../services/assignmentService');
const Student = require('../models/Student');
const ApiError = require('../utils/ApiError');

const create = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.createAssignment(
    req.body,
    req.user._id,
    req.user.schoolId,
    req.files
  );
  const response = new ApiResponse(201, assignment, 'Assignment created');
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await assignmentService.getAssignments(req.query, req.querySchoolId);
  const response = new ApiResponse(200, result, 'Assignments fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id);
  const response = new ApiResponse(200, assignment, 'Assignment fetched');
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(
    req.params.id,
    req.body,
    req.user._id
  );
  const response = new ApiResponse(200, 'Assignment updated', assignment);
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await assignmentService.deleteAssignment(req.params.id, req.user._id, req.user.role);
  const response = new ApiResponse(200, 'Assignment deleted');
  res.status(response.statusCode).json(response);
});

const submit = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'File is required');

  const student = await Student.findOne({ user: req.user._id });
  if (!student) throw new ApiError(404, 'Student profile not found');

  const assignment = await assignmentService.submitAssignment(
    req.params.id,
    student._id,
    req.file
  );
  const response = new ApiResponse(200, 'Assignment submitted', assignment);
  res.status(response.statusCode).json(response);
});

const grade = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.gradeSubmission(
    req.params.id,
    req.params.submissionId,
    req.body
  );
  const response = new ApiResponse(200, assignment, 'Submission graded');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove, submit, grade };
