const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { ROLES } = require('../constants');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const createTeacher = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: ROLES.TEACHER,
    phone: data.phone,
    schoolId: data.schoolId,
  });

  const teacher = await Teacher.create({
    user: user._id,
    schoolId: data.schoolId,
    employeeId: data.employeeId,
    qualification: data.qualification,
    experience: data.experience,
    salary: data.salary,
  });

  return teacher.populate({ path: 'user', select: '-password' });
};

const getTeachers = async (query, schoolId = null) => {
  const filter = {};
  
  // Add schoolId filter if provided
  if (schoolId) {
    filter.schoolId = schoolId;
  }

  const searchFilter = {};
  if (query.search) {
    const users = await User.find({
      name: { $regex: query.search, $options: 'i' },
      role: ROLES.TEACHER,
    }).select('_id');
    searchFilter.user = { $in: users.map((u) => u._id) };
  }

  const combinedFilter = { ...filter, ...searchFilter };
  delete query.search;

  return paginate(Teacher, query, combinedFilter, [
    { path: 'user', select: 'name email phone avatar isActive' },
    { path: 'classes', select: 'name section academicYear' },
    { path: 'subjects', select: 'name code' },
  ]);
};

const getTeacherById = async (id) => {
  const teacher = await Teacher.findById(id)
    .populate('user', 'name email phone avatar isActive')
    .populate('classes', 'name section academicYear')
    .populate('subjects', 'name code');

  if (!teacher) throw new ApiError(404, 'Teacher not found');
  return teacher;
};

const getTeacherByUserId = async (userId) => {
  const teacher = await Teacher.findOne({ user: userId })
    .populate('user', 'name email phone avatar isActive')
    .populate('classes', 'name section academicYear')
    .populate('subjects', 'name code');

  if (!teacher) throw new ApiError(404, 'Teacher profile not found');
  return teacher;
};

const updateTeacher = async (id, data) => {
  const teacher = await Teacher.findById(id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  if (data.name || data.phone) {
    const userUpdate = {};
    if (data.name) userUpdate.name = data.name;
    if (data.phone) userUpdate.phone = data.phone;
    await User.findByIdAndUpdate(teacher.user, userUpdate);
  }

  const teacherFields = { ...data };
  delete teacherFields.name;
  delete teacherFields.phone;

  const updated = await Teacher.findByIdAndUpdate(id, teacherFields, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'name email phone avatar isActive')
    .populate('classes', 'name section academicYear')
    .populate('subjects', 'name code');

  return updated;
};

const deleteTeacher = async (id) => {
  const teacher = await Teacher.findById(id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  await User.findByIdAndUpdate(teacher.user, { isActive: false });
  await Teacher.findByIdAndDelete(id);
  return teacher;
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  getTeacherByUserId,
  updateTeacher,
  deleteTeacher,
};
