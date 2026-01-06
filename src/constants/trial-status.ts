export const TRIAL_STATUS = {
  TRIAL_REGISTERED: 'TRIAL_REGISTERED', // Đã đăng ký học thử
  TRIAL_ATTENDED: 'TRIAL_ATTENDED',     // Đã đến học thử
} as const;

export type TrialStatus = (typeof TRIAL_STATUS)[keyof typeof TRIAL_STATUS];

