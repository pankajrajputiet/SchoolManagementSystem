const School = require('../models/School');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get active schools (Public - for login page)
// @route   GET /api/v1/schools/list
// @access  Public
exports.getActiveSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({ isActive: true })
    .select('name code logo address phone email')
    .sort({ name: 1 });

  res.status(200).json(
    new ApiResponse(200, schools, 'Active schools fetched successfully')
  );
});

// @desc    Create a new school (Super Admin only)
// @route   POST /api/v1/schools
// @access  Super Admin
exports.createSchool = asyncHandler(async (req, res) => {
  const { adminName, adminEmail, adminPassword, ...schoolData } = req.body;

  // Create the school
  const school = await School.create(schoolData);

  // Create school admin user if admin credentials provided
  let schoolAdmin = null;
  if (adminName && adminEmail && adminPassword) {
    schoolAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'schooladmin',
      schoolId: school._id,
      phone: schoolData.phone || '',
      isActive: true,
    });
  }

  res.status(201).json(
    new ApiResponse(201, {
      school,
      adminCreated: !!schoolAdmin,
      admin: schoolAdmin ? { id: schoolAdmin._id, name: schoolAdmin.name, email: schoolAdmin.email } : null,
    }, 'School created successfully')
  );
});

// @desc    Get all schools (Super Admin only)
// @route   GET /api/v1/schools
// @access  Super Admin
exports.getAllSchools = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const schools = await School.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await School.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      data: schools,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    })
  );
});

// @desc    Get school by ID
// @route   GET /api/v1/schools/:id
// @access  Super Admin / School Admin (own school only)
exports.getSchoolById = asyncHandler(async (req, res) => {
  const { isSuperAdmin, user } = req;

  const school = await School.findById(req.params.id);

  if (!school) {
    throw new ApiError(404, 'School not found');
  }

  // Non-super admins can only view their own school
  if (!isSuperAdmin && school._id.toString() !== user.schoolId.toString()) {
    throw new ApiError(403, 'You do not have permission to view this school');
  }

  res.status(200).json(
    new ApiResponse(200, school, 'School fetched successfully')
  );
});

// @desc    Update school
// @route   PUT /api/v1/schools/:id
// @access  Super Admin / School Admin (own school only)
exports.updateSchool = asyncHandler(async (req, res) => {
  const { isSuperAdmin, user } = req;

  const school = await School.findById(req.params.id);

  if (!school) {
    throw new ApiError(404, 'School not found');
  }

  // Non-super admins can only update their own school
  if (!isSuperAdmin && school._id.toString() !== user.schoolId.toString()) {
    throw new ApiError(403, 'You do not have permission to update this school');
  }

  const updatedSchool = await School.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, updatedSchool, 'School updated successfully')
  );
});

// @desc    Delete school (deactivate)
// @route   DELETE /api/v1/schools/:id
// @access  Super Admin only
exports.deleteSchool = asyncHandler(async (req, res) => {
  const school = await School.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!school) {
    throw new ApiError(404, 'School not found');
  }

  // Deactivate all users in the school
  await User.updateMany(
    { schoolId: school._id },
    { isActive: false }
  );

  res.status(200).json(
    new ApiResponse(200, school, 'School deactivated successfully')
  );
});

// @desc    Recover a deleted school (reactivate)
// @route   PATCH /api/v1/schools/:id/recover
// @access  Super Admin only
exports.recoverSchool = asyncHandler(async (req, res) => {
  const school = await School.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  if (!school) {
    throw new ApiError(404, 'School not found');
  }

  // Reactivate all users in the school
  await User.updateMany(
    { schoolId: school._id },
    { isActive: true }
  );

  res.status(200).json(
    new ApiResponse(200, school, 'School recovered successfully')
  );
});

// @desc    Get school statistics
// @route   GET /api/v1/schools/:id/stats
// @access  Super Admin / School Admin
exports.getSchoolStats = asyncHandler(async (req, res) => {
  const { isSuperAdmin, user } = req;
  const schoolId = isSuperAdmin ? req.params.id : user.schoolId;

  // Verify access
  if (!isSuperAdmin && schoolId !== user.schoolId.toString()) {
    throw new ApiError(403, 'You do not have permission to view these stats');
  }

  const school = await School.findById(schoolId);
  if (!school) {
    throw new ApiError(404, 'School not found');
  }

  // Count users by role
  const userStats = await User.aggregate([
    { $match: { schoolId: school._id, isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const stats = {
    school: school,
    users: {
      superadmin: 0,
      schooladmin: 0,
      teacher: 0,
      student: 0,
    },
  };

  userStats.forEach((stat) => {
    stats.users[stat._id] = stat.count;
  });

  res.status(200).json(
    new ApiResponse(200, stats, 'School stats fetched successfully')
  );
});

// @desc    Get current user's school
// @route   GET /api/v1/schools/my-school
// @access  School Admin / Teacher / Student
exports.getMySchool = asyncHandler(async (req, res) => {
  const { user, isSuperAdmin } = req;

  if (isSuperAdmin) {
    throw new ApiError(400, 'Super admin does not have an associated school');
  }

  if (!user.schoolId) {
    throw new ApiError(404, 'No school associated with your account');
  }

  const school = await School.findById(user.schoolId);

  if (!school) {
    throw new ApiError(404, 'School not found');
  }

  res.status(200).json(
    new ApiResponse(200, school, 'School fetched successfully')
  );
});
