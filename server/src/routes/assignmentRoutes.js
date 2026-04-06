const router = require('express').Router();
const assignmentController = require('../controllers/assignmentController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { upload } = require('../middlewares/upload');
const { schoolAccess } = require('../middlewares/school');
const assignmentValidation = require('../validations/assignmentValidation');
const { ROLES } = require('../constants');

router.use(auth);
router.use(schoolAccess);

router
  .route('/')
  .post(
    role(ROLES.TEACHER),
    upload.array('files', 5),
    validate(assignmentValidation.createAssignment),
    assignmentController.create
  )
  .get(role(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), assignmentController.getAll);

router
  .route('/:id')
  .get(assignmentController.getById)
  .put(
    role(ROLES.TEACHER),
    validate(assignmentValidation.updateAssignment),
    assignmentController.update
  )
  .delete(role(ROLES.ADMIN, ROLES.TEACHER), assignmentController.remove);

router.post(
  '/:id/submit',
  role(ROLES.STUDENT),
  upload.single('file'),
  assignmentController.submit
);

router.put(
  '/:id/submissions/:submissionId/grade',
  role(ROLES.TEACHER),
  validate(assignmentValidation.gradeSubmission),
  assignmentController.grade
);

module.exports = router;
