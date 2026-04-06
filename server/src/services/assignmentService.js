const Assignment = require('../models/Assignment');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const createAssignment = async (data, userId,schoolId, files) => {
  const attachments = (files || []).map((file) => ({
    fileName: file.originalname,
    fileUrl: file.path,
    fileType: file.mimetype,
  }));

  const assignment = await Assignment.create({
    ...data,
    assignedBy: userId,
    attachments,
    schoolId,
  });
  return assignment;
};

const getAssignments = async (query) => {
  const filter = {};
  if (query.class) filter.class = query.class;
  if (query.subject) filter.subject = query.subject;

  return paginate(Assignment, query, filter, [
    { path: 'subject', select: 'name code' },
    { path: 'class', select: 'name section' },
    { path: 'assignedBy', select: 'name' },
  ]);
};

const getAssignmentById = async (id) => {
  const assignment = await Assignment.findById(id)
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .populate('assignedBy', 'name')
    .populate({
      path: 'submissions.student',
      populate: { path: 'user', select: 'name' },
    });

  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return assignment;
};

const updateAssignment = async (id, data, userId) => {
  const assignment = await Assignment.findById(id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  if (assignment.assignedBy.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to update this assignment');
  }

  Object.assign(assignment, data);
  await assignment.save();
  return assignment;
};

const deleteAssignment = async (id, userId, userRole) => {
  const assignment = await Assignment.findById(id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  if (
    userRole !== 'admin' &&
    assignment.assignedBy.toString() !== userId.toString()
  ) {
    throw new ApiError(403, 'Not authorized to delete this assignment');
  }

  await Assignment.findByIdAndDelete(id);
  return assignment;
};

const submitAssignment = async (id, studentId, file) => {
  const assignment = await Assignment.findById(id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  // Check if already submitted
  const existingSubmission = assignment.submissions.find(
    (s) => s.student.toString() === studentId.toString()
  );

  if (existingSubmission) {
    existingSubmission.fileUrl = file.path;
    existingSubmission.fileName = file.originalname;
    existingSubmission.submittedAt = new Date();
  } else {
    assignment.submissions.push({
      student: studentId,
      fileUrl: file.path,
      fileName: file.originalname,
    });
  }

  await assignment.save();
  return assignment;
};

const gradeSubmission = async (assignmentId, submissionId, data) => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');

  const submission = assignment.submissions.id(submissionId);
  if (!submission) throw new ApiError(404, 'Submission not found');

  submission.grade = data.grade;
  submission.feedback = data.feedback;
  await assignment.save();

  return assignment;
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
};
