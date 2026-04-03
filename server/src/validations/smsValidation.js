const Joi = require('joi');

const sendSMS = Joi.object({
  category: Joi.string()
    .valid('fees', 'vacation', 'exam', 'absence', 'emergency', 'custom')
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only': 'Category must be one of: fees, vacation, exam, absence, emergency, custom',
    }),
  
  message: Joi.string()
    .trim()
    .when('category', {
      is: 'custom',
      then: Joi.required().messages({ 'any.required': 'Custom message is required' }),
      otherwise: Joi.optional(),
    }),
  
  targetClass: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({ 'string.pattern.base': 'Invalid class ID format' }),
  
  studentIds: Joi.array()
    .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .optional()
    .messages({
      'array.min': 'At least one student ID is required',
      'string.pattern.base': 'Invalid student ID format',
    }),
  
  metadata: Joi.object().optional().default({}),
  
  scheduledAt: Joi.date()
    .greater('now')
    .optional()
    .messages({ 'date.greater': 'Scheduled time must be in the future' }),
  
  createAppNotification: Joi.boolean().optional().default(true),
}).or('targetClass', 'studentIds').messages({
  'object.missing': 'Either targetClass or studentIds is required',
});

module.exports = { sendSMS };
