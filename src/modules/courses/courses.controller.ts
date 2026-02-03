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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { COURSE_STAFF_ROLE } from 'src/constants/course-staff-role';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { sendResponse } from 'src/utils/response.util';
import { CourseStaffService } from '../course-staff/course-staff.service';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  DeleteCourseDto,
  UpdateCourseDto,
} from './dto/course.dto';

@Controller('courses')
@ApiTags('Courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly courseStaffService: CourseStaffService,
  ) { }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Course' })
  async create(@Body() data: CreateCourseDto, @Res() res: Response, @Req() req: any) {
    try {
      // Check schedule conflict if lead_id is provided
      if (data.lead_id) {
        // We need to create the course first to get its ID, then check
        // But we can't check before creating. So we'll check after and rollback if needed.
        // Actually, better approach: check with a temporary course_id that we'll use
        // For now, let's check against existing courses for this user
        // We'll do a simplified check: get all courses where user is staff/lead
        const existingCourseStaff = await this.courseStaffService.search({
          user_id: data.lead_id,
        });
        const existingCourseIds = existingCourseStaff.map((cs) => cs.course_id);

        const leadCourses = await this.coursesService.find({
          where: existingCourseIds.map((id) => ({ id, status: true })),
        });

        // We can't fully validate without course ID, so we'll validate after creation
        // But for now, let's create and then validate
      }

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const createdBy = req.user?.username || 'system';
      const payload = {
        ...data,
        created_at: currentTimestamp,
        created_by: createdBy,
      } as any;
      const result = await this.coursesService.store(payload);

      // Check schedule conflict after creation (if lead_id exists)
      if (data.lead_id) {
        try {
          await this.courseStaffService.checkScheduleConflict(data.lead_id, result.id);
        } catch (conflictError) {
          // Rollback: delete the course if conflict detected
          await this.coursesService.delete(result.id);
          throw conflictError;
        }
      }

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
  @ApiOperation({ summary: 'List Courses' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Search in course_name or summary',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (true/false or 1/0)',
  })
  @ApiQuery({
    name: 'court_id',
    required: false,
    description: 'Filter by court ID',
  })
  @ApiQuery({
    name: 'staff_id',
    required: false,
    description: 'Filter courses where user is lead or course staff (user ID)',
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
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('court_id') court_id?: string,
    @Query('staff_id') staff_id?: string,
    @Query('skip') skip?: string,
    @Query('select') select?: string,
  ) {
    try {
      const [result, totalCount] = await this.coursesService.findFilteredPaginated({
        keyword,
        status,
        court_id: court_id ? Number(court_id) : undefined,
        staff_id: staff_id ? Number(staff_id) : undefined,
        skip: skip ? Number(skip) : 0,
        select: select ? Number(select) : 20,
      });
      const courseIds = result.map((c) => c.id);
      const staffByCourse = await this.loadStaffMap(courseIds);
      const mapped = result.map((c) => ({
        ...c,
        staff: staffByCourse.get(c.id) || [],
      }));
      return sendResponse(res, HttpStatusCodes.OK, { result: mapped, totalCount }, null);
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
  @ApiOperation({ summary: 'Get Course by ID' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.coursesService.findOne({
        where: { id: Number(id) },
      });
      if (!result) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Course not found',
        );
      }
      const staff = await this.courseStaffService.search({ course_id: result.id });
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        {
          ...result,
          staff,
        },
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

  @Put()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update Course' })
  async update(@Body() data: UpdateCourseDto, @Res() res: Response, @Req() req: any) {
    try {
      const { course_id, lead_id, ...rest } = data as any;
      const updatedBy = req.user?.username || 'system';

      // Check schedule conflict if lead_id is being updated
      if (lead_id !== undefined) {
        const existing = await this.coursesService.findOne({
          where: { id: course_id },
        });
        // Only check if lead_id is actually changing
        if (existing && existing.lead_id !== lead_id) {
          await this.courseStaffService.checkScheduleConflict(lead_id, course_id);
        }
      }

      await this.coursesService.update(course_id, { ...rest, lead_id, updated_by: updatedBy });
      const updated = await this.coursesService.findOne({
        where: { id: course_id },
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
  @ApiOperation({ summary: 'Delete Course' })
  async delete(@Body() data: DeleteCourseDto, @Res() res: Response) {
    try {
      const { course_id } = data;
      await this.coursesService.delete(course_id);
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
  private async loadStaffMap(courseIds: number[]): Promise<Map<number, any[]>> {
    const map = new Map<number, any[]>();
    if (courseIds.length === 0) return map;
    const all = await this.courseStaffService.search({ course_ids: courseIds });
    for (const cId of courseIds) {
      map.set(
        cId,
        all
          .filter((s) => s.course_id === cId)
          .map((s) => ({
            id: s.id,
            user_id: s.user_id,
            role: s.role || COURSE_STAFF_ROLE.SUB_TUTOR,
          })),
      );
    }
    return map;
  }
}
