const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const createNotification = async (data, userId) => {
  const notification = await Notification.create({
    ...data,
    createdBy: userId,
  });
  return notification;
};

const getNotifications = async (query, user, schoolId = null) => {
  const filter = {
    isActive: true,
    $or: [
      { targetRole: 'all' },
      { targetRole: user.role },
      { targetUsers: user._id },
    ],
  };
  
  // Add schoolId filter if provided
  if (schoolId) {
    filter.schoolId = schoolId;
  }

  return paginate(Notification, query, filter, [
    { path: 'createdBy', select: 'name role' },
  ]);
};

const getNotificationById = async (id) => {
  const notification = await Notification.findById(id).populate(
    'createdBy',
    'name role'
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  return notification;
};

const updateNotification = async (id, data) => {
  const notification = await Notification.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!notification) throw new ApiError(404, 'Notification not found');
  return notification;
};

const deleteNotification = async (id) => {
  const notification = await Notification.findByIdAndDelete(id);
  if (!notification) throw new ApiError(404, 'Notification not found');
  return notification;
};

const markAsRead = async (id, userId) => {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { $addToSet: { readBy: userId } },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  return notification;
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  markAsRead,
};
