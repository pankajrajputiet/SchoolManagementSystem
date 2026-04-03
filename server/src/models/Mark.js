const mongoose = require('mongoose');
const { EXAM_TYPES } = require('../constants');

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
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
    examType: {
      type: String,
      enum: Object.values(EXAM_TYPES),
      required: [true, 'Exam type is required'],
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: 0,
    },
    grade: {
      type: String,
    },
    remarks: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

markSchema.index(
  { student: 1, subject: 1, examType: 1, academicYear: 1 },
  { unique: true }
);

// Auto-calculate grade before save
markSchema.pre('save', function () {
  const percentage = (this.marksObtained / this.totalMarks) * 100;
  if (percentage >= 90) this.grade = 'A+';
  else if (percentage >= 80) this.grade = 'A';
  else if (percentage >= 70) this.grade = 'B+';
  else if (percentage >= 60) this.grade = 'B';
  else if (percentage >= 50) this.grade = 'C';
  else if (percentage >= 40) this.grade = 'D';
  else this.grade = 'F';
});

module.exports = mongoose.model('Mark', markSchema);
