const router = require('express').Router();
const schoolController = require('../controllers/schoolController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { schoolAccess, superAdminOnly } = require('../middlewares/school');
const { createSchool, updateSchool } = require('../validations/schoolValidation');
const { ROLES } = require('../constants');

// All routes require authentication
router.use(auth);

// Get current user's school (for non-super admins)
router.get('/my-school', schoolAccess, schoolController.getMySchool);

// Super Admin only routes
router.post(
  '/',
  superAdminOnly,
  validate(createSchool),
  schoolController.createSchool
);

router.get(
  '/',
  superAdminOnly,
  schoolController.getAllSchools
);

// School-specific routes (Super Admin or School Admin)
router.get('/stats', schoolAccess, schoolController.getSchoolStats);

router.route('/:id')
  .get(schoolAccess, schoolController.getSchoolById)
  .put(
    schoolAccess,
    validate(updateSchool),
    schoolController.updateSchool
  )
  .delete(superAdminOnly, schoolController.deleteSchool);

// Stats for specific school
router.get('/:id/stats', schoolAccess, schoolController.getSchoolStats);

module.exports = router;
