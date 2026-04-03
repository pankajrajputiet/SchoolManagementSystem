const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants');

/**
 * Middleware to enforce school-based data isolation
 * - Super Admin: Can access all schools
 * - School Admin/Teacher/Student: Can only access their own school's data
 */
const schoolAccess = asyncHandler(async (req, _res, next) => {
  const { user, schoolId, isSuperAdmin } = req;

  // Super admin can access all schools
  if (isSuperAdmin || user.role === ROLES.SUPER_ADMIN) {
    // If schoolId param provided, use it; otherwise allow all
    req.querySchoolId = req.params.schoolId || req.query.schoolId || null;
    return next();
  }

  // For non-super admins, enforce school isolation
  if (!schoolId && !user.schoolId) {
    throw new ApiError(403, 'No school associated with your account');
  }

  // Use the user's schoolId for filtering
  req.querySchoolId = user.schoolId;

  // Prevent accessing other schools' data
  if (req.params.schoolId && req.params.schoolId !== user.schoolId.toString()) {
    throw new ApiError(403, 'You do not have permission to access this school');
  }

  next();
});

/**
 * Middleware to restrict access to super admin only
 */
const superAdminOnly = (req, _res, next) => {
  if (!req.isSuperAdmin && req.user.role !== ROLES.SUPER_ADMIN) {
    throw new ApiError(403, 'Access denied. Super admin only.');
  }
  next();
};

/**
 * Middleware to restrict access to school admin or higher
 */
const schoolAdminOrHigher = (req, _res, next) => {
  const allowedRoles = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.ADMIN];
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'Access denied. School admin or higher required.');
  }
  next();
};

/**
 * Helper function to add school filter to query
 * Automatically filters by schoolId unless user is super admin
 */
const addSchoolFilter = (query, req) => {
  const { isSuperAdmin, querySchoolId } = req;

  // Don't filter for super admin unless they specified a school
  if (isSuperAdmin && !querySchoolId) {
    return query;
  }

  // Add school filter
  const schoolId = querySchoolId || req.schoolId || req.user.schoolId;
  if (schoolId) {
    query.schoolId = schoolId;
  }

  return query;
};

module.exports = {
  schoolAccess,
  superAdminOnly,
  schoolAdminOrHigher,
  addSchoolFilter,
};
