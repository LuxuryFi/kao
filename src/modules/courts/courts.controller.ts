import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { sendResponse } from 'src/utils/response.util';
import { CourtsService } from './courts.service';
import { CreateCourtDto, DeleteCourtDto, UpdateCourtDto } from './dto/court.dto';

@Controller('courts')
@ApiTags('Courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Court' })
  async create(@Body() data: CreateCourtDto, @Res() res: Response) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const payload = { ...data, created_at: currentTimestamp } as any;
      const result = await this.courtsService.store(payload);
      // map id -> courts_id in response
      const mapped = { courts_id: result.id, ...result } as any;
      delete mapped.id;
      return sendResponse(res, HttpStatusCodes.CREATED, mapped, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List Courts' })
  async findAll(@Res() res: Response) {
    try {
      const result = await this.courtsService.find();
      const mapped = result.map((r: any) => {
        const item = { courts_id: r.id, ...r } as any;
        delete item.id;
        return item;
      });
      return sendResponse(res, HttpStatusCodes.OK, mapped, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Court by ID' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.courtsService.findOne({ where: { id: Number(id) } });
      if (!result) {
        return sendResponse(res, HttpStatusCodes.NOT_FOUND, null, 'Court not found');
      }
      const mapped = { courts_id: result.id, ...result } as any;
      delete mapped.id;
      return sendResponse(res, HttpStatusCodes.OK, mapped, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Put()
  @ApiOperation({ summary: 'Update Court' })
  async update(@Body() data: UpdateCourtDto, @Res() res: Response) {
    try {
      const { courts_id, ...rest } = data as any;
      await this.courtsService.update(courts_id, rest);
      const updated = await this.courtsService.findOne({ where: { id: courts_id } });
      const mapped = updated ? ({ courts_id: updated.id, ...updated } as any) : null;
      if (mapped) delete (mapped as any).id;
      return sendResponse(res, HttpStatusCodes.OK, mapped, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Court' })
  async delete(@Body() data: DeleteCourtDto, @Res() res: Response) {
    try {
      const { courts_id } = data;
      await this.courtsService.delete(courts_id);
      return sendResponse(res, HttpStatusCodes.OK, true, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }
}


