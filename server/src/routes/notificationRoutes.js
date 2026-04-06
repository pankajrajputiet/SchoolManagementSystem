const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { schoolAccess } = require('../middlewares/school');
const notificationValidation = require('../validations/notificationValidation');
const { ROLES } = require('../constants');

router.use(auth);
router.use(schoolAccess);

router
  .route('/')
  .post(
    role(ROLES.ADMIN, ROLES.TEACHER),
    validate(notificationValidation.createNotification),
    notificationController.create
  )
  .get(notificationController.getAll);

router
  .route('/:id')
  .get(notificationController.getById)
  .put(
    role(ROLES.ADMIN),
    validate(notificationValidation.updateNotification),
    notificationController.update
  )
  .delete(role(ROLES.ADMIN), notificationController.remove);

router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
