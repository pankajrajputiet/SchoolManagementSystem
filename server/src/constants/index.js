const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

const EXAM_TYPES = {
  UNIT_TEST: 'unit-test',
  MIDTERM: 'midterm',
  FINAL: 'final',
  ASSIGNMENT: 'assignment',
  QUIZ: 'quiz',
};

const SUBJECT_TYPES = {
  THEORY: 'theory',
  PRACTICAL: 'practical',
  ELECTIVE: 'elective',
};

const NOTIFICATION_TYPES = {
  GENERAL: 'general',
  ACADEMIC: 'academic',
  EVENT: 'event',
  EMERGENCY: 'emergency',
};

const SECTIONS = ['A', 'B', 'C', 'D'];

const GENDERS = ['male', 'female', 'other'];

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  EXAM_TYPES,
  SUBJECT_TYPES,
  NOTIFICATION_TYPES,
  SECTIONS,
  GENDERS,
};
