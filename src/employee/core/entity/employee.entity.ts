import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

// 紧急联系人接口
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

// 性别枚举
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

// 职员状态枚举
export enum EmployeeStatus {
  ACTIVE = 'active',     // 在职
  INACTIVE = 'inactive', // 离职
}

@Entity('employee')
@Index('idx_employee_status', ['status'])
@Index('idx_employee_created_at', ['createdAt'])
export class Employee {
  @ApiProperty({
    description: '职员ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '姓名', example: '张三' })
  @Column({ length: 50, comment: '姓名' })
  name: string;

  @ApiProperty({ 
    description: '性别', 
    example: Gender.MALE,
    enum: Gender,
  })
  @Column({ 
    type: 'enum', 
    enum: Gender,
    comment: '性别'
  })
  gender: Gender;

  @ApiProperty({ description: '出生日期', example: '1990-01-01' })
  @Column({ 
    type: 'date', 
    comment: '出生日期' 
  })
  birthDate: Date;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  @Column({ 
    length: 20, 
    comment: '手机号' 
  })
  phone: string;

  @ApiProperty({ description: '邮箱地址', example: 'zhangsan@example.com' })
  @Column({ 
    length: 100, 
    nullable: true, 
    comment: '邮箱地址' 
  })
  email?: string;

  @ApiProperty({ description: '家庭住址', example: '北京市朝阳区XX街道XX号' })
  @Column({ 
    type: 'text', 
    comment: '家庭住址' 
  })
  address: string;

  @ApiProperty({ description: '职位', example: '收银员' })
  @Column({ 
    length: 50, 
    comment: '职位' 
  })
  position: string;

  @ApiProperty({ description: '入职日期', example: '2023-01-01' })
  @Column({ 
    type: 'date', 
    comment: '入职日期' 
  })
  hireDate: Date;

  @ApiProperty({ 
    description: '紧急联系人信息',
    example: [
      { name: '李四', relationship: '配偶', phone: '13900139000' }
    ]
  })
  @Column({ 
    type: 'jsonb', 
    nullable: true, 
    comment: '紧急联系人信息' 
  })
  emergencyContacts?: EmergencyContact[];

  @ApiProperty({ 
    description: '职员状态',
    example: EmployeeStatus.ACTIVE,
    enum: EmployeeStatus,
  })
  @Column({ 
    type: 'enum', 
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    comment: '职员状态'
  })
  status: EmployeeStatus;

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
}
