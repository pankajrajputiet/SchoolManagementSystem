const router = require('express').Router();
const teacherController = require('../controllers/teacherController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { schoolAccess } = require('../middlewares/school');
const teacherValidation = require('../validations/teacherValidation');
const { ROLES } = require('../constants');

router.use(auth);
router.use(schoolAccess);

router.get('/me', role(ROLES.TEACHER), teacherController.getMyProfile);

router
  .route('/')
  .post(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), validate(teacherValidation.createTeacher), teacherController.create)
  .get(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), teacherController.getAll);

router
  .route('/:id')
  .get(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER), teacherController.getById)
  .put(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), validate(teacherValidation.updateTeacher), teacherController.update)
  .delete(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), teacherController.remove);

module.exports = router;
