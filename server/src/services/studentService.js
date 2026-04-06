const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const { ROLES } = require('../constants');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const createStudent = async (data, userContext) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Get schoolId from user context (logged-in school admin)
  const schoolId = userContext?.schoolId || data.schoolId;
  
  if (!schoolId) {
    throw new ApiError(400, 'School ID is required. Please ensure you are logged in as a school admin.');
  }

  // Create user account
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: ROLES.STUDENT,
    phone: data.phone,
    schoolId: schoolId,
  });

  // Create student profile
  const student = await Student.create({
    user: user._id,
    rollNumber: data.rollNumber,
    class: data.class,
    section: data.section,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    parentName: data.parentName,
    parentPhone: data.parentPhone,
    address: data.address,
    bloodGroup: data.bloodGroup,
    schoolId: schoolId,

  });

  // Add student to class
  await Class.findByIdAndUpdate(data.class, {
    $addToSet: { students: student._id },
  });

  return student.populate({ path: 'user', select: '-password' });
};

const getStudents = async (query) => {
  const filter = {};
  if (query.class) filter.class = query.class;
  if (query.section) filter.section = query.section;

  // Override default search to search on user name
  const searchFilter = {};
  if (query.search) {
    const users = await User.find({
      name: { $regex: query.search, $options: 'i' },
      role: ROLES.STUDENT,
    }).select('_id');
    searchFilter.user = { $in: users.map((u) => u._id) };
  }

  const combinedFilter = { ...filter, ...searchFilter };
  delete query.search; // Remove search so paginate doesn't re-apply it

  return paginate(Student, query, combinedFilter, [
    { path: 'user', select: 'name email phone avatar isActive' },
    { path: 'class', select: 'name section academicYear' },
  ]);
};

const getStudentById = async (id) => {
  const student = await Student.findById(id)
    .populate('user', 'name email phone avatar isActive')
    .populate('class', 'name section academicYear');

  if (!student) throw new ApiError(404, 'Student not found');
  return student;
};

const getStudentByUserId = async (userId) => {
  const student = await Student.findOne({ user: userId })
    .populate('user', 'name email phone avatar isActive')
    .populate('class', 'name section academicYear');

  if (!student) throw new ApiError(404, 'Student profile not found');
  return student;
};

const updateStudent = async (id, data) => {
  const student = await Student.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');

  // Update user fields if provided
  if (data.name || data.phone) {
    const userUpdate = {};
    if (data.name) userUpdate.name = data.name;
    if (data.phone) userUpdate.phone = data.phone;
    await User.findByIdAndUpdate(student.user, userUpdate);
  }

  // Update student fields
  const studentFields = { ...data };
  delete studentFields.name;
  delete studentFields.phone;

  const updated = await Student.findByIdAndUpdate(id, studentFields, {
    new: true,
    runValidators: true,
  })
    .populate('user', 'name email phone avatar isActive')
    .populate('class', 'name section academicYear');

  return updated;
};

const deleteStudent = async (id) => {
  const student = await Student.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');

  // Deactivate user account
  await User.findByIdAndUpdate(student.user, { isActive: false });

  // Remove from class
  await Class.findByIdAndUpdate(student.class, {
    $pull: { students: student._id },
  });

  await Student.findByIdAndDelete(id);
  return student;
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  getStudentByUserId,
  updateStudent,
  deleteStudent,
};
