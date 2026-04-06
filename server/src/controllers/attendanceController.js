const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const attendanceService = require('../services/attendanceService');

const markAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.markAttendance(req.body, req.user._id);
  const response = new ApiResponse(201, result.message);
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendance(req.query);
  const response = new ApiResponse(200, result, 'Attendance fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const record = await attendanceService.getAttendanceById(req.params.id);
  const response = new ApiResponse(200, record, 'Attendance record fetched');
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const record = await attendanceService.updateAttendance(req.params.id, req.body);
  const response = new ApiResponse(200, 'Attendance updated', record);
  res.status(response.statusCode).json(response);
});

const getReport = asyncHandler(async (req, res) => {
  const report = await attendanceService.getAttendanceReport(req.query);
  const response = new ApiResponse(200, report, 'Attendance report');
  res.status(response.statusCode).json(response);
});

module.exports = { markAttendance, getAll, getById, update, getReport };
