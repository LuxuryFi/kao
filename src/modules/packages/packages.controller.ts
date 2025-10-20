import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpStatusCodes } from 'src/constants/common';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import { sendResponse } from 'src/utils/response.util';
import { CreatePackageDto, DeletePackageDto, UpdatePackageDto } from './dto/package.dto';
import { PackagesService } from './packages.service';

@Controller('packages')
@ApiTags('Packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Create Package' })
  async create(@Body() data: CreatePackageDto, @Res() res: Response, @Req() req: any) {
    try {
      const createdBy = req.user?.username || 'system';
      const payload = { ...data, created_by: createdBy };
      const result = await this.packagesService.store(payload);
      return sendResponse(res, HttpStatusCodes.CREATED, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List Packages' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search in package_name or summary' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (1/0 or true/false)' })
  @ApiQuery({ name: 'skip', required: false, description: 'Items to skip (offset)' })
  @ApiQuery({ name: 'select', required: false, description: 'Items per page (limit)' })
  async findAll(
    @Res() res: Response,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
    @Query('skip') skip?: string,
    @Query('select') select?: string,
  ) {
    try {
      const [result, totalCount] = await this.packagesService.findFilteredPaginated({
        keyword,
        status,
        skip: skip ? Number(skip) : 0,
        select: select ? Number(select) : 20,
      });
      return sendResponse(res, HttpStatusCodes.OK, { result, totalCount }, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Package by ID' })
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.packagesService.findOne({ where: { package_id: Number(id) } });
      if (!result) {
        return sendResponse(res, HttpStatusCodes.NOT_FOUND, null, 'Package not found');
      }
      return sendResponse(res, HttpStatusCodes.OK, result, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Update Package' })
  async update(@Body() data: UpdatePackageDto, @Res() res: Response, @Req() req: any) {
    try {
      const { package_id, ...rest } = data as any;
      const updatedBy = req.user?.username || 'system';
      await this.packagesService.update(package_id, { ...rest, updated_by: updatedBy });
      const updated = await this.packagesService.findOne({ where: { package_id } });
      return sendResponse(res, HttpStatusCodes.OK, updated, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete Package' })
  async delete(@Body() data: DeletePackageDto, @Res() res: Response) {
    try {
      const { package_id } = data;
      await this.packagesService.delete(package_id);
      return sendResponse(res, HttpStatusCodes.OK, true, null);
    } catch (err) {
      return sendResponse(res, HttpStatusCodes.INTERNAL_SERVER_ERROR, null, err.message);
    }
  }
}
