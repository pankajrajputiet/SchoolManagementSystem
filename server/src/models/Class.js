const mongoose = require('mongoose');
const { SECTIONS } = require('../constants');

const classSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    section: {
      type: String,
      enum: SECTIONS,
      default: 'A',
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    maxStrength: {
      type: Number,
      default: 40,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: class name+section+academicYear must be unique within a school
classSchema.index({ schoolId: 1, name: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
