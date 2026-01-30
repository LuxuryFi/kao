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
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { sendResponse } from 'src/utils/response.util';
import {
  CreateCourseStaffDto,
  SearchCourseStaffDto,
  UpdateCourseStaffDto,
} from './dto/course-staff.dto';
import { CourseStaffService } from './course-staff.service';

@Controller('course-staff')
@ApiTags('Course Staff')
export class CourseStaffController {
  constructor(private readonly courseStaffService: CourseStaffService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add staff to course' })
  async create(@Body() dto: CreateCourseStaffDto, @Res() res: Response) {
    try {
      const result = await this.courseStaffService.create(dto);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update course staff record' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateCourseStaffDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.courseStaffService.update(Number(id), dto);
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove staff from course' })
  async delete(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.courseStaffService.delete(Number(id));
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List course staff' })
  @ApiQuery({ name: 'course_id', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  async search(@Query() q: SearchCourseStaffDto, @Res() res: Response) {
    try {
      const result = await this.courseStaffService.search(q);
      return sendResponse(res, HttpStatusCodes.OK, { result, totalCount: result.length }, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }
}


