import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('sys_log_event')
export class LogEvent extends BaseEntity {
  @ApiProperty({ description: '日志事件ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '事件名称', example: 'permission.sync.mismatch' })
  @Index('idx_log_event_name')
  @Column({ length: 128, comment: '事件名称' })
  eventName: string;

  @ApiProperty({ description: '事件级别', example: 'warn' })
  @Column({ length: 16, default: 'info', comment: '事件级别(info|warn|error)' })
  level: string;

  @ApiProperty({ description: '事件来源模块', example: 'permission' })
  @Column({ length: 64, comment: '事件来源模块' })
  source: string;

  @ApiProperty({ description: '事件负载（JSON）' })
  @Column({ type: 'jsonb', nullable: true, comment: '事件负载' })
  payload?: Record<string, unknown> | null;

  @ApiProperty({ description: '发生时间' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    comment: '创建时间',
  })
  createdAt: Date;
}
