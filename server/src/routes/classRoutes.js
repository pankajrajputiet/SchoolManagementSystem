const router = require('express').Router();
const classController = require('../controllers/classController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { schoolAccess } = require('../middlewares/school');
const classValidation = require('../validations/classValidation');
const { ROLES } = require('../constants');

router.use(auth);
router.use(schoolAccess);

router
  .route('/')
  .post(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), validate(classValidation.createClass), classController.create)
  .get(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER), classController.getAll);

router
  .route('/:id')
  .get(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER), classController.getById)
  .put(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), validate(classValidation.updateClass), classController.update)
  .delete(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), classController.remove);

router.post(
  '/:id/students',
  role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN),
  validate(classValidation.addStudents),
  classController.addStudents
);

router.delete(
  '/:id/students/:studentId',
  role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN),
  classController.removeStudent
);

module.exports = router;
