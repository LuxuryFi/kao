export const COURSE_STAFF_ROLE = {
  LEAD: 'LEAD',
  SUB_TUTOR: 'SUB_TUTOR',
  MANAGER: 'MANAGER',
} as const;

export type CourseStaffRole = (typeof COURSE_STAFF_ROLE)[keyof typeof COURSE_STAFF_ROLE];

