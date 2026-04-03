const router = require('express').Router();
const subjectController = require('../controllers/subjectController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const subjectValidation = require('../validations/subjectValidation');
const { ROLES } = require('../constants');

router.use(auth);

router
  .route('/')
  .post(role(ROLES.ADMIN), validate(subjectValidation.createSubject), subjectController.create)
  .get(role(ROLES.ADMIN, ROLES.TEACHER), subjectController.getAll);

router
  .route('/:id')
  .get(role(ROLES.ADMIN, ROLES.TEACHER), subjectController.getById)
  .put(role(ROLES.ADMIN), validate(subjectValidation.updateSubject), subjectController.update)
  .delete(role(ROLES.ADMIN), subjectController.remove);

module.exports = router;
