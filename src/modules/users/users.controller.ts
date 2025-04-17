import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { Errors } from 'src/constants/errors';
import { ALLOWED_ROLES } from 'src/constants/roles';
import { sendResponse } from 'src/utils/response.util';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import {
  CreateUserResponse,
  GetUserResponse,
  UpdateUserResponse,
} from './response/user.response';
import { UsersService } from './users.service';
@Controller('users')
@ApiTags('Public User')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

@Get('')
@ApiQuery({
  name: 'skip',
  required: false,
  description: 'The number of items to skip (for pagination)',
  type: Number,
})
@ApiQuery({ name: 'skip', required: false, description: 'Page number' })
@ApiQuery({ name: 'select', required: false, description: 'Items per page' })
@ApiQuery({ name: 'email', required: false, description: 'Filter by email' })
@ApiQuery({ name: 'phone', required: false, description: 'Filter by phone' })
@ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
@ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
@ApiQuery({ name: 'role', required: false, description: 'Filter by role' })

@ApiOperation({
  summary: 'Get Public Users',
})
async find(@Res() res: Response, @Query() PaginationDto): Promise<object> {
  console.log('PaginationDto', PaginationDto);
  const { skip = 0, select=20, role='admin', email, phone, name, status } = PaginationDto;

  const [result, totalCount] = await this.usersService.getUserByRole({ select, skip, role, email, phone, name, status });
  // Return the response with data and total count for pagination
  return sendResponse(res, HttpStatusCodes.OK, { result, totalCount }, null);
}


  @Get(':id')
  @ApiOperation({
    summary: 'Get One Public User',
  })
  @ApiOkResponse({
    type: GetUserResponse,
  })
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<object> {
    const result = await this.usersService.findOne({
      where: {
        id: id,
      },
    });

    return sendResponse(res, HttpStatusCodes.CREATED, result, null); // Use 201 Created for successful user creation
  }

  @Post()
  @ApiOperation({
    summary: 'Create Public User',
  })
  @ApiOkResponse({
    type: CreateUserResponse,
  })
  async create(@Body() data: CreateUserDto, @Res() res: Response) {
    try {
      const { password, email, address, phone, name, url
        , start_date, end_date, role
       } = data;

      if (role && !ALLOWED_ROLES.includes(role)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          null,
          `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
        );
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const payload = {
        password: hashedPassword,
        email,
        start_date,
        end_date,
        role,
        address,
        phone,
        name,
        url,
        status: 1,
      };

      const validate = await this.usersService.validateUser(payload);

      // Check if user already exists
      if (!validate) {
        return sendResponse(
          res,
          HttpStatusCodes.CONFLICT,
          null,
          Errors.USER_EMAIL_EXISTED.message,
        );
      }

      const result = await this.usersService.store(payload);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null); // Use 201 Created for successful user creation
    } catch (err) {
      console.error('Error:', err); // Use console.error for logging errors
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Public User',
  })
  @ApiOkResponse({
    type: UpdateUserResponse,
  })
  async update(
    @Body() data: UpdateUserDto,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    try {
      const { email, address, phone, name, url, status, role, start_date, end_date } = data;
      if (role && !ALLOWED_ROLES.includes(role)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          null,
          `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
        );
      }

      const payload = {
        email,
        address,
        phone,
        name,
        url,
        status,
        start_date,
        end_date,
        role,
      };

      const validate = await this.usersService.validateUser(payload);

      // Check if user already exists
      if (!validate) {
        return sendResponse(
          res,
          HttpStatusCodes.CONFLICT,
          null,
          Errors.USER_EMAIL_EXISTED.message,
        );
      }

      const result = await this.usersService.update(id, payload);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null); // Use 201 Created for successful user creation
    } catch (err) {
      console.error('Error:', err); // Use console.error for logging errors
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Res() res: Response) {
    try {
      const users = await this.usersService.find({
        where: {
          id,
        },
      });

      if (users.length === 0) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          Errors.USER_EMAIL_NOT_FOUND.message,
        );
      }

      const result = await this.usersService.delete(id);
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      console.log('Error', err);
    }
  }
}
