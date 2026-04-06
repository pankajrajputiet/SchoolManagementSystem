const router = require('express').Router();
const markController = require('../controllers/markController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { schoolAccess } = require('../middlewares/school');
const markValidation = require('../validations/markValidation');
const { ROLES } = require('../constants');

router.use(auth);
router.use(schoolAccess);

router.post(
  '/',
  role(ROLES.ADMIN, ROLES.TEACHER),
  validate(markValidation.createMarks),
  markController.create
);

router.get('/', role(ROLES.ADMIN, ROLES.TEACHER), markController.getAll);

router.get('/report', role(ROLES.ADMIN, ROLES.TEACHER), markController.getReport);

router
  .route('/:id')
  .get(role(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), markController.getById)
  .put(
    role(ROLES.ADMIN, ROLES.TEACHER),
    validate(markValidation.updateMark),
    markController.update
  )
  .delete(role(ROLES.ADMIN), markController.remove);

module.exports = router;
