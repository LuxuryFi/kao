import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { sendResponse } from 'src/utils/response.util';
import { CourtsService } from './courts.service';
import { CreateCourtDto, DeleteCourtDto, UpdateCourtDto } from './dto/court.dto';

@Controller('courts')
@ApiTags('Courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Create Court' })
  async create(@Body() data: CreateCourtDto, @Res() res: Response, @Req() req: any) {
    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const createdBy = req.user?.username || 'system';
      const payload = { ...data, created_at: currentTimestamp, created_by: createdBy } as any;
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
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search by name (LIKE)' })
  @ApiQuery({ name: 'skip', required: false, description: 'Items to skip (offset)' })
  @ApiQuery({ name: 'select', required: false, description: 'Items per page (limit)' })
  async findAll(
    @Res() res: Response,
    @Query('city') city?: string,
    @Query('district') district?: string,
    @Query('keyword') keyword?: string,
    @Query('skip') skip?: string,
    @Query('select') select?: string,
  ) {
    try {
      const [result, totalCount] = await this.courtsService.findFilteredPaginated({
        city,
        district,
        keyword,
        skip: skip ? Number(skip) : 0,
        select: select ? Number(select) : 20,
      });
      const mapped = result.map((r: any) => {
        const item = { courts_id: r.id, ...r } as any;
        delete item.id;
        return item;
      });
      return sendResponse(res, HttpStatusCodes.OK, { result: mapped, totalCount }, null);
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
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update Court' })
  async update(@Body() data: UpdateCourtDto, @Res() res: Response, @Req() req: any) {
    try {
      const { courts_id, ...rest } = data as any;
      const updatedBy = req.user?.username || 'system';
      await this.courtsService.update(courts_id, { ...rest, updated_by: updatedBy });
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


