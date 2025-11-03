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

@Entity('employee_salary')
@Index('idx_salary_employee_id', ['employeeId'])
@Index('idx_salary_work_date', ['workDate'])
@Index('idx_salary_created_at', ['createdAt'])
export class Salary {
  @ApiProperty({
    description: '薪酬记录ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '关联的职员ID' })
  @Column({ name: 'employee_id', comment: '职员ID' })
  employeeId: string;

  @ApiProperty({ description: '日薪金额', example: 150.00 })
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    comment: '日薪金额' 
  })
  dailyWage: number;

  @ApiProperty({ description: '工作日期', example: '2023-01-01' })
  @Column({ 
    type: 'date', 
    comment: '工作日期' 
  })
  workDate: Date;

  @ApiProperty({ description: '备注信息', example: '正常工作日', required: false })
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
