import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserRole } from 'src/modules/users/enum/user.enum';

export const fakeUserModel = {
  create: jest.fn(),
  findOneAsync: jest.fn(),
  findOne: jest.fn(),
  findByIdAsync: jest.fn(),
  findById: jest.fn(),
  updateOneAsync: jest.fn(),
  updateOne: jest.fn(),
  paginate: jest.fn(),
  countDocuments: jest.fn(),
};

export const mockRequestUser = {
  loginId: 3,
  _id: new mongoose.Types.ObjectId('5e997f95d6a35f3a0def3339'),
  email: 'newemail@email.com',
  company: 'string',
  branch: 'string',
  companyAddress: 'string',
  role: UserRole.USER,
  deletedAt: null,
  deletedBy: null,
  isDeleted: false,
  id: '5e997f95d6a35f3a0def3339',
  password: bcrypt.hashSync('string1', 10),
};
