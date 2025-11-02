import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('currency_exchange_rate')
@Index('idx_exchange_rate_pair', ['fromCurrencyCode', 'toCurrencyCode'])
export class ExchangeRate {
  @ApiProperty({
    description: '汇率记录ID',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: '源货币代码',
    example: 'USD',
  })
  @Column({
    type: 'varchar',
    length: 16,
    name: 'from_currency_code',
    comment: '源货币代码',
  })
  fromCurrencyCode: string;

  @ApiProperty({
    description: '目标货币代码',
    example: 'VES',
  })
  @Column({
    type: 'varchar',
    length: 16,
    name: 'to_currency_code',
    comment: '目标货币代码',
  })
  toCurrencyCode: string;

  @ApiProperty({
    description: '汇率（1源货币兑换多少目标货币）',
    example: '7.25000000',
  })
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 10,
    comment: '汇率',
    transformer: {
      to(value: string): string {
        // 确保存储的是字符串格式的数字
        return typeof value === 'string' ? value : String(value);
      },
      from(value: string): string {
        // 从数据库读取时保持字符串格式
        return value;
      },
    },
  })
  rate: string;

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
