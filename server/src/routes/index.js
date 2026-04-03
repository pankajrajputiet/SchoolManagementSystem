const router = require('express').Router();

const authRoutes = require('./authRoutes');
const schoolRoutes = require('./schoolRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const classRoutes = require('./classRoutes');
const subjectRoutes = require('./subjectRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const markRoutes = require('./markRoutes');
const notificationRoutes = require('./notificationRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const smsRoutes = require('./smsRoutes');

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/marks', markRoutes);
router.use('/notifications', notificationRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/sms', smsRoutes);

module.exports = router;
