const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
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
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    academicYear: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue', 'waived'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'cheque', 'online'],
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentDate: {
      type: Date,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
feePaymentSchema.index({ schoolId: 1, student: 1, academicYear: 1 });
feePaymentSchema.index({ schoolId: 1, status: 1, academicYear: 1 });
feePaymentSchema.index({ dueDate: 1 });

// Auto-calculate balance and status
feePaymentSchema.pre('save', function () {
  this.balanceAmount = this.amount - this.amountPaid + (this.lateFee || 0);
  
  if (this.amountPaid === 0) {
    this.status = 'pending';
  } else if (this.amountPaid >= this.amount + (this.lateFee || 0)) {
    this.status = 'paid';
  } else {
    this.status = 'partial';
  }
  
  // Mark as overdue if past due date and not fully paid
  if (this.dueDate < new Date() && this.status !== 'paid') {
    this.isOverdue = true;
    if (this.status === 'pending') {
      this.status = 'overdue';
    }
  }
});

// Generate receipt number
feePaymentSchema.pre('save', async function () {
  if (!this.receiptNumber && this.status === 'paid') {
    const count = await mongoose.model('FeePayment').countDocuments();
    this.receiptNumber = `REC-${Date.now()}-${count + 1}`;
  }
});

const FeePayment = mongoose.model('FeePayment', feePaymentSchema);

module.exports = FeePayment;
