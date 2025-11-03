import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sys_user')
export class User {
  @ApiProperty({
    description: '用户ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户名，必须唯一', example: 'admin' })
  @Column({ unique: true, length: 50, comment: '用户名' })
  username: string;

  @ApiProperty({ description: '用户密码', example: 'password123' })
  @Column({ length: 100, comment: '密码' })
  password: string;

  @ApiProperty({
    description: '昵称',
    example: '超级管理员',
    required: false,
  })
  @Column({ length: 50, nullable: true, comment: '昵称' })
  nickname?: string;

  @ApiProperty({
    description: '头像URL',
    example: '/uploads/avatars/default.png',
    required: false,
  })
  @Column({ nullable: true, comment: '头像' })
  avatar?: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'admin@example.com',
    required: false,
  })
  @Column({ unique: true, nullable: true, comment: '邮箱' })
  email?: string;

  @ApiProperty({ description: '用户状态：1-正常, 0-禁用', example: 1 })
  @Column({ type: 'int', default: 1, comment: '状态：1-正常, 0-禁用' })
  status: number;

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

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }

  toJSON() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = this;
    return result;
  }
}
