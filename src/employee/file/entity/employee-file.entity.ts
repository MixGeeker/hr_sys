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

// 文件类型枚举
export enum FileType {
  PHOTO = 'photo',           // 职员照片
  ID_CARD_FRONT = 'id_card_front', // 身份证正面
  ID_CARD_BACK = 'id_card_back',   // 身份证背面
  CONTRACT = 'contract',     // 合同文件
  OTHER = 'other',           // 其他文件
}

@Entity('employee_file')
@Index('idx_employee_file_employee_id', ['employeeId'])
@Index('idx_employee_file_type', ['fileType'])
@Index('idx_employee_file_created_at', ['createdAt'])
export class EmployeeFile {
  @ApiProperty({
    description: '文件ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '关联的职员ID' })
  @Column({ name: 'employee_id', comment: '职员ID' })
  employeeId: string;

  @ApiProperty({ 
    description: '文件类型',
    example: FileType.PHOTO,
    enum: FileType,
  })
  @Column({ 
    type: 'enum', 
    enum: FileType,
    comment: '文件类型' 
  })
  fileType: FileType;

  @ApiProperty({ description: '原始文件名', example: 'photo.jpg' })
  @Column({ 
    length: 255, 
    comment: '原始文件名' 
  })
  originalName: string;

  @ApiProperty({ description: '存储文件名', example: 'employee_123_photo_1640995200000.jpg' })
  @Column({ 
    length: 255, 
    comment: '存储文件名' 
  })
  fileName: string;

  @ApiProperty({ description: '文件路径', example: '/uploads/employees/123/photos/employee_123_photo_1640995200000.jpg' })
  @Column({ 
    type: 'text', 
    comment: '文件路径' 
  })
  filePath: string;

  @ApiProperty({ description: '文件大小（字节）', example: 1024000 })
  @Column({ 
    type: 'bigint', 
    comment: '文件大小（字节）' 
  })
  fileSize: number;

  @ApiProperty({ description: '文件MIME类型', example: 'image/jpeg' })
  @Column({ 
    length: 100, 
    comment: '文件MIME类型' 
  })
  mimeType: string;

  @ApiProperty({ description: '文件扩展名', example: '.jpg' })
  @Column({ 
    length: 10, 
    comment: '文件扩展名' 
  })
  extension: string;

  @ApiProperty({ description: '文件描述', example: '职员照片', required: false })
  @Column({ 
    length: 255, 
    nullable: true, 
    comment: '文件描述' 
  })
  description?: string;

  @ApiProperty({ description: '是否为主文件', example: true })
  @Column({ 
    type: 'boolean', 
    default: false, 
    comment: '是否为主文件（如主照片）' 
  })
  isPrimary: boolean;

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

  // 获取文件的完整URL
  getFileUrl(): string {
    return this.filePath;
  }

  // 获取文件大小（人类可读格式）
  getFileSizeFormatted(): string {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
