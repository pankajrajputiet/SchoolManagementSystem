const Joi = require('joi');
const { ATTENDANCE_STATUS } = require('../constants');

const markAttendance = Joi.object({
  classId: Joi.string().hex().length(24).required(),
  date: Joi.date().required(),
  records: Joi.array()
    .items(
      Joi.object({
        student: Joi.string().hex().length(24).required(),
        status: Joi.string()
          .valid(...Object.values(ATTENDANCE_STATUS))
          .required(),
        remarks: Joi.string().allow('').optional(),
      })
    )
    .min(1)
    .required(),
});

const updateAttendance = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ATTENDANCE_STATUS))
    .optional(),
  remarks: Joi.string().allow('').optional(),
});

module.exports = { markAttendance, updateAttendance };
