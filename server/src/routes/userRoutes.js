const router = require('express').Router();
const User = require('../models/User');
const School = require('../models/School');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { ROLES } = require('../constants');

router.use(auth);

// @desc    Get all users (Super Admin only)
// @route   GET /api/v1/users
// @access  Super Admin
router.get(
  '/',
  role(ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const { limit = 50, page = 1, role: userRole, schoolId, isActive } = req.query;

    const query = {};
    if (userRole) query.role = userRole;
    if (schoolId) query.schoolId = schoolId;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .populate('schoolId', 'name code')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json(
      new ApiResponse(200, {
        data: users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      }, 'Users fetched successfully')
    );
  })
);

// @desc    Get user by ID (Super Admin only)
// @route   GET /api/v1/users/:id
// @access  Super Admin
router.get(
  '/:id',
  role(ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .populate('schoolId', 'name code')
      .select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User fetched successfully')
    );
  })
);

// @desc    Update user active status (Super Admin only)
// @route   PUT /api/v1/users/:id
// @access  Super Admin
router.put(
  '/:id',
  role(ROLES.SUPER_ADMIN),
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent super admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString() && isActive === false) {
      throw new ApiError(400, 'Cannot deactivate your own account');
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, user, 'User updated successfully')
    );
  })
);

module.exports = router;
