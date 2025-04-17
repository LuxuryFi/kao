import { HttpStatus } from '@nestjs/common';

export enum ErrorCodes {
  INTERNAL_SERVER_ERROR = HttpStatus.INTERNAL_SERVER_ERROR,
  UNAUTHORIZED = HttpStatus.UNAUTHORIZED,
}

enum GroupErrorCodes {
  GENERAL = '00',
  AUTH = '01',
  USER = '02',
}

const getUserErrorCode = (code: string) => `${GroupErrorCodes.USER}${code}`;

export const Errors = {
  INTERNAL_SERVER_ERROR: {
    message: 'Internal server error occurred',
  },
  FORBIDDEN: {
    message: 'You has not permission',
  },
  UNAUTHORIZED: {
    message: 'Unauthorized',
  },
  USER_NOT_FOUND: {
    message: 'User not found',
    code: getUserErrorCode('001'),
  },
  USER_PASSWORD_IS_INCORRECT: {
    message: 'Password is incorrect',
    code: getUserErrorCode('002'),
  },
  USER_USERNAME_OR_PASSWORD_IS_INCORRECT: {
    message: 'Username or password is incorrect',
    code: getUserErrorCode('002'),
  },
  USER_NAME_EXISTED: {
    message: 'Username existed',
    code: getUserErrorCode('003'),
  },
  USER_EMAIL_NOT_FOUND: {
    message: 'Email not found',
    code: getUserErrorCode('004'),
  },
  CATEGORY_NOT_FOUND: {
    message: 'Category not found'
  }
};
