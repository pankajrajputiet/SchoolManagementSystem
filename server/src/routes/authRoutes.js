const router = require('express').Router();
const authController = require('../controllers/authController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { validate } = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');
const authValidation = require('../validations/authValidation');
const { ROLES } = require('../constants');

router.post(
  '/register',
  auth,
  role(ROLES.ADMIN),
  validate(authValidation.register),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(authValidation.login),
  authController.login
);

router.post('/logout', auth, authController.logout);

router.get('/me', auth, authController.getMe);

router.put(
  '/me',
  auth,
  validate(authValidation.updateProfile),
  authController.updateMe
);

router.put(
  '/change-password',
  auth,
  validate(authValidation.changePassword),
  authController.changePassword
);

module.exports = router;
