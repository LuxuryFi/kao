import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/access-token.guard';
import {
  CreateSubscriptionDto,
  SearchSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/subscription.dto';
import { SubscriptionResponse } from './response/subscription.response';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@ApiTags('Subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Subscription' })
  @ApiOkResponse({ type: SubscriptionResponse })
  async create(@Body() dto: CreateSubscriptionDto) {
    return await this.subscriptionService.create(dto);
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update Subscription' })
  @ApiOkResponse({ type: SubscriptionResponse })
  async update(@Body() dto: UpdateSubscriptionDto) {
    return await this.subscriptionService.update(dto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft Delete Subscription' })
  async delete(@Param('id') id: number) {
    return await this.subscriptionService.softDelete(id);
  }

  @Get('by-student/:student_id')
  @ApiOperation({ summary: 'Get Subscriptions by Student ID' })
  async getByStudent(@Param('student_id') student_id: number) {
    return await this.subscriptionService.getByStudentId(student_id);
  }

  @Get('by-package/:package_id')
  @ApiOperation({ summary: 'Get Subscriptions by Package ID' })
  async getByPackage(@Param('package_id') package_id: number) {
    return await this.subscriptionService.getByPackageId(package_id);
  }

  @Get('student-list/:subscription_id')
  @ApiOperation({ summary: 'Get student list by subscription' })
  async getStudentListBySub(@Param('subscription_id') subscription_id: number) {
    return await this.subscriptionService.getStudentListBySubscription(
      subscription_id,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Subscription Detail' })
  @ApiOkResponse({ type: SubscriptionResponse })
  async detail(@Param('id') id: number) {
    return await this.subscriptionService.getById(id);
  }

  @Get()
  @ApiQuery({ name: 'student_id', required: false })
  @ApiQuery({ name: 'package_id', required: false })
  @ApiOperation({ summary: 'Search/List Subscriptions' })
  async search(@Query() q: SearchSubscriptionDto) {
    if (q.student_id || q.package_id) {
      return await this.subscriptionService.search(q);
    }
    return await this.subscriptionService.list();
  }
}
