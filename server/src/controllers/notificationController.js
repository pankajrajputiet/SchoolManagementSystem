const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notificationService');

const create = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body, req.user._id);
  const response = new ApiResponse(201, notification, 'Notification created');
  res.status(response.statusCode).json(response);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.query, req.user);
  const response = new ApiResponse(200, result, 'Notifications fetched');
  res.status(response.statusCode).json(response);
});

const getById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id);
  const response = new ApiResponse(200, 'Notification fetched', notification);
  res.status(response.statusCode).json(response);
});

const update = asyncHandler(async (req, res) => {
  const notification = await notificationService.updateNotification(req.params.id, req.body);
  const response = new ApiResponse(200, 'Notification updated', notification);
  res.status(response.statusCode).json(response);
});

const remove = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id);
  const response = new ApiResponse(200, 'Notification deleted');
  res.status(response.statusCode).json(response);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  const response = new ApiResponse(200, notification, 'Notification marked as read');
  res.status(response.statusCode).json(response);
});

module.exports = { create, getAll, getById, update, remove, markAsRead };
