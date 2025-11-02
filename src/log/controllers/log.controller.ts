import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LogService } from '../service/log.service';
import { LogEvent } from '../entity/log-event.entity';
import { QueryLogDto } from '../dto/query-log.dto';
import { RecordLogDto } from '../dto/record-log.dto';
import { LogListResponse } from '../dto/log-list.response';
import { LogStats } from '../dto/log-stats.response';

@ApiTags('日志管理')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ summary: '查询日志列表' })
  @ApiResponse({ 
    status: 200, 
    description: '成功返回日志列表',
    type: LogListResponse 
  })
  async getLogs(@Query() query: QueryLogDto): Promise<LogListResponse> {
    return this.logService.queryLogs(query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取日志统计信息' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始时间' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束时间' })
  @ApiQuery({ name: 'source', required: false, description: '来源模块过滤' })
  @ApiResponse({ 
    status: 200, 
    description: '成功返回统计信息',
    type: LogStats 
  })
  async getLogStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('source') source?: string,
  ): Promise<LogStats> {
    const filters: any = {};
    
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (source) filters.source = source;

    return this.logService.getLogStats(filters);
  }

  @Post('cleanup')
  @ApiOperation({ summary: '清理过期日志' })
  @ApiQuery({ name: 'daysToKeep', required: false, description: '保留天数，默认30天' })
  @ApiResponse({ 
    status: 200, 
    description: '成功清理日志',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number', description: '删除的记录数' }
      }
    }
  })
  async cleanupOldLogs(
    @Query('daysToKeep') daysToKeep?: string,
  ): Promise<{ deletedCount: number }> {
    const days = daysToKeep ? parseInt(daysToKeep, 10) : 30;
    const deletedCount = await this.logService.cleanupOldLogs(days);
    return { deletedCount };
  }

  @Post('record')
  @ApiOperation({ summary: '手动记录日志事件' })
  @ApiResponse({ 
    status: 201, 
    description: '成功记录事件',
    type: LogEvent
  })
  async recordEvent(@Body() recordLogDto: RecordLogDto) {
    return this.logService.recordEvent(
      recordLogDto.eventName,
      recordLogDto.level,
      recordLogDto.source,
      recordLogDto.payload
    );
  }
}
