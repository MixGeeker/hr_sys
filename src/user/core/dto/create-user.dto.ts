import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEmail,
  IsInt,
  IsIn,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'testuser' })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiProperty({ description: '昵称', example: '测试用户', required: false })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  nickname?: string;

  @ApiProperty({
    description: '头像URL',
    example: '/uploads/avatars/default.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'test@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '请输入正确的邮箱地址' })
  email?: string;

  @ApiProperty({
    description: '用户状态：1-正常, 0-禁用',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '状态必须是整数' })
  @IsIn([0, 1], { message: '状态值只能是0或1' })
  status?: number;
}
