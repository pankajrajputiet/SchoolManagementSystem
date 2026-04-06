const router = require('express').Router();
const studentController = require('../controllers/studentController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { schoolAccess } = require('../middlewares/school');
const studentValidation = require('../validations/studentValidation');
const { ROLES } = require('../constants');

router.use(auth);
router.use(schoolAccess);

router.get('/me', role(ROLES.STUDENT), studentController.getMyProfile);

router
  .route('/')
  .post(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), validate(studentValidation.createStudent), studentController.create)
  .get(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER), studentController.getAll);

router
  .route('/:id')
  .get(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN, ROLES.TEACHER, ROLES.STUDENT), studentController.getById)
  .put(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), validate(studentValidation.updateStudent), studentController.update)
  .delete(role(ROLES.ADMIN, ROLES.SCHOOL_ADMIN), studentController.remove);

module.exports = router;
