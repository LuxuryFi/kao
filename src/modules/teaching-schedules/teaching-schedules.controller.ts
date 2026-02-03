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
  CheckInTeachingScheduleDto,
  CheckOutTeachingScheduleDto,
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
  constructor(private readonly teachingSchedulesService: TeachingSchedulesService) { }

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
  @ApiOperation({
    summary: 'Update status of teaching schedule',
    description:
      'Requires lat/long for location verification. Must be within 100m of the court location.',
  })
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateTeachingScheduleStatusDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.teachingSchedulesService.updateStatus(
        Number(id),
        dto.status,
        dto.lat,
        dto.long,
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
      const statusCode =
        err.status === 400
          ? HttpStatusCodes.BAD_REQUEST
          : HttpStatusCodes.INTERNAL_SERVER_ERROR;
      return sendResponse(res, statusCode, null, err.message);
    }
  }

  @Put(':id/check-in')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check-in for teaching schedule',
    description:
      'Requires lat/long for location verification. Must be within 100m of the court location. Automatically sets status to CHECKED_IN.',
  })
  async checkIn(
    @Param('id') id: number,
    @Body() dto: CheckInTeachingScheduleDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.teachingSchedulesService.checkIn(
        Number(id),
        dto.lat,
        dto.long,
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
      const statusCode =
        err.status === 400
          ? HttpStatusCodes.BAD_REQUEST
          : HttpStatusCodes.INTERNAL_SERVER_ERROR;
      return sendResponse(res, statusCode, null, err.message);
    }
  }

  @Put(':id/check-out')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check-out for teaching schedule',
    description:
      'Requires lat/long for location verification. Must be within 100m of the court location. Updates status to CHECKED_OUT.',
  })
  async checkOut(
    @Param('id') id: number,
    @Body() dto: CheckOutTeachingScheduleDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.teachingSchedulesService.checkOut(
        Number(id),
        dto.lat,
        dto.long,
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
      const statusCode =
        err.status === 400
          ? HttpStatusCodes.BAD_REQUEST
          : HttpStatusCodes.INTERNAL_SERVER_ERROR;
      return sendResponse(res, statusCode, null, err.message);
    }
  }
}


