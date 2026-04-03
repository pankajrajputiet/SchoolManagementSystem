const Mark = require('../models/Mark');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const createMarks = async (data, userId) => {
  const { classId, subject, examType, academicYear, totalMarks, records } = data;

  const markDocs = records.map((record) => ({
    student: record.student,
    subject,
    class: classId,
    examType,
    marksObtained: record.marksObtained,
    totalMarks,
    remarks: record.remarks,
    academicYear,
    enteredBy: userId,
  }));

  // Use individual saves to trigger the pre-save hook for grade calculation
  const results = [];
  for (const doc of markDocs) {
    const mark = new Mark(doc);
    await mark.save();
    results.push(mark);
  }

  return { message: `Marks entered for ${records.length} students`, data: results };
};

const getMarks = async (query) => {
  const filter = {};
  if (query.class) filter.class = query.class;
  if (query.subject) filter.subject = query.subject;
  if (query.student) filter.student = query.student;
  if (query.examType) filter.examType = query.examType;
  if (query.academicYear) filter.academicYear = query.academicYear;

  return paginate(Mark, query, filter, [
    { path: 'student', populate: { path: 'user', select: 'name' } },
    { path: 'subject', select: 'name code' },
    { path: 'class', select: 'name section' },
    { path: 'enteredBy', select: 'name' },
  ]);
};

const getMarkById = async (id) => {
  const mark = await Mark.findById(id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'name code')
    .populate('class', 'name section')
    .populate('enteredBy', 'name');

  if (!mark) throw new ApiError(404, 'Mark record not found');
  return mark;
};

const updateMark = async (id, data) => {
  const mark = await Mark.findById(id);
  if (!mark) throw new ApiError(404, 'Mark record not found');

  if (data.marksObtained !== undefined) mark.marksObtained = data.marksObtained;
  if (data.totalMarks !== undefined) mark.totalMarks = data.totalMarks;
  if (data.remarks !== undefined) mark.remarks = data.remarks;

  await mark.save(); // Triggers grade recalculation
  return mark;
};

const deleteMark = async (id) => {
  const mark = await Mark.findByIdAndDelete(id);
  if (!mark) throw new ApiError(404, 'Mark record not found');
  return mark;
};

const getMarksReport = async (query) => {
  const matchStage = {};
  if (query.class) matchStage.class = require('mongoose').Types.ObjectId.createFromHexString(query.class);
  if (query.subject) matchStage.subject = require('mongoose').Types.ObjectId.createFromHexString(query.subject);
  if (query.examType) matchStage.examType = query.examType;
  if (query.academicYear) matchStage.academicYear = query.academicYear;

  const report = await Mark.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$grade',
        count: { $sum: 1 },
        avgMarks: { $avg: '$marksObtained' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const classAvg = await Mark.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        averageMarks: { $avg: '$marksObtained' },
        highestMarks: { $max: '$marksObtained' },
        lowestMarks: { $min: '$marksObtained' },
        totalStudents: { $sum: 1 },
      },
    },
  ]);

  return {
    gradeDistribution: report,
    summary: classAvg[0] || {},
  };
};

module.exports = {
  createMarks,
  getMarks,
  getMarkById,
  updateMark,
  deleteMark,
  getMarksReport,
};
