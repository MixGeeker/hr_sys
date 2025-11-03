import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Employee } from '../../core/entity/employee.entity';

// 奖罚类型枚举
export enum RewardPenaltyType {
  REWARD = 'reward',     // 奖励
  PENALTY = 'penalty',   // 处罚
}

@Entity('employee_reward_penalty')
@Index('idx_reward_penalty_employee_id', ['employeeId'])
@Index('idx_reward_penalty_type', ['type'])
@Index('idx_reward_penalty_date', ['date'])
@Index('idx_reward_penalty_created_at', ['createdAt'])
export class RewardPenalty {
  @ApiProperty({
    description: '奖罚记录ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '关联的职员ID' })
  @Column({ name: 'employee_id', comment: '职员ID' })
  employeeId: string;

  @ApiProperty({ 
    description: '类型',
    example: RewardPenaltyType.REWARD,
    enum: RewardPenaltyType,
  })
  @Column({ 
    type: 'enum', 
    enum: RewardPenaltyType,
    comment: '类型：reward-奖励，penalty-处罚' 
  })
  type: RewardPenaltyType;

  @ApiProperty({ description: '金额', example: 200.00 })
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    comment: '金额' 
  })
  amount: number;

  @ApiProperty({ description: '原因', example: '销售业绩突出' })
  @Column({ 
    type: 'text', 
    comment: '原因' 
  })
  reason: string;

  @ApiProperty({ description: '日期', example: '2023-01-01' })
  @Column({ 
    type: 'date', 
    comment: '日期' 
  })
  date: Date;

  @ApiProperty({ description: '备注信息', required: false })
  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: '备注信息' 
  })
  remark?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    comment: '创建时间',
  })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    comment: '更新时间',
  })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
