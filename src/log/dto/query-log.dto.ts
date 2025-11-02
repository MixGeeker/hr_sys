import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class QueryLogDto {
  @ApiPropertyOptional({ description: '日志级别过滤', enum: ['info', 'warn', 'error'] })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ description: '事件来源模块过滤' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '事件名称过滤（支持模糊匹配）' })
  @IsOptional()
  @IsString()
  eventName?: string;

  @ApiPropertyOptional({ description: '开始时间', example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束时间', example: '2024-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '搜索关键词（搜索事件名称、来源和负载内容）' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页大小', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
