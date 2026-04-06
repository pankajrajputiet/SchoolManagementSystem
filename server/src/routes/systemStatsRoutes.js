const router = require('express').Router();
const { getSystemStats } = require('../controllers/systemStatsController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { ROLES } = require('../constants');

// All routes require authentication and super admin role
router.use(auth);
router.use(role(ROLES.SUPER_ADMIN));

router.get('/system', getSystemStats);

module.exports = router;
