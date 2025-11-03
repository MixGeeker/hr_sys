import { ApiProperty } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsInt, 
  Min, 
  Max,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeStatus } from '../entity/employee.entity';

export class QueryEmployeeDto {
  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页大小', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: '搜索关键词（姓名、手机号、邮箱）', example: '张三', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: '职员状态',
    example: EmployeeStatus.ACTIVE,
    enum: EmployeeStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({ description: '职位', example: '收银员', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: '入职起始日期', example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  hireDateFrom?: Date;

  @ApiProperty({ description: '入职结束日期', example: '2023-12-31', required: false })
  @IsOptional()
  @IsDateString()
  hireDateTo?: Date;

  @ApiProperty({ description: '排序字段', example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: '排序方向', example: 'DESC', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// 响应数据类
export class EmployeeListItemDto {
  @ApiProperty({ description: '职员ID' })
  id: string;

  @ApiProperty({ description: '姓名' })
  name: string;

  @ApiProperty({ description: '性别' })
  gender: string;

  @ApiProperty({ description: '手机号' })
  phone: string;

  @ApiProperty({ description: '邮箱' })
  email?: string;

  @ApiProperty({ description: '职位' })
  position: string;

  @ApiProperty({ description: '入职日期' })
  hireDate: Date;

  @ApiProperty({ description: '职员状态' })
  status: EmployeeStatus;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

export class EmployeeListResponseDto {
  @ApiProperty({ description: '职员列表' })
  data: EmployeeListItemDto[];

  @ApiProperty({ description: '总记录数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页大小' })
  limit: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}
