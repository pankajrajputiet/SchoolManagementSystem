const mongoose = require('mongoose');
const { SECTIONS, GENDERS } = require('../constants');

const studentSchema = new mongoose.Schema(
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
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    section: {
      type: String,
      enum: SECTIONS,
      default: 'A',
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: GENDERS,
      required: [true, 'Gender is required'],
    },
    parentName: {
      type: String,
      required: [true, 'Parent name is required'],
      trim: true,
    },
    parentPhone: {
      type: String,
      required: [true, 'Parent phone is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: rollNumber must be unique within a school
studentSchema.index({ schoolId: 1, rollNumber: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, class: 1 });

module.exports = mongoose.model('Student', studentSchema);
