const FeeStructure = require('../models/FeeStructure');
const FeePayment = require('../models/FeePayment');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { addSchoolFilter } = require('../middlewares/school');

// @desc    Create fee structure
// @route   POST /api/v1/fees/structure
// @access  School Admin
exports.createFeeStructure = asyncHandler(async (req, res) => {
  const { class: classId, feeType, amount, academicYear, description, dueDate, installmentNumber } = req.body;

  const feeStructure = await FeeStructure.create({
    schoolId: req.schoolId || req.user.schoolId,
    class: classId,
    feeType,
    amount,
    academicYear,
    description,
    dueDate,
    installmentNumber,
  });

  res.status(201).json(
    new ApiResponse(201, feeStructure, 'Fee structure created successfully')
  );
});

// @desc    Get fee structures
// @route   GET /api/v1/fees/structure
// @access  School Admin
exports.getFeeStructures = asyncHandler(async (req, res) => {
  const { classId, academicYear, feeType } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = { schoolId };
  if (classId) query.class = classId;
  if (academicYear) query.academicYear = academicYear;
  if (feeType) query.feeType = feeType;

  const feeStructures = await FeeStructure.find(query)
    .populate('class', 'name section')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, feeStructures, 'Fee structures fetched successfully')
  );
});

// @desc    Update fee structure
// @route   PUT /api/v1/fees/structure/:id
// @access  School Admin
exports.updateFeeStructure = asyncHandler(async (req, res) => {
  const feeStructure = await FeeStructure.findById(req.params.id);

  if (!feeStructure) {
    throw new ApiError(404, 'Fee structure not found');
  }

  if (feeStructure.schoolId.toString() !== (req.schoolId || req.user.schoolId).toString()) {
    throw new ApiError(403, 'Not authorized to update this fee structure');
  }

  const updated = await FeeStructure.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, updated, 'Fee structure updated successfully')
  );
});

// @desc    Delete fee structure
// @route   DELETE /api/v1/fees/structure/:id
// @access  School Admin
exports.deleteFeeStructure = asyncHandler(async (req, res) => {
  const feeStructure = await FeeStructure.findById(req.params.id);

  if (!feeStructure) {
    throw new ApiError(404, 'Fee structure not found');
  }

  if (feeStructure.schoolId.toString() !== (req.schoolId || req.user.schoolId).toString()) {
    throw new ApiError(403, 'Not authorized to delete this fee structure');
  }

  await FeeStructure.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Fee structure deleted successfully')
  );
});

// @desc    Get student fee status
// @route   GET /api/v1/fees/student/:studentId
// @access  School Admin / Student
exports.getStudentFeeStatus = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  // Verify student belongs to school
  const student = await Student.findOne({ _id: studentId, schoolId });
  if (!student) {
    throw new ApiError(404, 'Student not found');
  }

  const query = { schoolId, student: studentId };
  if (academicYear) query.academicYear = academicYear;

  const feePayments = await FeePayment.find(query)
    .populate('feeStructure', 'feeType description')
    .sort({ dueDate: 1 });

  const totalAmount = feePayments.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = feePayments.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const totalPending = totalAmount - totalPaid;

  res.status(200).json(
    new ApiResponse(200, {
      student,
      feePayments,
      summary: {
        totalAmount,
        totalPaid,
        totalPending,
        paidCount: feePayments.filter(f => f.status === 'paid').length,
        pendingCount: feePayments.filter(f => f.status === 'pending' || f.status === 'overdue').length,
      },
    }, 'Student fee status fetched successfully')
  );
});

// @desc    Record fee payment
// @route   POST /api/v1/fees/pay
// @access  School Admin
exports.recordPayment = asyncHandler(async (req, res) => {
  const {
    studentId,
    feeStructureId,
    amount,
    paymentMethod,
    transactionId,
    remarks,
  } = req.body;

  const schoolId = req.schoolId || req.user.schoolId;

  // Get fee payment record
  const feePayment = await FeePayment.findOne({
    _id: feeStructureId,
    schoolId,
    student: studentId,
  });

  if (!feePayment) {
    throw new ApiError(404, 'Fee payment record not found');
  }

  if (feePayment.status === 'paid') {
    throw new ApiError(400, 'Fee already paid in full');
  }

  // Calculate new payment amounts
  const newAmountPaid = feePayment.amountPaid + amount;
  const newBalanceAmount = feePayment.amount - newAmountPaid + (feePayment.lateFee || 0);

  // Update fee payment
  feePayment.amountPaid = newAmountPaid;
  feePayment.balanceAmount = newBalanceAmount;
  feePayment.paymentMethod = paymentMethod;
  feePayment.transactionId = transactionId;
  feePayment.paymentDate = new Date();
  feePayment.paidBy = req.user._id;
  feePayment.remarks = remarks;

  await feePayment.save();

  res.status(200).json(
    new ApiResponse(200, feePayment, 'Payment recorded successfully')
  );
});

// @desc    Get all fee payments (with filters)
// @route   GET /api/v1/fees/payments
// @access  School Admin
exports.getFeePayments = asyncHandler(async (req, res) => {
  const { classId, status, academicYear, studentName } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = { schoolId };
  if (academicYear) query.academicYear = academicYear;
  if (status) query.status = { $in: status.split(',') };

  if (classId) {
    const students = await Student.find({ class: classId, schoolId }).select('_id');
    query.student = { $in: students.map(s => s._id) };
  }

  const feePayments = await FeePayment.find(query)
    .populate('student', 'rollNumber')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'name email phone',
      },
    })
    .sort({ dueDate: 1 });

  // Filter by student name if provided
  let filteredPayments = feePayments;
  if (studentName) {
    filteredPayments = feePayments.filter(fee => 
      fee.student?.user?.name?.toLowerCase().includes(studentName.toLowerCase())
    );
  }

  res.status(200).json(
    new ApiResponse(200, filteredPayments, 'Fee payments fetched successfully')
  );
});

// @desc    Get fee collection statistics
// @route   GET /api/v1/fees/stats
// @access  School Admin
exports.getFeeStats = asyncHandler(async (req, res) => {
  const { academicYear } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = { schoolId };
  if (academicYear) query.academicYear = academicYear;

  const stats = await FeePayment.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalPaid: { $sum: '$amountPaid' },
        totalPending: { $sum: '$balanceAmount' },
      },
    },
  ]);

  const summary = {
    pending: { count: 0, amount: 0, paid: 0, pending: 0 },
    partial: { count: 0, amount: 0, paid: 0, pending: 0 },
    paid: { count: 0, amount: 0, paid: 0, pending: 0 },
    overdue: { count: 0, amount: 0, paid: 0, pending: 0 },
  };

  stats.forEach(stat => {
    summary[stat._id] = {
      count: stat.count,
      amount: stat.totalAmount,
      paid: stat.totalPaid,
      pending: stat.totalPending,
    };
  });

  res.status(200).json(
    new ApiResponse(200, summary, 'Fee statistics fetched successfully')
  );
});

// @desc    Get pending fees
// @route   GET /api/v1/fees/pending
// @access  School Admin
exports.getPendingFees = asyncHandler(async (req, res) => {
  const { classId, academicYear } = req.query;
  const schoolId = req.schoolId || req.user.schoolId;

  const query = {
    schoolId,
    status: { $in: ['pending', 'overdue', 'partial'] },
  };

  if (academicYear) query.academicYear = academicYear;

  const pendingFees = await FeePayment.find(query)
    .populate('student', 'rollNumber')
    .populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'name email phone',
      },
    })
    .populate({
      path: 'student',
      populate: {
        path: 'class',
        select: 'name section',
      },
    })
    .sort({ dueDate: 1 });

  res.status(200).json(
    new ApiResponse(200, pendingFees, 'Pending fees fetched successfully')
  );
});

// @desc    Create fee records for all students in a class
// @route   POST /api/v1/fees/generate
// @access  School Admin
exports.generateFeeRecords = asyncHandler(async (req, res) => {
  const { classId, academicYear, feeType, amount, dueDate, description } = req.body;
  const schoolId = req.schoolId || req.user.schoolId;

  // Create or update fee structure
  let feeStructure = await FeeStructure.findOne({
    schoolId,
    class: classId,
    feeType,
    academicYear,
  });

  if (feeStructure) {
    throw new ApiError(409, 'Fee structure already exists for this class and type');
  }

  feeStructure = await FeeStructure.create({
    schoolId,
    class: classId,
    feeType,
    amount,
    academicYear,
    description,
    dueDate,
  });

  // Get all students in the class
  const students = await Student.find({ class: classId, schoolId });

  // Create fee payment records for each student
  const feePayments = students.map(student => ({
    schoolId,
    student: student._id,
    feeStructure: feeStructure._id,
    feeType,
    amount,
    academicYear,
    dueDate,
    status: 'pending',
  }));

  await FeePayment.insertMany(feePayments);

  res.status(201).json(
    new ApiResponse(201, {
      feeStructure,
      recordsCreated: students.length,
    }, 'Fee records generated successfully')
  );
});
