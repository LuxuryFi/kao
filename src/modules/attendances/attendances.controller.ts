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
    UseGuards,
} from '@nestjs/common';
import {
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { sendResponse } from 'src/utils/response.util';
import { AttendancesService } from './attendances.service';
import {
    CreateAttendanceDto,
    SearchAttendanceDto,
    UpdateAttendanceDto,
} from './dto/attendance.dto';
import { AttendanceResponse } from './response/attendance.response';

@Controller('attendances')
@ApiTags('Attendance')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Create Attendance' })
  @ApiOkResponse({ type: AttendanceResponse })
  async create(@Body() dto: CreateAttendanceDto, @Res() res: Response) {
    try {
      const result = await this.attendancesService.create(dto);
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

  @Put()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update Attendance' })
  @ApiOkResponse({ type: AttendanceResponse })
  async update(@Body() dto: UpdateAttendanceDto, @Res() res: Response) {
    try {
      const result = await this.attendancesService.update(dto);
      if (!result) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Attendance not found',
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

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Delete Attendance' })
  async delete(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.attendancesService.delete(id);
      return sendResponse(res, HttpStatusCodes.OK, { success: true }, null);
    } catch (err) {
      return sendResponse(
        res,
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        null,
        err.message,
      );
    }
  }

  @Get('by-student/:studentId')
  @ApiOperation({ summary: 'Get Attendances by Student ID' })
  async getByStudent(
    @Param('studentId') studentId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.attendancesService.findByStudentId(
        Number(studentId),
      );
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        { result, totalCount: result.length },
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

  @Get('by-course/:courseId')
  @ApiOperation({ summary: 'Get Attendances by Course ID' })
  async getByCourse(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.attendancesService.findByCourseId(
        Number(courseId),
      );
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        { result, totalCount: result.length },
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

  @Get(':id')
  @ApiOperation({ summary: 'Get Attendance Detail' })
  @ApiOkResponse({ type: AttendanceResponse })
  async detail(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.attendancesService.findOne(Number(id));
      if (!result) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Attendance not found',
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

  @Get()
  @ApiQuery({ name: 'student_id', required: false })
  @ApiQuery({ name: 'course_id', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiOperation({ summary: 'Search/List Attendances' })
  async search(@Query() q: SearchAttendanceDto, @Res() res: Response) {
    try {
      const result = await this.attendancesService.search(q);
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        { result, totalCount: result.length },
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

  @Post('create-for-all-users')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Create Attendances for All Users',
    description:
      'Tạo attendance cho toàn bộ users có đủ điều kiện (có course active và subscription). Kiểm tra xem đã có attendance chưa trước khi tạo.',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter users by role (e.g., "student")',
  })
  @ApiOkResponse({
    description: 'Kết quả tạo attendance cho tất cả users',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', description: 'Tổng số users' },
        processedUsers: {
          type: 'number',
          description: 'Số users đã được xử lý và tạo attendance',
        },
        createdAttendances: {
          type: 'number',
          description: 'Tổng số attendance đã tạo',
        },
        skippedUsers: {
          type: 'number',
          description: 'Số users bị bỏ qua (đã có attendance hoặc không đủ điều kiện)',
        },
        details: {
          type: 'array',
          description: 'Chi tiết từng user',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number' },
              userName: { type: 'string' },
              hasActiveCourses: { type: 'boolean' },
              hasSubscription: { type: 'boolean' },
              hasStartDate: { type: 'boolean' },
              attendancesCreated: { type: 'number' },
              status: {
                type: 'string',
                enum: ['created', 'skipped', 'error'],
              },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async createForAllUsers(
    @Query('role') role?: string,
    @Res() res?: Response,
  ) {
    try {
      const result = await this.attendancesService.createAttendancesForAllUsers(
        role,
      );
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

  @Get('student-status/:studentId')
  @ApiOperation({
    summary: 'Get Student Status',
    description:
      'Lấy trạng thái của học sinh: đã có subscription hay chưa, đã tham gia lớp nào, có thể tạo attendance không',
  })
  @ApiOkResponse({
    description: 'Trạng thái của học sinh',
    schema: {
      type: 'object',
      properties: {
        student_id: { type: 'number' },
        student_name: { type: 'string' },
        has_subscription: { type: 'boolean' },
        subscription: {
          type: 'object',
          properties: {
            subscription_id: { type: 'number' },
            package_id: { type: 'number' },
            package_name: { type: 'string' },
            quantity: { type: 'number' },
            start_date: { type: 'number' },
            status: { type: 'number' },
          },
        },
        has_courses: { type: 'boolean' },
        courses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              course_id: { type: 'number' },
              course_name: { type: 'string' },
              status: { type: 'boolean' },
              schedule: { type: 'string' },
              court_id: { type: 'number' },
            },
          },
        },
        can_create_attendance: { type: 'boolean' },
        reason: { type: 'string' },
      },
    },
  })
  async getStudentStatus(
    @Param('studentId') studentId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.attendancesService.getStudentStatus(
        Number(studentId),
      );
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
}
