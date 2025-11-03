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
import { EmergencyContactDto } from './create-employee.dto';

export class UpdateEmployeeDto {
  @ApiProperty({ description: '姓名', example: '张三', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ 
    description: '性别', 
    example: Gender.MALE,
    enum: Gender,
    required: false
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: '出生日期', example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: '邮箱地址', example: 'zhangsan@example.com', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: '家庭住址', example: '北京市朝阳区XX街道XX号', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '职位', example: '收银员', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  position?: string;

  @ApiProperty({ description: '入职日期', example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: Date;

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
