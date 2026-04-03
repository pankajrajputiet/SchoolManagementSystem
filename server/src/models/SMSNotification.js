const mongoose = require('mongoose');

const smsNotificationSchema = new mongoose.Schema(
  {
    // Message content
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    
    // SMS category
    category: {
      type: String,
      enum: ['fees', 'vacation', 'exam', 'absence', 'emergency', 'custom'],
      required: [true, 'Category is required'],
    },
    
    // Recipients
    recipients: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      parentPhone: {
        type: String,
        required: true,
      },
      studentName: String,
      parentName: String,
    }],
    
    // Delivery status
    status: {
      type: String,
      enum: ['pending', 'sending', 'sent', 'failed', 'partial'],
      default: 'pending',
    },
    
    // Sending details
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    
    sentAt: {
      type: Date,
    },
    
    // Delivery tracking
    totalRecipients: {
      type: Number,
      default: 0,
    },
    
    successfullySent: {
      type: Number,
      default: 0,
    },
    
    failed: {
      type: Number,
      default: 0,
    },
    
    // Delivery reports from SMS provider
    deliveryReports: [{
      recipient: String,
      phone: String,
      status: String,
      messageId: String,
      errorCode: String,
      errorMessage: String,
      timestamp: Date,
    }],
    
    // Metadata
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Optional filters
    targetClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    
    // Additional context
    metadata: {
      type: Map,
      of: String,
    },
    
    // Whether to also create in-app notification
    createAppNotification: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
smsNotificationSchema.index({ category: 1, status: 1 });
smsNotificationSchema.index({ createdAt: -1 });
smsNotificationSchema.index({ targetClass: 1 });

module.exports = mongoose.model('SMSNotification', smsNotificationSchema);
