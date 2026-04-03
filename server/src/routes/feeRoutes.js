const router = require('express').Router();
const feeController = require('../controllers/feeController');
const { auth } = require('../middlewares/auth');
const { role } = require('../middlewares/role');
const { schoolAccess, schoolAdminOrHigher } = require('../middlewares/school');
const { ROLES } = require('../constants');

// All routes require authentication
router.use(auth);
router.use(schoolAccess);

// Fee Structure routes (Admin only)
router.post(
  '/structure',
  schoolAdminOrHigher,
  feeController.createFeeStructure
);

router.get(
  '/structure',
  schoolAdminOrHigher,
  feeController.getFeeStructures
);

router.put(
  '/structure/:id',
  schoolAdminOrHigher,
  feeController.updateFeeStructure
);

router.delete(
  '/structure/:id',
  schoolAdminOrHigher,
  feeController.deleteFeeStructure
);

// Fee Payment routes
router.post(
  '/pay',
  schoolAdminOrHigher,
  feeController.recordPayment
);

router.get(
  '/payments',
  schoolAdminOrHigher,
  feeController.getFeePayments
);

router.get(
  '/pending',
  schoolAdminOrHigher,
  feeController.getPendingFees
);

router.get(
  '/stats',
  schoolAdminOrHigher,
  feeController.getFeeStats
);

router.post(
  '/generate',
  schoolAdminOrHigher,
  feeController.generateFeeRecords
);

// Student fee status (Admin or Student)
router.get(
  '/student/:studentId',
  feeController.getStudentFeeStatus
);

module.exports = router;
