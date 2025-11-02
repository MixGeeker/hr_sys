import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SystemConfigDto } from './system-cofig.dto';

/**
 * 创建/更新设置 DTO
 */
export class CreateSettingDto {
  @ApiProperty({ description: '公司名称', example: 'UName', required: false })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: '税号',
    example: 'J-1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    description: '地址',
    example: ['Street 1', 'City'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  address?: string[];

  @ApiProperty({
    description: '系统配置',
    type: SystemConfigDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => SystemConfigDto)
  @IsOptional()
  config?: SystemConfigDto;
}
