import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
  IsInt,
  Max as MaxDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RewardPenaltyType } from '../entity/reward-penalty.entity';

// 创建奖罚DTO
export class CreateRewardPenaltyDto {
  @ApiProperty({ 
    description: '类型',
    example: RewardPenaltyType.REWARD,
    enum: RewardPenaltyType,
  })
  @IsEnum(RewardPenaltyType)
  type: RewardPenaltyType;

  @ApiProperty({ description: '金额', example: 200.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ description: '原因', example: '销售业绩突出' })
  @IsString()
  reason: string;

  @ApiProperty({ description: '日期', example: '2023-01-01' })
  @IsDateString()
  date: Date;

  @ApiProperty({ description: '备注信息', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

// 更新奖罚DTO
export class UpdateRewardPenaltyDto {
  @ApiProperty({ 
    description: '类型',
    example: RewardPenaltyType.REWARD,
    enum: RewardPenaltyType,
    required: false
  })
  @IsOptional()
  @IsEnum(RewardPenaltyType)
  type?: RewardPenaltyType;

  @ApiProperty({ description: '金额', example: 200.00, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @ApiProperty({ description: '原因', example: '销售业绩突出', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: '日期', example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiProperty({ description: '备注信息', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

// 查询奖罚DTO
export class QueryRewardPenaltyDto {
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

  @ApiProperty({ 
    description: '类型',
    example: RewardPenaltyType.REWARD,
    enum: RewardPenaltyType,
    required: false
  })
  @IsOptional()
  @IsEnum(RewardPenaltyType)
  type?: RewardPenaltyType;

  @ApiProperty({ description: '起始日期', example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiProperty({ description: '结束日期', example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiProperty({ description: '排序字段', example: 'date', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'date';

  @ApiProperty({ description: '排序方向', example: 'DESC', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// 奖罚列表项DTO
export class RewardPenaltyListItemDto {
  @ApiProperty({ description: '奖罚记录ID' })
  id: string;

  @ApiProperty({ description: '类型' })
  type: RewardPenaltyType;

  @ApiProperty({ description: '金额' })
  amount: number;

  @ApiProperty({ description: '原因' })
  reason: string;

  @ApiProperty({ description: '日期' })
  date: Date;

  @ApiProperty({ description: '备注信息' })
  remark?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

// 奖罚列表响应DTO
export class RewardPenaltyListResponseDto {
  @ApiProperty({ description: '奖罚列表' })
  data: RewardPenaltyListItemDto[];

  @ApiProperty({ description: '总记录数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页大小' })
  limit: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}

// 奖罚统计DTO
export class RewardPenaltyStatsDto {
  @ApiProperty({ description: '奖励总金额' })
  totalReward: number;

  @ApiProperty({ description: '处罚总金额' })
  totalPenalty: number;

  @ApiProperty({ description: '净奖励（奖励-处罚）' })
  netAmount: number;

  @ApiProperty({ description: '奖励记录数' })
  rewardCount: number;

  @ApiProperty({ description: '处罚记录数' })
  penaltyCount: number;
}
