const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const markService = require('../services/markService');

const create = asyncHandler(async (req, res) => {
  const result = await markService.createMarks(req.body, req.user._id);
  const response = new ApiResponse(201, result.data, result.message);
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await markService.getMarks(req.query);
  const response = new ApiResponse(200, result, 'Marks fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const mark = await markService.getMarkById(req.params.id);
  const response = new ApiResponse(200, 'Mark fetched', mark);
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const mark = await markService.updateMark(req.params.id, req.body);
  const response = new ApiResponse(200, 'Mark updated', mark);
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await markService.deleteMark(req.params.id);
  const response = new ApiResponse(200, 'Mark deleted');
  res.status(response.statusCode).json(response);
});

const getReport = asyncHandler(async (req, res) => {
  const report = await markService.getMarksReport(req.query);
  const response = new ApiResponse(200, report, 'Marks report');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove, getReport };
