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
import { StudentsService } from './students.service';
import {
  CreateStudentDto,
  UpdateStudentDto,
  SearchStudentDto,
} from './dto/student.dto';
import {
  CreateStudentResponse,
  GetStudentResponse,
  UpdateStudentResponse,
} from './response/student.response';

@Controller('students')
@ApiTags('Students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Student' })
  @ApiOkResponse({ type: CreateStudentResponse })
  async create(
    @Body() data: CreateStudentDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const createdBy = req.user?.username || 'system';
      
      // Determine status based on parent role
      const status = await this.studentsService.determineStudentStatus(data.parent_id);
      
      const payload = {
        ...data,
        status,
        created_at: currentTimestamp,
        created_by: createdBy,
      } as any;
      const result = await this.studentsService.store(payload);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null);
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'List Students' })
  @ApiQuery({
    name: 'parent_id',
    required: false,
    description: 'Filter by parent ID',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by name',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'Filter by phone',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (trial, active, inactive)',
  })
  @ApiQuery({
    name: 'trial_status',
    required: false,
    description: 'Filter by trial status (đã đăng ký học thử, đã đến học thử)',
  })
  async findAll(
    @Res() res: Response,
    @Query() query: SearchStudentDto,
  ) {
    try {
      const [result, totalCount] = await this.studentsService.search(query);
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        { result, totalCount },
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
    summary: 'Get Students by Parent ID',
    description: 'Returns all students for a specific parent user',
  })
  async findByParent(
    @Param('parentId') parentId: number,
    @Res() res: Response,
  ): Promise<object> {
    try {
      const [result, totalCount] = await this.studentsService.getStudentsByParentId(
        Number(parentId),
      );
      return sendResponse(res, HttpStatusCodes.OK, { result, totalCount }, null);
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Student by ID' })
  @ApiOkResponse({ type: GetStudentResponse })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.studentsService.findOne({
        where: { id: Number(id) },
      });
      if (!result) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Student not found',
        );
      }
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update Student' })
  @ApiOkResponse({ type: UpdateStudentResponse })
  async update(
    @Body() data: UpdateStudentDto,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      const { id, ...rest } = data as any;
      const updatedBy = req.user?.username || 'system';
      await this.studentsService.update(id, {
        ...rest,
        updated_by: updatedBy,
      });
      const updated = await this.studentsService.findOne({
        where: { id },
      });
      return sendResponse(res, HttpStatusCodes.OK, updated, null);
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete Student' })
  async delete(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.studentsService.delete(id);
      return sendResponse(res, HttpStatusCodes.OK, true, null);
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }
}

