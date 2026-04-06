const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const createClass = async (data) => {
  const cls = await Class.create(data);
  return cls;
};

const getClasses = async (query, schoolId = null) => {
  const filter = {};
  
  // Add schoolId filter if provided
  if (schoolId) {
    filter.schoolId = schoolId;
  }
  
  if (query.academicYear) filter.academicYear = query.academicYear;

  return paginate(Class, query, filter, [
    { path: 'classTeacher', populate: { path: 'user', select: 'name email' } },
  ]);
};

const getClassById = async (id) => {
  const cls = await Class.findById(id)
    .populate({
      path: 'classTeacher',
      populate: { path: 'user', select: 'name email' },
    })
    .populate({
      path: 'students',
      populate: { path: 'user', select: 'name email' },
    })
    .populate('subjects');

  if (!cls) throw new ApiError(404, 'Class not found');
  return cls;
};

const updateClass = async (id, data) => {
  const cls = await Class.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!cls) throw new ApiError(404, 'Class not found');
  return cls;
};

const deleteClass = async (id) => {
  const cls = await Class.findByIdAndDelete(id);
  if (!cls) throw new ApiError(404, 'Class not found');
  return cls;
};

const addStudentsToClass = async (classId, studentIds) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, 'Class not found');

  const newIds = studentIds.filter(
    (id) => !cls.students.map(String).includes(id)
  );
  cls.students.push(...newIds);
  await cls.save();
  return cls;
};

const removeStudentFromClass = async (classId, studentId) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new ApiError(404, 'Class not found');

  cls.students = cls.students.filter((s) => s.toString() !== studentId);
  await cls.save();
  return cls;
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudentsToClass,
  removeStudentFromClass,
};
