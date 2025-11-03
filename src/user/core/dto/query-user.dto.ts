import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

/**
 * 查询用户DTO
 * 支持分页和多维度筛选
 */
export class QueryUserDto extends PaginationDto {
  @ApiProperty({
    description: '用户名，支持模糊查询',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: '昵称，支持模糊查询',
    example: '管理员',
    required: false,
  })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    description: '邮箱，支持模糊查询',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: '用户状态：1-正常, 0-禁用',
    example: 1,
    required: false,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  status?: number;
}
