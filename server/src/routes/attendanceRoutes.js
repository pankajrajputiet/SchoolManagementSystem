const router = require('express').Router();
const attendanceController = require('../controllers/attendanceController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { schoolAccess } = require('../middlewares/school');
const attendanceValidation = require('../validations/attendanceValidation');
const { ROLES } = require('../constants');

router.use(auth);
router.use(schoolAccess);

router.post(
  '/',
  role(ROLES.ADMIN, ROLES.TEACHER),
  validate(attendanceValidation.markAttendance),
  attendanceController.markAttendance
);

router.get('/', role(ROLES.ADMIN, ROLES.TEACHER), attendanceController.getAll);

router.get('/report', role(ROLES.ADMIN, ROLES.TEACHER), attendanceController.getReport);

router
  .route('/:id')
  .get(role(ROLES.ADMIN, ROLES.TEACHER), attendanceController.getById)
  .put(
    role(ROLES.ADMIN, ROLES.TEACHER),
    validate(attendanceValidation.updateAttendance),
    attendanceController.update
  );

module.exports = router;
