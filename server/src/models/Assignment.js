const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
        },
        fileUrl: String,
        fileName: String,
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        grade: Number,
        feedback: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ schoolId: 1, class: 1, subject: 1 });
assignmentSchema.index({ schoolId: 1, dueDate: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
