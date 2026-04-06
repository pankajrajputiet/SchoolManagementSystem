const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const SMSNotification = require('../models/SMSNotification');
const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const smsService = require('../services/smsService');
const Notification = require('../models/Notification');

/**
 * Send SMS notification to students/parents
 */
const sendSMS = asyncHandler(async (req, res) => {
  const {
    category,
    message,
    targetClass,
    studentIds,
    metadata = {},
    scheduledAt,
    createAppNotification = true,
  } = req.body;

  // Validate category
  const validCategories = ['fees', 'vacation', 'exam', 'absence', 'emergency', 'custom'];
  if (!validCategories.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  // Custom category requires message
  if (category === 'custom' && !message) {
    throw new ApiError(400, 'Custom message is required for custom category');
  }

  // Get recipients
  let recipients = [];

  if (studentIds && studentIds.length > 0) {
    // Send to specific students
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate('user', 'name')
      .populate('class', 'name section');

    recipients = students
      .filter(s => s.parentPhone)
      .map(s => ({
        student: s._id,
        parentPhone: s.parentPhone,
        studentName: s.user?.name,
        parentName: s.parentName,
        className: `${s.class?.name}-${s.class?.section}`,
      }));
  } else if (targetClass) {
    // Send to all students in a class
    const students = await Student.find({ class: targetClass })
      .populate('user', 'name')
      .populate('class', 'name section');

    recipients = students
      .filter(s => s.parentPhone)
      .map(s => ({
        student: s._id,
        parentPhone: s.parentPhone,
        studentName: s.user?.name,
        parentName: s.parentName,
        className: `${s.class?.name}-${s.class?.section}`,
      }));
  } else {
    throw new ApiError(400, 'Either studentIds or targetClass is required');
  }

  if (recipients.length === 0) {
    throw new ApiError(404, 'No recipients found with valid phone numbers');
  }

  // Generate message from template
  const templateData = {
    schoolName: process.env.SCHOOL_NAME || 'School Management System',
    schoolPhone: process.env.SCHOOL_PHONE,
    ...metadata,
  };

  const smsMessage = category === 'custom' ? message : smsService.getTemplate(category, templateData);

  // Create SMS notification record
  const smsNotification = await SMSNotification.create({
    message: smsMessage,
    category,
    recipients: recipients.map(r => ({
      student: r.student,
      parentPhone: r.parentPhone,
      studentName: r.studentName,
      parentName: r.parentName,
    })),
    totalRecipients: recipients.length,
    status: 'pending',
    scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
    sentBy: req.user._id,
    targetClass,
    metadata,
    createAppNotification,
  });

  // Send SMS immediately or schedule for later
  if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
    // Send immediately
    await processSMSQueue(smsNotification._id);
  }

  const response = new ApiResponse(200, {
    id: smsNotification._id,
    totalRecipients: smsNotification.totalRecipients,
    status: smsNotification.status,
  }, 'SMS notification queued');

  res.status(response.statusCode).json(response);
});

/**
 * Process SMS queue and send messages
 */
const processSMSQueue = async (smsId) => {
  const smsNotification = await SMSNotification.findById(smsId);
  
  if (!smsNotification) {
    throw new ApiError(404, 'SMS notification not found');
  }

  if (smsNotification.status === 'sent') {
    return;
  }

  // Update status to sending
  smsNotification.status = 'sending';
  await smsNotification.save();

  const deliveryReports = [];
  let successCount = 0;
  let failCount = 0;

  // Send SMS to each recipient
  for (const recipient of smsNotification.recipients) {
    const result = await smsService.sendSingleSMS(
      recipient.parentPhone,
      smsNotification.message
    );

    deliveryReports.push({
      recipient: recipient.student.toString(),
      phone: recipient.parentPhone,
      status: result.success ? 'delivered' : 'failed',
      messageId: result.messageId,
      errorCode: result.error,
      timestamp: new Date(),
    });

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Update SMS notification with results
  smsNotification.status = failCount === 0 ? 'sent' : (successCount > 0 ? 'partial' : 'failed');
  smsNotification.successfullySent = successCount;
  smsNotification.failed = failCount;
  smsNotification.sentAt = new Date();
  smsNotification.deliveryReports = deliveryReports;
  await smsNotification.save();

  // Create in-app notifications if enabled
  if (smsNotification.createAppNotification && successCount > 0) {
    await createAppNotificationsForRecipients(smsNotification);
  }

  return {
    total: smsNotification.totalRecipients,
    success: successCount,
    failed: failCount,
  };
};

/**
 * Create in-app notifications for SMS recipients
 */
const createAppNotificationsForRecipients = async (smsNotification) => {
  const appNotification = await Notification.create({
    title: `SMS: ${smsNotification.category.charAt(0).toUpperCase() + smsNotification.category.slice(1)} Alert`,
    message: smsNotification.message,
    type: smsNotification.category === 'emergency' ? 'emergency' : 'general',
    targetRole: 'student',
    targetUsers: smsNotification.recipients.map(r => r.student),
    createdBy: smsNotification.sentBy,
  });

  return appNotification;
};

/**
 * Get SMS notification history
 */
const getSMSHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, status, targetClass } = req.query;
  
  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (targetClass) filter.targetClass = targetClass;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total] = await Promise.all([
    SMSNotification.find(filter)
      .populate('sentBy', 'name email role')
      .populate('targetClass', 'name section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    SMSNotification.countDocuments(filter),
  ]);

  const response = new ApiResponse(200, 'SMS history fetched', {
    data: notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });

  res.status(response.statusCode).json(response);
});

/**
 * Get SMS notification details
 */
const getSMSDetails = asyncHandler(async (req, res) => {
  const smsNotification = await SMSNotification.findById(req.params.id)
    .populate('sentBy', 'name email role')
    .populate('targetClass', 'name section')
    .populate('recipients.student', 'rollNumber');

  if (!smsNotification) {
    throw new ApiError(404, 'SMS notification not found');
  }

  const response = new ApiResponse(200, smsNotification, 'SMS details fetched');
  res.status(response.statusCode).json(response);
});

/**
 * Get SMS statistics
 */
const getSMSStats = asyncHandler(async (req, res) => {
  const stats = await SMSNotification.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: 1 },
        sent: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] },
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
        },
        totalRecipients: { $sum: '$totalRecipients' },
        successfullySent: { $sum: '$successfullySent' },
      },
    },
  ]);

  const overall = await SMSNotification.aggregate([
    {
      $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        totalRecipients: { $sum: '$totalRecipients' },
        totalSent: { $sum: '$successfullySent' },
        totalFailed: { $sum: '$failed' },
      },
    },
  ]);

  const response = new ApiResponse(200, 'SMS statistics fetched', {
    byCategory: stats,
    overall: overall[0] || {
      totalCampaigns: 0,
      totalRecipients: 0,
      totalSent: 0,
      totalFailed: 0,
    },
  });

  res.status(response.statusCode).json(response);
});

/**
 * Get SMS templates
 */
const getTemplates = asyncHandler(async (req, res) => {
  const templates = {
    fees: {
      category: 'fees',
      description: 'Fee reminder or due notification',
      requiredFields: ['parentName', 'studentName', 'className', 'amount', 'dueDate', 'schoolName'],
    },
    vacation: {
      category: 'vacation',
      description: 'School vacation or holiday notification',
      requiredFields: ['parentName', 'startDate', 'endDate', 'reopeningDate', 'reason', 'schoolName'],
    },
    exam: {
      category: 'exam',
      description: 'Exam schedule or result notification',
      requiredFields: ['parentName', 'studentName', 'className', 'examType', 'startDate', 'endDate', 'schoolName'],
    },
    absence: {
      category: 'absence',
      description: 'Student absence alert to parent',
      requiredFields: ['parentName', 'studentName', 'className', 'absentDays', 'schoolName'],
    },
    emergency: {
      category: 'emergency',
      description: 'Emergency alert (high priority)',
      requiredFields: ['parentName', 'message', 'schoolPhone', 'schoolName'],
    },
    custom: {
      category: 'custom',
      description: 'Custom message',
      requiredFields: ['message'],
    },
  };

  const response = new ApiResponse(200, 'SMS templates fetched', templates);
  res.status(response.statusCode).json(response);
});

/**
 * Check SMS service status
 */
const getSMSServiceStatus = asyncHandler(async (req, res) => {
  const status = smsService.getStatus();
  const response = new ApiResponse(200, status, 'SMS service status');
  res.status(response.statusCode).json(response);
});

module.exports = {
  sendSMS,
  getSMSHistory,
  getSMSDetails,
  getSMSStats,
  getTemplates,
  getSMSServiceStatus,
  processSMSQueue,
};
