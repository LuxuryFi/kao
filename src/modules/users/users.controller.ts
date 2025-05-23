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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
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
import { sendResponse } from 'src/utils/response.util';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
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
  constructor(private readonly usersService: UsersService) {}
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
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
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
      status,
    } = PaginationDto;

    const [result, totalCount] = await this.usersService.getUserByRole({
      select,
      skip,
      role,
      username,
      email,
      name,
      status,
    });
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
      const {
        password,
        username,
        address,
        email,
        name,
        gender,
        url,
        start_date,
        end_date,
        role,
      } = data;

      if (role && !ALLOWED_ROLES.includes(role)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          null,
          `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
        );
      }
      const currentTimestamp = Math.floor(Date.now() / 1000); // Or use ms if you're storing milliseconds

      const hashedPassword = bcrypt.hashSync(password, 10);
      const payload = {
        password: hashedPassword,
        username,
        start_date,
        end_date,
        gender,
        role,
        address,
        email,
        name,
        created_at: currentTimestamp,
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
          Errors.USER_NAME_EXISTED.message,
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
      const {
        address,
        gender,
        email,
        name,
        url,
        status,
        role,
        start_date,
        end_date,
      } = data;
      if (role && !ALLOWED_ROLES.includes(role)) {
        return sendResponse(
          res,
          HttpStatusCodes.BAD_REQUEST,
          null,
          `Invalid role. Allowed roles: ${ALLOWED_ROLES.join(', ')}`,
        );
      }

      const payload = {
        address,
        email,
        gender,
        name,
        url,
        status,
        start_date,
        end_date,
        role,
      };

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
