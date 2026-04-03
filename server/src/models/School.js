const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 20,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    adminContact: {
      name: String,
      phone: String,
      email: String,
    },
    principalName: {
      type: String,
      trim: true,
    },
    establishedYear: {
      type: Number,
    },
    affiliatedBoard: {
      type: String,
      enum: ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'Other'],
    },
    schoolType: {
      type: String,
      enum: ['public', 'private', 'government', 'international'],
      default: 'private',
    },
    logo: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxStudents: {
      type: Number,
      default: 5000,
    },
    currentStudents: {
      type: Number,
      default: 0,
    },
    totalTeachers: {
      type: Number,
      default: 0,
    },
    academicYear: {
      type: String,
      default: '2024-2025',
    },
    settings: {
      smsEnabled: { type: Boolean, default: false },
      emailEnabled: { type: Boolean, default: false },
      autoAttendance: { type: Boolean, default: false },
      gradingScale: { type: String, default: 'percentage' },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
schoolSchema.index({ code: 1, isActive: 1 });
schoolSchema.index({ affiliatedBoard: 1, schoolType: 1 });

// Static method to find school by code
schoolSchema.statics.findByCode = async function (code) {
  return this.findOne({ code: code.toUpperCase(), isActive: true });
};

// Pre-save hook to auto-generate code if not provided
schoolSchema.pre('save', function () {
  if (!this.code && this.name) {
    this.code = this.name.substring(0, 3).toUpperCase() + Date.now().toString().slice(-4);
  }
});

const School = mongoose.model('School', schoolSchema);

module.exports = School;
