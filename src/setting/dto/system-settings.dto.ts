import { ApiProperty } from '@nestjs/swagger';
import { SystemConfigDto } from './system-cofig.dto';

/**
 * 系统设置响应 DTO
 */
export class SystemSettingsDto {
  @ApiProperty({
    description: '公司名称',
    example: 'UName',
    required: false,
    nullable: true,
  })
  companyName: string | null;

  @ApiProperty({
    description: '税号',
    example: 'J-1234567890',
    required: false,
    nullable: true,
  })
  taxId: string | null;

  @ApiProperty({
    description: '地址',
    example: ['Street 1', 'City'],
    required: false,
    nullable: true,
  })
  address: string[];

  @ApiProperty({
    description: '系统配置',
    type: SystemConfigDto,
    required: false,
  })
  config: SystemConfigDto;
}
