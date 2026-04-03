const SalaryStructure = require('../models/SalaryStructure');
const SalaryPayment = require('../models/SalaryPayment');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create salary structure
// @route   POST /api/v1/salary/structure
// @access  School Admin
exports.createSalaryStructure = asyncHandler(async (req, res) => {
  const { staffType, designation, basicSalary, allowances, deductions, effectiveFrom } = req.body;

  const salaryStructure = await SalaryStructure.create({
    schoolId: req.schoolId || req.user.schoolId,
    staffType,
    designation,
    basicSalary,
    allowances,
    deductions,
    effectiveFrom,
  });

  res.status(201).json(
    new ApiResponse(201, salaryStructure, 'Salary structure created successfully')
  );
});

// @desc    Get salary structures
// @route   GET /api/v1/salary/structure
// @access  School Admin
exports.getSalaryStructures = asyncHandler(async (req, res) => {
  const { staffType, designation } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = { schoolId };
  if (staffType) query.staffType = staffType;
  if (designation) query.designation = designation;

  const structures = await SalaryStructure.find(query)
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, structures, 'Salary structures fetched successfully')
  );
});

// @desc    Update salary structure
// @route   PUT /api/v1/salary/structure/:id
// @access  School Admin
exports.updateSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await SalaryStructure.findById(req.params.id);

  if (!structure) {
    throw new ApiError(404, 'Salary structure not found');
  }

  if (structure.schoolId.toString() !== (req.schoolId || req.user.schoolId).toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  const updated = await SalaryStructure.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, updated, 'Salary structure updated successfully')
  );
});

// @desc    Delete salary structure
// @route   DELETE /api/v1/salary/structure/:id
// @access  School Admin
exports.deleteSalaryStructure = asyncHandler(async (req, res) => {
  const structure = await SalaryStructure.findById(req.params.id);

  if (!structure) {
    throw new ApiError(404, 'Salary structure not found');
  }

  if (structure.schoolId.toString() !== (req.schoolId || req.user.schoolId).toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  await SalaryStructure.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Salary structure deleted successfully')
  );
});

// @desc    Generate monthly salary for all staff
// @route   POST /api/v1/salary/generate
// @access  School Admin
exports.generateMonthlySalary = asyncHandler(async (req, res) => {
  const { month, year, dueDate } = req.body;
  const schoolId = req.schoolId || req.user.schoolId;

  // Get all active staff (teachers for now)
  const teachers = await Teacher.find({ schoolId }).populate('user');
  
  // Get all salary structures for this school
  const structures = await SalaryStructure.find({ 
    schoolId, 
    isActive: true 
  });

  const salaryRecords = [];

  for (const teacher of teachers) {
    // Check if salary already generated
    const existing = await SalaryPayment.findOne({
      schoolId,
      staff: teacher.user._id,
      month,
      year,
    });

    if (existing) continue;

    // Find matching salary structure
    let structure = structures.find(s => 
      s.staffType === 'teacher' && 
      s.designation === (teacher.qualification || 'Teacher')
    );

    // Use default structure if no match
    if (!structure) {
      structure = structures.find(s => s.staffType === 'teacher');
    }

    if (!structure) continue;

    salaryRecords.push({
      schoolId,
      staff: teacher.user._id,
      staffType: 'teacher',
      month,
      year,
      salaryStructure: structure._id,
      basicSalary: structure.basicSalary,
      allowances: structure.allowances,
      deductions: structure.deductions,
      grossSalary: structure.grossSalary,
      netSalary: structure.netSalary,
      dueDate: dueDate || new Date(year, month, 1),
    });
  }

  if (salaryRecords.length > 0) {
    await SalaryPayment.insertMany(salaryRecords);
  }

  res.status(201).json(
    new ApiResponse(201, {
      recordsCreated: salaryRecords.length,
      month,
      year,
    }, 'Monthly salary generated successfully')
  );
});

// @desc    Get salary payments
// @route   GET /api/v1/salary/payments
// @access  School Admin
exports.getSalaryPayments = asyncHandler(async (req, res) => {
  const { month, year, status, staffType } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = { schoolId };
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (status) query.status = status;
  if (staffType) query.staffType = staffType;

  const payments = await SalaryPayment.find(query)
    .populate('staff', 'name email phone')
    .sort({ year: -1, month: -1 });

  res.status(200).json(
    new ApiResponse(200, payments, 'Salary payments fetched successfully')
  );
});

// @desc    Record salary payment
// @route   POST /api/v1/salary/pay
// @access  School Admin
exports.recordSalaryPayment = asyncHandler(async (req, res) => {
  const {
    salaryId,
    amount,
    paymentMethod,
    transactionId,
    bankAccountNumber,
    ifscCode,
    remarks,
  } = req.body;

  const payment = await SalaryPayment.findById(salaryId);

  if (!payment) {
    throw new ApiError(404, 'Salary payment record not found');
  }

  if (payment.schoolId.toString() !== (req.schoolId || req.user.schoolId).toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  if (payment.status === 'paid') {
    throw new ApiError(400, 'Salary already paid in full');
  }

  payment.paidAmount = (payment.paidAmount || 0) + amount;
  payment.paymentMethod = paymentMethod;
  payment.transactionId = transactionId;
  payment.bankAccountNumber = bankAccountNumber;
  payment.ifscCode = ifscCode;
  payment.paymentDate = new Date();
  payment.paidBy = req.user._id;
  payment.remarks = remarks;

  await payment.save();

  res.status(200).json(
    new ApiResponse(200, payment, 'Salary payment recorded successfully')
  );
});

// @desc    Get salary statistics
// @route   GET /api/v1/salary/stats
// @access  School Admin
exports.getSalaryStats = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = { schoolId };
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);

  const stats = await SalaryPayment.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalNetSalary: { $sum: '$netSalary' },
        totalPaid: { $sum: '$paidAmount' },
        totalPending: { $sum: '$balanceAmount' },
      },
    },
  ]);

  const summary = {
    pending: { count: 0, netSalary: 0, paid: 0, pending: 0 },
    partial: { count: 0, netSalary: 0, paid: 0, pending: 0 },
    paid: { count: 0, netSalary: 0, paid: 0, pending: 0 },
    overdue: { count: 0, netSalary: 0, paid: 0, pending: 0 },
  };

  stats.forEach(stat => {
    summary[stat._id] = {
      count: stat.count,
      netSalary: stat.totalNetSalary,
      paid: stat.totalPaid,
      pending: stat.totalPending,
    };
  });

  res.status(200).json(
    new ApiResponse(200, summary, 'Salary statistics fetched successfully')
  );
});

// @desc    Get pending salaries
// @route   GET /api/v1/salary/pending
// @access  School Admin
exports.getPendingSalaries = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = {
    schoolId,
    status: { $in: ['pending', 'overdue', 'partial'] },
  };

  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);

  const pendingSalaries = await SalaryPayment.find(query)
    .populate('staff', 'name email phone')
    .sort({ dueDate: 1 });

  res.status(200).json(
    new ApiResponse(200, pendingSalaries, 'Pending salaries fetched successfully')
  );
});

// @desc    Get staff member's salary history
// @route   GET /api/v1/salary/staff/:staffId
// @access  School Admin / Staff
exports.getStaffSalaryHistory = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const { year } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = { schoolId, staff: staffId };
  if (year) query.year = parseInt(year);

  const salaryHistory = await SalaryPayment.find(query)
    .sort({ year: -1, month: -1 });

  const totalPaid = salaryHistory.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalPending = salaryHistory.reduce((sum, s) => sum + s.balanceAmount, 0);

  res.status(200).json(
    new ApiResponse(200, {
      salaryHistory,
      summary: {
        totalRecords: salaryHistory.length,
        totalPaid,
        totalPending,
      },
    }, 'Salary history fetched successfully')
  );
});
