const mongoose = require('mongoose');

const salaryPaymentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    staffType: {
      type: String,
      enum: ['teacher', 'admin_staff', 'support_staff', 'librarian', 'lab_assistant', 'other'],
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      hra: { type: Number, default: 0 },
      da: { type: Number, default: 0 },
      ta: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      special: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'cheque', 'upi'],
    },
    paymentDate: {
      type: Date,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    remarks: {
      type: String,
      trim: true,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    lateFee: {
      type: Number,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
salaryPaymentSchema.index({ schoolId: 1, staff: 1, month: 1, year: 1 }, { unique: true });
salaryPaymentSchema.index({ schoolId: 1, status: 1, month: 1, year: 1 });
salaryPaymentSchema.index({ schoolId: 1, staffType: 1, month: 1, year: 1 });

// Auto-calculate values before save
salaryPaymentSchema.pre('save', function () {
  const totalAllowances = 
    (this.allowances.hra || 0) +
    (this.allowances.da || 0) +
    (this.allowances.ta || 0) +
    (this.allowances.medical || 0) +
    (this.allowances.special || 0);

  const totalDeductions =
    (this.deductions.pf || 0) +
    (this.deductions.tax || 0) +
    (this.deductions.esi || 0) +
    (this.deductions.other || 0);

  this.grossSalary = this.basicSalary + totalAllowances;
  this.netSalary = this.grossSalary - totalDeductions;
  this.balanceAmount = this.netSalary - this.paidAmount + (this.lateFee || 0);

  // Update status
  if (this.paidAmount === 0) {
    this.status = 'pending';
  } else if (this.paidAmount >= this.netSalary + (this.lateFee || 0)) {
    this.status = 'paid';
  } else {
    this.status = 'partial';
  }

  // Check if overdue
  if (this.dueDate < new Date() && this.status !== 'paid') {
    this.status = 'overdue';
    this.isLate = true;
  }
});

const SalaryPayment = mongoose.model('SalaryPayment', salaryPaymentSchema);

module.exports = SalaryPayment;
