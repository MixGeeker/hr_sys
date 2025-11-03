import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SalaryService } from '../service/salary.service';
import { RewardPenaltyService } from '../service/reward-penalty.service';
import { Salary } from '../entity/salary.entity';
import { RewardPenalty } from '../entity/reward-penalty.entity';
import {
  CreateSalaryDto,
  UpdateSalaryDto,
  QuerySalaryDto,
  SalaryListResponseDto,
  SalaryStatsDto,
  CreateRewardPenaltyDto,
  UpdateRewardPenaltyDto,
  QueryRewardPenaltyDto,
  RewardPenaltyListResponseDto,
  RewardPenaltyStatsDto,
} from '../dto';

@ApiTags('薪酬管理')
@Controller('employees/:employeeId/salary')
export class SalaryController {
  constructor(
    private readonly salaryService: SalaryService,
    private readonly rewardPenaltyService: RewardPenaltyService,
  ) {}

  // ===== 薪酬管理 =====

  @Post()
  @ApiOperation({ summary: '添加薪酬记录' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiResponse({ status: 201, description: '创建成功', type: Salary })
  @ApiResponse({ status: 404, description: '职员不存在' })
  async createSalary(
    @Param('employeeId') employeeId: string,
    @Body() createSalaryDto: CreateSalaryDto,
  ): Promise<Salary> {
    return await this.salaryService.create(employeeId, createSalaryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取薪酬记录列表' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页大小' })
  @ApiQuery({ name: 'dateFrom', required: false, description: '起始日期' })
  @ApiQuery({ name: 'dateTo', required: false, description: '结束日期' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  @ApiResponse({ status: 200, description: '获取成功', type: SalaryListResponseDto })
  async findAllSalary(
    @Param('employeeId') employeeId: string,
    @Query() queryDto: QuerySalaryDto,
  ): Promise<SalaryListResponseDto> {
    return await this.salaryService.findAll(employeeId, queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取薪酬统计' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: '起始日期' })
  @ApiQuery({ name: 'dateTo', required: false, description: '结束日期' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: SalaryStatsDto,
  })
  async getSalaryStats(
    @Param('employeeId') employeeId: string,
    @Query('dateFrom') dateFrom?: Date,
    @Query('dateTo') dateTo?: Date,
  ): Promise<SalaryStatsDto> {
    return await this.salaryService.getStats(employeeId, dateFrom, dateTo);
  }

  @Get('monthly/:year/:month')
  @ApiOperation({ summary: '获取月度薪酬统计' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'year', description: '年份' })
  @ApiParam({ name: 'month', description: '月份' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        workingDays: { type: 'number' },
        totalSalary: { type: 'number' },
        days: { type: 'array' },
      },
    },
  })
  async getMonthlySalary(
    @Param('employeeId') employeeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return await this.salaryService.getMonthlyStats(employeeId, year, month);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取薪酬记录详情' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '薪酬记录ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Salary })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async findOneSalary(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ): Promise<Salary> {
    return await this.salaryService.findOne(id, employeeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新薪酬记录' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '薪酬记录ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Salary })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async updateSalary(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
    @Body() updateSalaryDto: UpdateSalaryDto,
  ): Promise<Salary> {
    return await this.salaryService.update(id, updateSalaryDto, employeeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除薪酬记录' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '薪酬记录ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSalary(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.salaryService.remove(id, employeeId);
  }

  // ===== 奖罚管理 =====

  @Post('../reward-penalty')
  @ApiOperation({ summary: '添加奖罚记录' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiResponse({ status: 201, description: '创建成功', type: RewardPenalty })
  @ApiResponse({ status: 404, description: '职员不存在' })
  async createRewardPenalty(
    @Param('employeeId') employeeId: string,
    @Body() createRewardPenaltyDto: CreateRewardPenaltyDto,
  ): Promise<RewardPenalty> {
    return await this.rewardPenaltyService.create(employeeId, createRewardPenaltyDto);
  }

  @Get('../reward-penalty')
  @ApiOperation({ summary: '获取奖罚记录列表' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页大小' })
  @ApiQuery({ name: 'type', required: false, description: '类型' })
  @ApiQuery({ name: 'dateFrom', required: false, description: '起始日期' })
  @ApiQuery({ name: 'dateTo', required: false, description: '结束日期' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  @ApiResponse({ status: 200, description: '获取成功', type: RewardPenaltyListResponseDto })
  async findAllRewardPenalty(
    @Param('employeeId') employeeId: string,
    @Query() queryDto: QueryRewardPenaltyDto,
  ): Promise<RewardPenaltyListResponseDto> {
    return await this.rewardPenaltyService.findAll(employeeId, queryDto);
  }

  @Get('../reward-penalty/stats')
  @ApiOperation({ summary: '获取奖罚统计' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: '起始日期' })
  @ApiQuery({ name: 'dateTo', required: false, description: '结束日期' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: RewardPenaltyStatsDto,
  })
  async getRewardPenaltyStats(
    @Param('employeeId') employeeId: string,
    @Query('dateFrom') dateFrom?: Date,
    @Query('dateTo') dateTo?: Date,
  ): Promise<RewardPenaltyStatsDto> {
    return await this.rewardPenaltyService.getStats(employeeId, dateFrom, dateTo);
  }

  @Get('../reward-penalty/monthly/:year/:month')
  @ApiOperation({ summary: '获取月度奖罚统计' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'year', description: '年份' })
  @ApiParam({ name: 'month', description: '月份' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        totalReward: { type: 'number' },
        totalPenalty: { type: 'number' },
        netAmount: { type: 'number' },
        rewards: { type: 'array' },
        penalties: { type: 'array' },
      },
    },
  })
  async getMonthlyRewardPenalty(
    @Param('employeeId') employeeId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return await this.rewardPenaltyService.getMonthlyStats(employeeId, year, month);
  }

  @Get('../reward-penalty/:id')
  @ApiOperation({ summary: '获取奖罚记录详情' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '奖罚记录ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: RewardPenalty })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async findOneRewardPenalty(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ): Promise<RewardPenalty> {
    return await this.rewardPenaltyService.findOne(id, employeeId);
  }

  @Patch('../reward-penalty/:id')
  @ApiOperation({ summary: '更新奖罚记录' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '奖罚记录ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: RewardPenalty })
  @ApiResponse({ status: 404, description: '记录不存在' })
  async updateRewardPenalty(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
    @Body() updateRewardPenaltyDto: UpdateRewardPenaltyDto,
  ): Promise<RewardPenalty> {
    return await this.rewardPenaltyService.update(id, updateRewardPenaltyDto, employeeId);
  }

  @Delete('../reward-penalty/:id')
  @ApiOperation({ summary: '删除奖罚记录' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '奖罚记录ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '记录不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRewardPenalty(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.rewardPenaltyService.remove(id, employeeId);
  }
}
