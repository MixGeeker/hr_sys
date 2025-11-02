import { ApiProperty } from '@nestjs/swagger';

export class LevelStat {
  @ApiProperty({ description: '日志级别' })
  level: string;

  @ApiProperty({ description: '该级别日志数量' })
  count: string;
}

export class SourceStat {
  @ApiProperty({ description: '来源模块' })
  source: string;

  @ApiProperty({ description: '该来源日志数量' })
  count: string;
}

export class TimeStat {
  @ApiProperty({ description: '时间点' })
  hour: string;

  @ApiProperty({ description: '该时间点日志数量' })
  count: string;
}

export class LogStats {
  @ApiProperty({ description: '总日志数量' })
  total: number;

  @ApiProperty({ description: '按级别统计', type: [LevelStat] })
  levelStats: LevelStat[];

  @ApiProperty({ description: '按来源统计', type: [SourceStat] })
  sourceStats: SourceStat[];

  @ApiProperty({ description: '按时间统计', type: [TimeStat] })
  timeStats: TimeStat[];
}
