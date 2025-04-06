import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { Errors } from 'src/constants/errors';
import { sendResponse } from 'src/utils/response.util';
import { CreateUserDto, UpdateUserDto } from './dto/internal.dto';

import { InternalService } from './internal.service';
import {
  CreateUserResponse,
  GetUserResponse,
  UpdateUserResponse,
} from './response/internal.response';
@Controller('internals')
@ApiTags('Internal User')
export class InternalController {
  constructor(private readonly internalsService: InternalService) {}

  @Get('')
  @ApiOperation({
    summary: 'Get Public User',
  })
  async find(): Promise<object> {
    return this.internalsService.find();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get One Public User',
  })
  @ApiOkResponse({
    type: GetUserResponse,
  })
  async findOne(@Param('id') id: number): Promise<object> {
    return this.internalsService.findOne({
      where: {
        id: id,
      },
    });
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
      const { password, email, type, address, phone, name, url } = data;

      const hashedPassword = bcrypt.hashSync(password, 10);
      const payload = {
        password: hashedPassword,
        email,
        type,
        address,
        phone,
        name,
        url,
        status: 1,
      };

      const validate = await this.internalsService.validateUser(payload);

      // Check if user already exists
      if (!validate) {
        return sendResponse(
          res,
          HttpStatusCodes.CONFLICT,
          null,
          Errors.USER_EMAIL_EXISTED.message,
        );
      }

      const result = await this.internalsService.store(payload);
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
      const { email, type, address, phone, name, url, status } = data;

      const payload = {
        email,
        type,
        address,
        phone,
        name,
        url,
        status,
      };

      const validate = await this.internalsService.validateUser(payload);

      // Check if user already exists
      if (!validate) {
        return sendResponse(
          res,
          HttpStatusCodes.CONFLICT,
          null,
          Errors.USER_EMAIL_EXISTED.message,
        );
      }

      const result = await this.internalsService.update(id, payload);
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
      const users = await this.internalsService.find({
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

      const result = await this.internalsService.delete(id);
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      console.log('Error', err);
    }
  }
}
