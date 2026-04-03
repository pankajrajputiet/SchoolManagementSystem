const Attendance = require('../models/Attendance');
const ApiError = require('../utils/ApiError');
const { paginate } = require('../utils/pagination');

const markAttendance = async (data, userId) => {
  const { classId, date, records } = data;

  const attendanceDocs = records.map((record) => ({
    student: record.student,
    class: classId,
    date: new Date(date),
    status: record.status,
    remarks: record.remarks,
    markedBy: userId,
  }));

  // Use bulkWrite with upsert so re-marking for the same date updates instead of failing
  const ops = attendanceDocs.map((doc) => ({
    updateOne: {
      filter: { student: doc.student, date: doc.date },
      update: { $set: doc },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);
  return { message: `Attendance marked for ${records.length} students` };
};

const getAttendance = async (query) => {
  const filter = {};
  if (query.class) filter.class = query.class;
  if (query.student) filter.student = query.student;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  if (query.status) filter.status = query.status;

  return paginate(Attendance, query, filter, [
    { path: 'student', populate: { path: 'user', select: 'name' } },
    { path: 'class', select: 'name section' },
    { path: 'markedBy', select: 'name' },
  ]);
};

const getAttendanceById = async (id) => {
  const record = await Attendance.findById(id)
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('class', 'name section')
    .populate('markedBy', 'name');

  if (!record) throw new ApiError(404, 'Attendance record not found');
  return record;
};

const updateAttendance = async (id, data) => {
  const record = await Attendance.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!record) throw new ApiError(404, 'Attendance record not found');
  return record;
};

const getAttendanceReport = async (query) => {
  const matchStage = {};
  if (query.class) matchStage.class = require('mongoose').Types.ObjectId.createFromHexString(query.class);
  if (query.startDate || query.endDate) {
    matchStage.date = {};
    if (query.startDate) matchStage.date.$gte = new Date(query.startDate);
    if (query.endDate) matchStage.date.$lte = new Date(query.endDate);
  }

  const report = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = report.reduce((sum, r) => sum + r.count, 0);

  return {
    report: report.map((r) => ({
      status: r._id,
      count: r.count,
      percentage: total > 0 ? ((r.count / total) * 100).toFixed(2) : 0,
    })),
    total,
  };
};

module.exports = {
  markAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  getAttendanceReport,
};
