import { ApiProperty } from '@nestjs/swagger';
import { LogEvent } from '../entity/log-event.entity';

export class LogListResponse {
  @ApiProperty({ description: '日志列表', type: [LogEvent] })
  data: LogEvent[];

  @ApiProperty({ description: '总记录数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页大小' })
  limit: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}
