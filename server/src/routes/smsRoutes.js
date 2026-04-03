const router = require('express').Router();
const smsController = require('../controllers/smsController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { sendSMS: smsValidationSchema } = require('../validations/smsValidation');
const { ROLES } = require('../constants');

// All routes require authentication
router.use(auth);

// Get SMS service status
router.get('/status', smsController.getSMSServiceStatus);

// Get SMS templates
router.get('/templates', smsController.getTemplates);

// Get SMS statistics
router.get('/stats', role(ROLES.ADMIN), smsController.getSMSStats);

// Get SMS history
router.get('/history', role(ROLES.ADMIN), smsController.getSMSHistory);

// Get SMS details
router.get('/:id', role(ROLES.ADMIN), smsController.getSMSDetails);

// Send SMS (Admin and Teacher)
router.post(
  '/send',
  role(ROLES.ADMIN, ROLES.TEACHER),
  validate(smsValidationSchema),
  smsController.sendSMS
);

module.exports = router;
