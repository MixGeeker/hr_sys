import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsDateString,
  IsNumber,
  Min,
  IsInt,
  Min as MinDate,
  Max as MaxDate,
} from 'class-validator';
import { Type } from 'class-transformer';

// 创建薪酬DTO
export class CreateSalaryDto {
  @ApiProperty({ description: '日薪金额', example: 150.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dailyWage: number;

  @ApiProperty({ description: '工作日期', example: '2023-01-01' })
  @IsDateString()
  workDate: Date;

  @ApiProperty({ description: '备注信息', example: '正常工作日', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

// 更新薪酬DTO
export class UpdateSalaryDto {
  @ApiProperty({ description: '日薪金额', example: 150.00, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  dailyWage?: number;

  @ApiProperty({ description: '工作日期', example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  workDate?: Date;

  @ApiProperty({ description: '备注信息', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

// 查询薪酬DTO
export class QuerySalaryDto {
  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页大小', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @MaxDate(100)
  limit?: number = 10;

  @ApiProperty({ description: '起始日期', example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiProperty({ description: '结束日期', example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiProperty({ description: '排序字段', example: 'workDate', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'workDate';

  @ApiProperty({ description: '排序方向', example: 'DESC', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// 薪酬列表项DTO
export class SalaryListItemDto {
  @ApiProperty({ description: '薪酬记录ID' })
  id: string;

  @ApiProperty({ description: '日薪金额' })
  dailyWage: number;

  @ApiProperty({ description: '工作日期' })
  workDate: Date;

  @ApiProperty({ description: '备注信息' })
  remark?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

// 薪酬列表响应DTO
export class SalaryListResponseDto {
  @ApiProperty({ description: '薪酬列表' })
  data: SalaryListItemDto[];

  @ApiProperty({ description: '总记录数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页大小' })
  limit: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}

// 薪酬统计DTO
export class SalaryStatsDto {
  @ApiProperty({ description: '总工作天数' })
  totalDays: number;

  @ApiProperty({ description: '总薪酬金额' })
  totalAmount: number;

  @ApiProperty({ description: '平均日薪' })
  averageDailyWage: number;
}
