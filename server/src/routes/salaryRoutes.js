const router = require('express').Router();
const salaryController = require('../controllers/salaryController');
const { auth } = require('../middlewares/auth');
const { schoolAccess, schoolAdminOrHigher } = require('../middlewares/school');

// All routes require authentication
router.use(auth);
router.use(schoolAccess);

// Salary Structure routes (Admin only)
router.post(
  '/structure',
  schoolAdminOrHigher,
  salaryController.createSalaryStructure
);

router.get(
  '/structure',
  schoolAdminOrHigher,
  salaryController.getSalaryStructures
);

router.put(
  '/structure/:id',
  schoolAdminOrHigher,
  salaryController.updateSalaryStructure
);

router.delete(
  '/structure/:id',
  schoolAdminOrHigher,
  salaryController.deleteSalaryStructure
);

// Salary Payment routes
router.post(
  '/generate',
  schoolAdminOrHigher,
  salaryController.generateMonthlySalary
);

router.get(
  '/payments',
  schoolAdminOrHigher,
  salaryController.getSalaryPayments
);

router.post(
  '/pay',
  schoolAdminOrHigher,
  salaryController.recordSalaryPayment
);

router.get(
  '/stats',
  schoolAdminOrHigher,
  salaryController.getSalaryStats
);

router.get(
  '/pending',
  schoolAdminOrHigher,
  salaryController.getPendingSalaries
);

// Staff salary history (Admin or can be extended for staff themselves)
router.get(
  '/staff/:staffId',
  schoolAdminOrHigher,
  salaryController.getStaffSalaryHistory
);

module.exports = router;
