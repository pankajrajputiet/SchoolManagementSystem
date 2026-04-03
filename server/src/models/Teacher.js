const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: employeeId must be unique within a school
teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ schoolId: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
