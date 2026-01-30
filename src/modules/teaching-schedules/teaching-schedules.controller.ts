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
  CreateTeachingScheduleDto,
  GenerateTeachingScheduleDto,
  SearchTeachingScheduleDto,
  UpdateTeachingScheduleDto,
  UpdateTeachingScheduleStatusDto,
} from './dto/teaching-schedule.dto';
import { TeachingSchedulesService } from './teaching-schedules.service';

@Controller('teaching-schedules')
@ApiTags('Teaching Schedules')
export class TeachingSchedulesController {
  constructor(private readonly teachingSchedulesService: TeachingSchedulesService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create teaching schedule (manual)' })
  async create(@Body() dto: CreateTeachingScheduleDto, @Res() res: Response) {
    try {
      const result = await this.teachingSchedulesService.create(dto);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update teaching schedule' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateTeachingScheduleDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.teachingSchedulesService.update({ ...dto, id: Number(id) });
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete teaching schedule' })
  async delete(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.teachingSchedulesService.delete(Number(id));
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List teaching schedules with filters' })
  @ApiQuery({ name: 'course_id', required: false })
  @ApiQuery({ name: 'user_id', required: false })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'time', required: false })
  @ApiQuery({ name: 'status', required: false })
  async search(@Query() q: SearchTeachingScheduleDto, @Res() res: Response) {
    try {
      const result = await this.teachingSchedulesService.search(q);
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        { result, totalCount: result.length },
        null,
      );
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Post('generate')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Generate next-week teaching schedules from course schedule and staff',
  })
  async generate(@Body() dto: GenerateTeachingScheduleDto, @Res() res: Response) {
    try {
      const result = await this.teachingSchedulesService.generateNextWeek(dto);
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Put(':id/status')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update status of teaching schedule' })
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateTeachingScheduleStatusDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.teachingSchedulesService.updateStatus(
        Number(id),
        dto.status,
      );
      if (!result) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Teaching schedule not found',
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

  @Put(':id/check-in')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check-in / update status for teaching schedule (deprecated, use PUT /:id/status)' })
  async checkIn(
    @Param('id') id: number,
    @Body() body: { status: string },
    @Res() res: Response,
  ) {
    try {
      const result = await this.teachingSchedulesService.updateStatus(
        Number(id),
        body.status,
      );
      if (!result) {
        return sendResponse(
          res,
          HttpStatusCodes.NOT_FOUND,
          null,
          'Teaching schedule not found',
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
}


