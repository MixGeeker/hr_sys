import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class RecordLogDto {
  @ApiProperty({ description: '事件名称', example: 'user.login' })
  @IsString()
  @IsNotEmpty()
  eventName: string;

  @ApiProperty({ description: '事件级别', enum: ['info', 'warn', 'error'], example: 'info' })
  @IsString()
  @IsIn(['info', 'warn', 'error'])
  level: string;

  @ApiProperty({ description: '事件来源模块', example: 'auth' })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiPropertyOptional({ 
    description: '事件负载数据（JSON对象）', 
    example: { userId: 123, ip: '192.168.1.1' } 
  })
  @IsOptional()
  payload?: Record<string, unknown>;
}
