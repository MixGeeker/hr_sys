import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max as MaxDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FileType } from '../entity/employee-file.entity';

// 文件上传DTO
export class UploadFileDto {
  @ApiProperty({ 
    description: '文件类型',
    example: FileType.PHOTO,
    enum: FileType,
  })
  @IsEnum(FileType)
  fileType: FileType;

  @ApiProperty({ description: '文件描述', example: '职员照片', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否设为主文件', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

// 更新文件DTO
export class UpdateFileDto {
  @ApiProperty({ 
    description: '文件类型',
    example: FileType.PHOTO,
    enum: FileType,
    required: false
  })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @ApiProperty({ description: '文件描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '是否设为主文件', required: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

// 查询文件DTO
export class QueryFileDto {
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
  @MaxDate(100)
  limit?: number = 10;

  @ApiProperty({ 
    description: '文件类型',
    example: FileType.PHOTO,
    enum: FileType,
    required: false
  })
  @IsOptional()
  @IsEnum(FileType)
  fileType?: FileType;

  @ApiProperty({ description: '排序字段', example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: '排序方向', example: 'DESC', required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// 文件列表项DTO
export class FileListItemDto {
  @ApiProperty({ description: '文件ID' })
  id: string;

  @ApiProperty({ description: '文件类型' })
  fileType: FileType;

  @ApiProperty({ description: '原始文件名' })
  originalName: string;

  @ApiProperty({ description: '存储文件名' })
  fileName: string;

  @ApiProperty({ description: '文件路径' })
  filePath: string;

  @ApiProperty({ description: '文件大小（字节）' })
  fileSize: number;

  @ApiProperty({ description: '文件大小（格式化）' })
  fileSizeFormatted: string;

  @ApiProperty({ description: '文件MIME类型' })
  mimeType: string;

  @ApiProperty({ description: '文件扩展名' })
  extension: string;

  @ApiProperty({ description: '文件描述' })
  description?: string;

  @ApiProperty({ description: '是否为主文件' })
  isPrimary: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

// 文件列表响应DTO
export class FileListResponseDto {
  @ApiProperty({ description: '文件列表' })
  data: FileListItemDto[];

  @ApiProperty({ description: '总记录数' })
  total: number;

  @ApiProperty({ description: '当前页码' })
  page: number;

  @ApiProperty({ description: '每页大小' })
  limit: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}

// 文件统计DTO
export class FileStatsDto {
  @ApiProperty({ description: '总文件数' })
  totalFiles: number;

  @ApiProperty({ description: '各类文件数量' })
  filesByType: Record<FileType, number>;

  @ApiProperty({ description: '总文件大小（字节）' })
  totalSize: number;

  @ApiProperty({ description: '总文件大小（格式化）' })
  totalSizeFormatted: string;
}

// 上传响应DTO
export class UploadFileResponseDto {
  @ApiProperty({ description: '文件记录信息' })
  file: FileListItemDto;

  @ApiProperty({ description: '上传消息' })
  message: string;
}
