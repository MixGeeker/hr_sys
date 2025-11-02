import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SystemConfigDto } from '../dto/system-cofig.dto';

@Entity('sys_setting')
export class Setting {
  @ApiProperty({ description: 'ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '公司名称', example: 'UName' })
  @Column({ comment: '公司名称', nullable: true })
  companyName: string;

  @ApiProperty({ description: '税号', example: 'J-1234567890' })
  @Column({ comment: '税号', nullable: true })
  taxId: string;

  @ApiProperty({
    description: '地址',
    example: ['通常是RIF上面的地址', '1', '2'],
  })
  @Column({ comment: '地址', type: 'json', nullable: true })
  address: string[];

  @ApiProperty({
    description: '系统配置（JSONB，可扩展）',
    example: { init: { user: false } },
  })
  @Column({ comment: '系统配置（JSONB，可扩展）', type: 'jsonb', default: {} })
  config: SystemConfigDto;

  @ApiProperty({ description: '是否已初始化货币相关数据', example: false })
  @Column({ comment: '是否已初始化货币相关数据', default: false })
  currencyInitialized: boolean;

  @ApiProperty({ description: '是否已初始化用户相关数据', example: false })
  @Column({ comment: '是否已初始化用户相关数据', default: false })
  userInitialized: boolean;

  @ApiProperty({ description: '是否已初始化订单相关数据', example: false })
  @Column({ comment: '是否已初始化订单相关数据', default: false })
  orderInitialized: boolean;

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
