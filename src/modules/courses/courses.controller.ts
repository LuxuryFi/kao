import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { sendResponse } from 'src/utils/response.util';
import { CoursesService } from './courses.service';
import { CreateCourseDto, DeleteCourseDto, UpdateCourseDto } from './dto/course.dto';

@Controller('courses')
@ApiTags('Courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create Course' })
  async create(@Body() data: CreateCourseDto, @Res() res: Response) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const payload = { ...data, created_at: currentTimestamp } as any;
      const result = await this.coursesService.store(payload);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List Courses' })
  async findAll(@Res() res: Response) {
    try {
      const result = await this.coursesService.find();
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Course by ID' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.coursesService.findOne({ where: { id: Number(id) } });
      if (!result) {
        return sendResponse(res, HttpStatusCodes.NOT_FOUND, null, 'Course not found');
      }
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Put()
  @ApiOperation({ summary: 'Update Course' })
  async update(@Body() data: UpdateCourseDto, @Res() res: Response) {
    try {
      const { course_id, ...rest } = data as any;
      await this.coursesService.update(course_id, rest);
      const updated = await this.coursesService.findOne({ where: { id: course_id } });
      return sendResponse(res, HttpStatusCodes.OK, updated, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
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
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }
}


