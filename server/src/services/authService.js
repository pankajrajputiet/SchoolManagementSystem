const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      schoolId: user.schoolId || null,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin || false,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

const registerUser = async (userData) => {
  const existingUser = await User.findOne({
    email: userData.email,
    schoolId: userData.schoolId || null,
  });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create(userData);
  const token = generateToken(user);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Account has been deactivated');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  return { message: 'Password updated successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
  generateToken,
};
