const mongoose = require('mongoose');

// Salary Structure - Defines salary components for staff
const salaryStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    staffType: {
      type: String,
      enum: ['teacher', 'admin_staff', 'support_staff', 'librarian', 'lab_assistant', 'other'],
      required: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      hra: { type: Number, default: 0 }, // House Rent Allowance
      da: { type: Number, default: 0 }, // Dearness Allowance
      ta: { type: Number, default: 0 }, // Travel Allowance
      medical: { type: Number, default: 0 },
      special: { type: Number, default: 0 },
    },
    deductions: {
      pf: { type: Number, default: 0 }, // Provident Fund
      tax: { type: Number, default: 0 }, // Tax
      esi: { type: Number, default: 0 }, // Employee State Insurance
      other: { type: Number, default: 0 },
    },
    grossSalary: {
      type: Number,
    },
    netSalary: {
      type: Number,
    },
    effectiveFrom: {
      type: Date,
      required: true,
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

// Indexes
salaryStructureSchema.index({ schoolId: 1, staffType: 1, designation: 1 });

// Calculate gross and net salary before save
salaryStructureSchema.pre('save', function () {
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
});

const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);

module.exports = SalaryStructure;
