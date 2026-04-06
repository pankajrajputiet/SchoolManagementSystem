const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const School = require('../models/School');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

/**
 * Get comprehensive system-wide statistics for Super Admin
 */
const getSystemStats = asyncHandler(async (req, res) => {
  // Get school counts
  const totalSchools = await School.countDocuments();
  const activeSchools = await School.countDocuments({ isActive: true });
  const inactiveSchools = await School.countDocuments({ isActive: false });

  // Get user counts by role
  const userStats = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const roleCounts = {
    super_admin: 0,
    school_admin: 0,
    teacher: 0,
    student: 0,
  };

  userStats.forEach((stat) => {
    const role = stat._id.replace(/([A-Z])/g, '_$1').toLowerCase();
    roleCounts[role] = stat.count;
  });

  // Get total users
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });

  // Get student and teacher counts
  const totalStudents = await Student.countDocuments();
  const totalTeachers = await Teacher.countDocuments();

  // Get class count
  const totalClasses = await Class.countDocuments();

  // Get recent schools (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentSchools = await School.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  // Get schools with most students
  const schoolsByStudents = await Student.aggregate([
    { $group: { _id: '$schoolId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'schools',
        localField: '_id',
        foreignField: '_id',
        as: 'school',
      },
    },
    { $unwind: '$school' },
    { $project: { schoolName: '$school.name', studentCount: '$count' } },
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      schools: {
        total: totalSchools,
        active: activeSchools,
        inactive: inactiveSchools,
        recent: recentSchools,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: roleCounts,
      },
      students: {
        total: totalStudents,
      },
      teachers: {
        total: totalTeachers,
      },
      classes: {
        total: totalClasses,
      },
      topSchools: schoolsByStudents,
    }, 'System statistics fetched successfully')
  );
});

module.exports = { getSystemStats };
