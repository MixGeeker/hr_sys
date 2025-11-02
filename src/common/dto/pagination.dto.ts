import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: '页码，从1开始',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationResponseDto<T> {
  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  data: T[];

  @ApiProperty({
    description: '分页信息',
    example: { total: 100, page: 1, limit: 10 },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
