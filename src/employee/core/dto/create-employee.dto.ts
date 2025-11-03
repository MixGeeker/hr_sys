import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsDateString, 
  IsOptional, 
  IsArray,
  ValidateNested,
  MaxLength,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, EmployeeStatus } from '../entity/employee.entity';

// 紧急联系人验证类
export class EmergencyContactDto {
  @ApiProperty({ description: '联系人姓名', example: '李四' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '关系', example: '配偶' })
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  relationship: string;

  @ApiProperty({ description: '联系电话', example: '13900139000' })
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  phone: string;
}

export class CreateEmployeeDto {
  @ApiProperty({ description: '姓名', example: '张三' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: '性别', 
    example: Gender.MALE,
    enum: Gender,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ description: '出生日期', example: '1990-01-01' })
  @IsDateString()
  birthDate: Date;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: '邮箱地址', example: 'zhangsan@example.com', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: '家庭住址', example: '北京市朝阳区XX街道XX号' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: '职位', example: '收银员' })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  position: string;

  @ApiProperty({ description: '入职日期', example: '2023-01-01' })
  @IsDateString()
  hireDate: Date;

  @ApiProperty({ 
    description: '紧急联系人信息',
    example: [
      { name: '李四', relationship: '配偶', phone: '13900139000' }
    ],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @ApiProperty({ 
    description: '职员状态',
    example: EmployeeStatus.ACTIVE,
    enum: EmployeeStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;
}
