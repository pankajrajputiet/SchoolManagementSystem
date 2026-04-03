const mongoose = require('mongoose');

// Fee Structure Schema - Defines fee types and amounts for each class
const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    feeType: {
      type: String,
      enum: ['tuition', 'transport', 'library', 'sports', 'lab', 'exam', 'annual', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    academicYear: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    installmentNumber: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint: fee structure per class, type, and academic year
feeStructureSchema.index({ schoolId: 1, class: 1, feeType: 1, academicYear: 1 }, { unique: true });
feeStructureSchema.index({ schoolId: 1, academicYear: 1 });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

module.exports = FeeStructure;
