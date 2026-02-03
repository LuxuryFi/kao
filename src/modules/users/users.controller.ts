import {
  Body,
  Controller,
  Delete,
  Get,
  Options,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { Errors } from 'src/constants/errors';
import { ALLOWED_ROLES } from 'src/constants/roles';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { sendResponse } from 'src/utils/response.util';
import { AdminUpdatePasswordDto, CreateUserDto, UpdatePasswordDto, UpdateUserDto } from './dto/user.dto';
import {
  CreateUserResponse,
  GetUserResponse,
  UpdateUserResponse,
} from './response/user.response';

import { diskStorage } from 'multer';
import { UsersService } from './users.service';
@Controller('users')
@ApiTags('Public User')
export class UserController {
  constructor(private readonly usersService: UsersService) { }
  @Options('/upload')
  handleOptions(@Req() req: Request, @Res() res: Response) {
    // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200); // Respond with 200 OK
  }

  @Post('user/upload')
  @UseInterceptors(
    FileInterceptor('url', {
      // Configure Multer storage options
      storage: diskStorage({
        destination: './public/uploads/users', // Define the directory to store uploaded files
        filename: (req, file, cb) => {
          console.log('file', file);
          console.log('req', req);
          const filename = `${new Date().getTime()}-${file.originalname}`;
          cb(null, filename); // Set the file name
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file) {
    console.log(file); // File metadata, including path, name, etc.
    return {
      message: 'File uploaded successfully!',
      file: {
        originalname: file.originalname,
        filename: file.filename, // This will include the timestamped filename
        path: file.path, // Path to the uploaded file on the server
      },
    };
  }

  @Get('')
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'The number of items to skip (for pagination)',
    type: Number,
  })
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
      'Filter by role(s). Accepts comma-separated or repeated query params. Allowed roles: ' +
      ALLOWED_ROLES.join(', '),
    isArray: true,
    type: String,
  })
  @ApiQuery({
    name: 'contact_status',
    required: false,
    description: 'Filter by contact status',
  })
  @ApiOperation({
    summary: 'Get Public Users',
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
      contact_status,
    } = PaginationDto;

    // normalize role to array if provided as comma-separated string or repeated keys
    let roles: string[] | undefined = undefined;
    if (Array.isArray(role)) {
      roles = role as string[];
    } else if (typeof role === 'string' && role.trim() !== '') {
      roles = role
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    }

    const [result, totalCount] = await this.usersService.getUserByRole({
      select,
      skip,
      role: roles ?? role,
      username,
      email,
      name,
      phone,
      keyword,
      status,
      contact_status,
    });
    // Return the response with data and total count for pagination
    return sendResponse(res, HttpStatusCodes.OK, { result, totalCount }, null);
  }
  @Put('update-password')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update Password (Self)',
    description: 'User tự update password của mình dựa trên token',
  })
  @ApiOkResponse({
    description: 'Password updated successfully',
  })
  async updatePassword(
    @Body() data: UpdatePasswordDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      const userId = req.user?.sub || req.user?.id;
      console.log(req.user);
      if (!userId) {
        return sendResponse(
          res,
          HttpStatusCodes.UNAUTHORIZED,
          null,
          'User not authenticated',
        );
      }
      console.log(userId, data.new_password);
      await this.usersService.updatePassword(userId, data.new_password);
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        { message: 'Password updated successfully' },
        null,
      );
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Put('admin/update-password')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update Password (Admin)',
    description: 'Admin update password cho user khác, cần user_id',
  })
  @ApiOkResponse({
    description: 'Password updated successfully',
  })
  async adminUpdatePassword(
    @Body() data: AdminUpdatePasswordDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      // Kiểm tra quyền admin
      const currentUserRole = req.user?.role;
      if (currentUserRole !== 'admin') {
        return sendResponse(
          res,
          HttpStatusCodes.FORBIDDEN,
          null,
          'Only admin can update password for other users',
        );
      }

      await this.usersService.updatePassword(data.user_id, data.new_password);
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        { message: 'Password updated successfully' },
        null,
      );
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Get('by-parent/:parentId')
  @ApiOperation({
    summary: 'Get Users by Parent ID (Deprecated - Use /students/by-parent/:parentId instead)',
    description: 'This endpoint is deprecated. Please use /students/by-parent/:parentId to get students by parent.',
  })
  async findByParent(
    @Param('parentId') parentId: number,
    @Res() res: Response,
  ): Promise<object> {
    const [result, totalCount] = await this.usersService.getUserByParentId(
      Number(parentId),
    );
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
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create Public User',
  })
  @ApiOkResponse({
    type: CreateUserResponse,
  })
  async create(@Body() data: CreateUserDto, @Res() res: Response, @Req() req: any) {
    try {
      const {
        password,
        username,
        address,
        email,
        name,
        gender,
        url,
        role,
        phone,
        parent_id,
        status_reason,
        contact_status,
      } = data;

      if (role && !ALLOWED_ROLES.includes(role)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          null,
          `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
        );
      }

      // Special validation for customer role: only name and phone are required
      if (role === 'customer') {
        if (!name || !phone) {
          return sendResponse(
            res,
            HttpStatusCodes.BAD_REQUEST,
            null,
            'For customer role, name and phone are required',
          );
        }
      } else {
        // For other roles, username and password are required
        if (!username || !password) {
          return sendResponse(
            res,
            HttpStatusCodes.BAD_REQUEST,
            null,
            'Username and password are required for non-customer roles',
          );
        }
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const createdBy = req.user?.username || 'system';

      const payload: any = {
        name,
        role,
        created_at: currentTimestamp,
        status: 1,
        created_by: createdBy,
      };

      // For customer role, set default values for optional fields
      if (role === 'customer') {
        // Generate username from phone if not provided
        payload.username = username || `customer_${phone.replace(/\D/g, '')}`;
        // Generate a random password for customer (they won't login)
        payload.password = password || bcrypt.hashSync(`customer_${Date.now()}`, 10);
        payload.address = address || '';
        payload.email = email || '';
        payload.url = url || '';
        payload.gender = gender !== undefined ? gender : null;
      } else {
        // For other roles, username and password are required
        const hashedPassword = bcrypt.hashSync(password, 10);
        payload.password = hashedPassword;
        payload.username = username;
        if (address) payload.address = address;
        if (email) payload.email = email;
        if (url) payload.url = url;
        if (gender !== undefined) payload.gender = gender;
      }

      // Optional fields for all roles
      if (phone) payload.phone = phone;
      if (status_reason !== undefined && status_reason !== null) {
        payload.status_reason = status_reason;
      }
      if (contact_status !== undefined) {
        payload.contact_status = contact_status;
      }

      // Only add parent_id if it's a valid positive number
      if (parent_id && Number(parent_id) > 0) {
        // Validate that parent user exists
        const parentUser = await this.usersService.findOne({
          where: { id: Number(parent_id) },
        });
        if (!parentUser) {
          return sendResponse(
            res,
            HttpStatusCodes.BAD_REQUEST,
            null,
            `Parent user with id ${parent_id} does not exist`,
          );
        }
        payload.parent_id = Number(parent_id);
      }

      const validate = await this.usersService.validateUser(payload);

      // Check if user already exists
      if (!validate) {
        return sendResponse(
          res,
          HttpStatusCodes.CONFLICT,
          null,
          Errors.USER_NAME_EXISTED.message,
        );
      }

      const result = await this.usersService.store(payload);
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
    summary: 'Update Public User',
  })
  @ApiOkResponse({
    type: UpdateUserResponse,
  })
  async update(
    @Body() data: UpdateUserDto,
    @Param('id') id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      console.log(data);
      const {
        address,
        gender,
        email,
        name,
        url,
        status,
        role,
        phone,
        parent_id,
        status_reason,
        contact_status,
      } = data;
      if (role && !ALLOWED_ROLES.includes(role)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          null,
          `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
        );
      }

      const updatedBy = req.user?.username || 'system';

      const payload: any = {
        updated_by: updatedBy,
      };

      // Only add fields if they are provided
      if (address !== undefined) {
        payload.address = address;
      }
      if (email !== undefined) {
        payload.email = email;
      }
      if (gender !== undefined) {
        payload.gender = gender;
      }
      if (name !== undefined) {
        payload.name = name;
      }
      if (url !== undefined) {
        payload.url = url;
      }
      if (status !== undefined) {
        payload.status = status;
      }
      if (role !== undefined) {
        payload.role = role;
      }
      if (phone !== undefined) {
        payload.phone = phone;
      }
      if (status_reason !== undefined && status_reason !== null) {
        payload.status_reason = status_reason;
      }
      if (contact_status !== undefined) {
        payload.contact_status = contact_status;
      }

      // Only add parent_id if it's a valid positive number
      if (parent_id && Number(parent_id) > 0) {
        // Validate that parent user exists
        const parentUser = await this.usersService.findOne({
          where: { id: Number(parent_id) },
        });
        if (!parentUser) {
          return sendResponse(
            res,
            HttpStatusCodes.BAD_REQUEST,
            null,
            `Parent user with id ${parent_id} does not exist`,
          );
        }
        payload.parent_id = Number(parent_id);
      } else if (parent_id === null) {
        // Allow explicitly setting parent_id to null to remove parent relationship
        payload.parent_id = null;
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
