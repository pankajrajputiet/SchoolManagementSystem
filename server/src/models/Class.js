const mongoose = require('mongoose');
const { SECTIONS } = require('../constants');

const classSchema = new mongoose.Schema(
  {
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

classSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
