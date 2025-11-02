import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 初始化标记 DTO
 * 用于记录一次性模块初始化状态（如货币、用户等数据初始化）
 */
export class InitFlagsDto {
  @ApiProperty({
    description: '货币模块是否已初始化',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  currency?: boolean;

  @ApiProperty({
    description: '用户模块是否已初始化',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  user?: boolean;

  @ApiProperty({
    description: '订单模块是否已初始化',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  order?: boolean;
}

/**
 * 系统配置 DTO
 * 用于获取和更新系统配置，配合实体当中的 config 属性使用，用于规范 JSONB 的属性结构
 */
export class SystemConfigDto {
  @ApiProperty({
    description: '初始化标记',
    type: InitFlagsDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => InitFlagsDto)
  @IsOptional()
  init?: InitFlagsDto;

  @ApiProperty({
    description: '货币模块配置',
    required: false,
  })
  @IsOptional()
  currency?: any; // 使用any类型，因为它是动态配置
}
