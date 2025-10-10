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
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { sendResponse } from 'src/utils/response.util';
import { CourseStudentsService } from './course-students.service';
import {
  CreateCourseStudentDto,
  DeleteCourseStudentDto,
  UpdateCourseStudentDto,
} from './dto/course-student.dto';
import {
  CreateCourseStudentResponse,
  GetCourseStudentResponse,
  UpdateCourseStudentResponse,
} from './response/course-student.response';

@Controller('course-students')
@ApiTags('Course Students')
export class CourseStudentsController {
  constructor(
    private readonly courseStudentsService: CourseStudentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Course Student' })
  @ApiOkResponse({ type: CreateCourseStudentResponse })
  async create(@Body() data: CreateCourseStudentDto, @Res() res: Response) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const payload = {
        ...data,
        created_at: currentTimestamp,
        status: data.status !== undefined ? data.status : true,
      } as any;
      const result = await this.courseStudentsService.store(payload);
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
  @ApiOperation({ summary: 'List Course Students' })
  @ApiQuery({
    name: 'student_id',
    required: false,
    description: 'Filter by student ID',
  })
  @ApiQuery({
    name: 'course_id',
    required: false,
    description: 'Filter by course ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (true/false or 1/0)',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Items to skip (offset)',
  })
  @ApiQuery({
    name: 'select',
    required: false,
    description: 'Items per page (limit)',
  })
  async findAll(
    @Res() res: Response,
    @Query('student_id') student_id?: string,
    @Query('course_id') course_id?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('select') select?: string,
  ) {
    try {
      const [result, totalCount] =
        await this.courseStudentsService.findFilteredPaginated({
          student_id: student_id ? Number(student_id) : undefined,
          course_id: course_id ? Number(course_id) : undefined,
          status,
          skip: skip ? Number(skip) : 0,
          select: select ? Number(select) : 20,
        });
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

  @Get('by-student/:studentId')
  @ApiOperation({ summary: 'Get Course Students by Student ID' })
  async findByStudent(
    @Param('studentId') studentId: number,
    @Res() res: Response,
  ) {
    try {
      const [result, totalCount] =
        await this.courseStudentsService.findByStudentId(Number(studentId));
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

  @Get('by-course/:courseId')
  @ApiOperation({ summary: 'Get Course Students by Course ID' })
  async findByCourse(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    try {
      const [result, totalCount] =
        await this.courseStudentsService.findByCourseId(Number(courseId));
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

  @Get('students-by-course/:courseId')
  @ApiOperation({
    summary: 'Get Students with User Details by Course ID',
    description:
      'Returns student information including user details (name, email, phone, etc.) for a specific course. Password and sensitive data are excluded.',
  })
  async getStudentsByCourse(
    @Param('courseId') courseId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.courseStudentsService.findStudentsByCourseId(
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

  @Get('courses-by-student/:studentId')
  @ApiOperation({
    summary: 'Get Courses with Details by Student ID',
    description:
      'Returns course information with full course details for a specific student.',
  })
  async getCoursesByStudent(
    @Param('studentId') studentId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.courseStudentsService.findCoursesByStudentId(
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

  @Get(':id')
  @ApiOperation({ summary: 'Get Course Student by ID' })
  @ApiOkResponse({ type: GetCourseStudentResponse })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.courseStudentsService.findOne({
        where: { id: Number(id) },
      });
      if (!result) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Course Student not found',
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
  @ApiOperation({ summary: 'Update Course Student' })
  @ApiOkResponse({ type: UpdateCourseStudentResponse })
  async update(@Body() data: UpdateCourseStudentDto, @Res() res: Response) {
    try {
      const { id, ...rest } = data as any;
      await this.courseStudentsService.update(id, rest);
      const updated = await this.courseStudentsService.findOne({
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

  @Delete()
  @ApiOperation({ summary: 'Delete Course Student' })
  async delete(@Body() data: DeleteCourseStudentDto, @Res() res: Response) {
    try {
      const { id } = data;
      await this.courseStudentsService.delete(id);
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

