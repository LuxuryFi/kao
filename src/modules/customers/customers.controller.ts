import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { sendResponse } from 'src/utils/response.util';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import {
  CreateCustomerResponse,
  GetCustomerResponse,
  UpdateCustomerResponse,
} from './response/customer.response';

import { UsersService } from '../users/users.service';
import { CustomersService } from './customers.service';
@Controller('customers')
@ApiTags('Customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly userService: UsersService,
  ) {}

  @Get('')
  @ApiQuery({ name: 'skip', required: false, description: 'Page number' })
  @ApiQuery({ name: 'select', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'username',
    required: false,
    description: 'Filter by username',
  })
  @ApiQuery({ name: 'email', required: false, description: 'Filter by email' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
  @ApiQuery({ name: 'phone', required: false, description: 'Filter by phone' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Search keyword for name, email, or phone',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description:
      'Filter by role(s). Accepts comma-separated or repeated query params',
    isArray: true,
    type: String,
  })
  @ApiOperation({
    summary: 'Get Customers',
  })
  async find(@Res() res: Response, @Query() PaginationDto): Promise<object> {
    const {
      skip = 0,
      select = 20,
      role = '',
      username,
      email,
      name,
      phone,
      keyword,
      status,
    } = PaginationDto;

    let roles: string[] | undefined = undefined;
    if (Array.isArray(role)) {
      roles = role as string[];
    } else if (typeof role === 'string' && role.trim() !== '') {
      roles = role
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    }

    const [result, totalCount] = await this.customersService.getCustomerByRole({
      select,
      skip,
      role: roles ?? role,
      username,
      email,
      name,
      phone,
      keyword,
      status,
    });
    return sendResponse(res, HttpStatusCodes.OK, { result, totalCount }, null);
  }

  @Get('by-parent/:parentId')
  @ApiOperation({
    summary: 'Get Customers by Parent ID',
  })
  async findByParent(
    @Param('parentId') parentId: number,
    @Res() res: Response,
  ): Promise<object> {
    const [result, totalCount] =
      await this.customersService.getCustomerByParentId(Number(parentId));
    return sendResponse(res, HttpStatusCodes.OK, { result, totalCount }, null);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get One Customer',
  })
  @ApiOkResponse({
    type: GetCustomerResponse,
  })
  async findOne(
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<object> {
    const result = await this.customersService.findOne({
      where: {
        id: id,
      },
    });

    return sendResponse(res, HttpStatusCodes.OK, result, null);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create Customer',
  })
  @ApiOkResponse({
    type: CreateCustomerResponse,
  })
  async create(
    @Body() data: CreateCustomerDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      const {
        username,
        address,
        email,
        name,
        gender,
        url,
        start_date,
        end_date,
        phone,
        sale_id,
        status_reason,
      } = data;

      const currentTimestamp = Math.floor(Date.now() / 1000);

      // Get username from JWT if available
      const createdBy = req.user?.username || 'system';

      const payload: any = {
        username,
        start_date,
        end_date,
        gender,
        address,
        email,
        name,
        created_at: currentTimestamp,
        url,
        status: 1,
        created_by: createdBy,
      };

      if (phone) {
        payload.phone = phone;
      }
      if (status_reason !== undefined && status_reason !== null) {
        payload.status_reason = status_reason;
      }

      if (sale_id && Number(sale_id) > 0) {
        const sale = await this.userService.findOne({
          where: { id: Number(sale_id) },
        });
        if (!sale) {
          return sendResponse(
            res,
            HttpStatusCodes.BAD_REQUEST,
            null,
            `Sale with id ${sale_id} does not exist`,
          );
        }
        payload.sale_id = Number(sale_id);
      }

      const validate = await this.customersService.validateCustomer(payload);

      if (!validate) {
        return sendResponse(
          res,
          HttpStatusCodes.CONFLICT,
          null,
          'Customer username already exists',
        );
      }

      const result = await this.customersService.store(payload);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null);
    } catch (err) {
      console.error('Error:', err);
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update Customer',
  })
  @ApiOkResponse({
    type: UpdateCustomerResponse,
  })
  async update(
    @Body() data: UpdateCustomerDto,
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      const {
        address,
        gender,
        email,
        name,
        url,
        status,
        start_date,
        end_date,
        phone,
        sale_id,
        status_reason,
      } = data;

      // Get username from JWT if available
      const updatedBy = req.user?.username || 'system';

      const payload: any = {
        address,
        email,
        gender,
        name,
        url,
        status,
        start_date,
        end_date,
        updated_by: updatedBy,
      };

      if (phone !== undefined) {
        payload.phone = phone;
      }
      if (status_reason !== undefined && status_reason !== null) {
        payload.status_reason = status_reason;
      }

      if (sale_id && Number(sale_id) > 0) {
        const sale = await this.userService.findOne({
          where: { id: Number(sale_id) },
        });
        if (!sale) {
          return sendResponse(
            res,
            HttpStatusCodes.BAD_REQUEST,
            null,
            `Sale with id ${sale_id} does not exist`,
          );
        }
        payload.sale_id = Number(sale_id);
      } else if (sale_id === null) {
        payload.sale_id = null;
      }

      const result = await this.customersService.update(id, payload);
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      console.error('Error:', err);
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Customer',
  })
  async delete(@Param('id') id: number, @Res() res: Response) {
    try {
      const customers = await this.customersService.find({
        where: {
          id,
        },
      });

      if (customers.length === 0) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Customer not found',
        );
      }

      const result = await this.customersService.delete(id);
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      console.log('Error', err);
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }
}
