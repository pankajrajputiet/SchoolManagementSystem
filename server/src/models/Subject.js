const mongoose = require('mongoose');
const { SUBJECT_TYPES } = require('../constants');

const subjectSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    type: {
      type: String,
      enum: Object.values(SUBJECT_TYPES),
      default: SUBJECT_TYPES.THEORY,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: subject code must be unique within a school
subjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
