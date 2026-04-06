const Subject = require('../models/Subject');
const Class = require('../models/Class');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const createSubject = async (data,userContext) => {

    // Get schoolId from user context (logged-in school admin)
    const schoolId = userContext?.schoolId || data.schoolId;
    
    data.schoolId = schoolId; // Ensure schoolId is set in the subject data
    if (!schoolId) {
      throw new ApiError(400, 'School ID is required. Please ensure you are logged in as a school admin.');
    }
  

  const subject = await Subject.create(data);
  // Add subject to class's subjects array
  await Class.findByIdAndUpdate(data.class, {
    $addToSet: { subjects: subject._id },
  });
  return subject;
};

const getSubjects = async (query) => {
  const filter = {};
  if (query.class) filter.class = query.class;
  if (query.teacher) filter.teacher = query.teacher;

  return paginate(Subject, query, filter, [
    { path: 'class', select: 'name section academicYear' },
    { path: 'teacher', populate: { path: 'user', select: 'name email' } },
  ]);
};

const getSubjectById = async (id) => {
  const subject = await Subject.findById(id)
    .populate('class', 'name section academicYear')
    .populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name email' },
    });

  if (!subject) throw new ApiError(404, 'Subject not found');
  return subject;
};

const updateSubject = async (id, data) => {
  const subject = await Subject.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!subject) throw new ApiError(404, 'Subject not found');
  return subject;
};

const deleteSubject = async (id) => {
  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) throw new ApiError(404, 'Subject not found');

  // Remove from class's subjects array
  await Class.findByIdAndUpdate(subject.class, {
    $pull: { subjects: subject._id },
  });

  return subject;
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
