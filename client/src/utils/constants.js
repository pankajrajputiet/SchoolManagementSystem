export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  SCHOOL_ADMIN: 'schooladmin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

export const EXAM_TYPES = [
  { value: 'unit-test', label: 'Unit Test' },
  { value: 'midterm', label: 'Midterm' },
  { value: 'final', label: 'Final' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'quiz', label: 'Quiz' },
];

export const SECTIONS = ['A', 'B', 'C', 'D'];
export const GENDERS = ['male', 'female', 'other'];

export const PAGINATION_DEFAULT = { page: 1, limit: 10 };
