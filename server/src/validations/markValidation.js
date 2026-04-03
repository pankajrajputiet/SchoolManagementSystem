const Joi = require('joi');
const { EXAM_TYPES } = require('../constants');

const createMarks = Joi.object({
  classId: Joi.string().hex().length(24).required(),
  subject: Joi.string().hex().length(24).required(),
  examType: Joi.string()
    .valid(...Object.values(EXAM_TYPES))
    .required(),
  academicYear: Joi.string().required(),
  totalMarks: Joi.number().min(0).required(),
  records: Joi.array()
    .items(
      Joi.object({
        student: Joi.string().hex().length(24).required(),
        marksObtained: Joi.number().min(0).required(),
        remarks: Joi.string().allow('').optional(),
      })
    )
    .min(1)
    .required(),
});

const updateMark = Joi.object({
  marksObtained: Joi.number().min(0).optional(),
  totalMarks: Joi.number().min(0).optional(),
  remarks: Joi.string().allow('').optional(),
});

module.exports = { createMarks, updateMark };
