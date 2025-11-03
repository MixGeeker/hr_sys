import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as multer from 'multer';
import { EmployeeFile, FileType } from '../entity/employee-file.entity';
import { Employee } from '../../core/entity/employee.entity';
import { 
  UploadFileDto,
  UpdateFileDto, 
  QueryFileDto, 
  FileListItemDto, 
  FileListResponseDto, 
  FileStatsDto, 
  UploadFileResponseDto 
} from '../dto';

@Injectable()
export class EmployeeFileService {
  constructor(
    @InjectRepository(EmployeeFile)
    private readonly fileRepository: Repository<EmployeeFile>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async upload(employeeId: string, file: Express.Multer.File, uploadDto: UploadFileDto): Promise<UploadFileResponseDto> {
    // 检查职员是否存在
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`职员不存在: ${employeeId}`);
    }

    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    try {
      // 生成文件存储路径
      const fileName = this.generateFileName(employeeId, uploadDto.fileType, file.originalname);
      const filePath = await this.saveFile(file, employeeId, fileName);

      // 如果是主文件，先取消其他同类型文件的主文件标记
      if (uploadDto.isPrimary) {
        await this.clearPrimaryFlag(employeeId, uploadDto.fileType);
      }

      // 创建文件记录
      const fileRecord = this.fileRepository.create({
        employeeId,
        fileType: uploadDto.fileType,
        originalName: file.originalname,
        fileName,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        extension: path.extname(file.originalname),
        description: uploadDto.description,
        isPrimary: uploadDto.isPrimary || false,
      });

      const savedFile = await this.fileRepository.save(fileRecord);

      return {
        file: this.toListItemDto(savedFile),
        message: '文件上传成功',
      };
    } catch (error) {
      throw new BadRequestException('文件上传失败: ' + error.message);
    }
  }

  async findAll(employeeId: string, queryDto: QueryFileDto): Promise<FileListResponseDto> {
    const { page = 1, limit = 10, fileType, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.fileRepository.createQueryBuilder('file')
      .leftJoin('file.employee', 'employee')
      .where('file.employeeId = :employeeId', { employeeId });

    // 构建查询条件
    this.buildWhereClause(queryBuilder, { fileType });

    // 构建排序
    queryBuilder.orderBy(`file.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // 执行查询
    const [files, total] = await queryBuilder.getManyAndCount();

    // 转换为响应格式
    const data = files.map(file => this.toListItemDto(file));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string, employeeId?: string): Promise<EmployeeFile> {
    const queryBuilder = this.fileRepository.createQueryBuilder('file')
      .leftJoin('file.employee', 'employee')
      .where('file.id = :id', { id });

    if (employeeId) {
      queryBuilder.andWhere('file.employeeId = :employeeId', { employeeId });
    }

    const file = await queryBuilder.getOne();
    if (!file) {
      throw new NotFoundException(`文件不存在: ${id}`);
    }
    return file;
  }

  async update(id: string, updateFileDto: UpdateFileDto, employeeId?: string): Promise<EmployeeFile> {
    const file = await this.findOne(id, employeeId);
    
    // 如果要设置为主文件，先取消其他同类型文件的主文件标记
    if (updateFileDto.isPrimary && !file.isPrimary) {
      await this.clearPrimaryFlag(employeeId!, file.fileType);
    }

    Object.assign(file, updateFileDto);
    return await this.fileRepository.save(file);
  }

  async remove(id: string, employeeId?: string): Promise<void> {
    const file = await this.findOne(id, employeeId);
    
    // 删除物理文件
    try {
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }
    } catch (error) {
      console.warn('删除物理文件失败:', error.message);
    }

    // 删除数据库记录
    await this.fileRepository.remove(file);
  }

  async getStats(employeeId: string): Promise<FileStatsDto> {
    const queryBuilder = this.fileRepository.createQueryBuilder('file')
      .where('file.employeeId = :employeeId', { employeeId });

    const files = await queryBuilder.getMany();
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + Number(file.fileSize), 0);

    // 统计各类文件数量
    const filesByType = {} as Record<FileType, number>;
    Object.values(FileType).forEach(type => {
      filesByType[type] = files.filter(file => file.fileType === type).length;
    });

    return {
      totalFiles,
      filesByType,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
    };
  }

  async getFilesByType(employeeId: string, fileType: FileType): Promise<EmployeeFile[]> {
    return await this.fileRepository.find({
      where: { employeeId, fileType },
      order: { createdAt: 'DESC' },
    });
  }

  async getPrimaryFile(employeeId: string, fileType: FileType): Promise<EmployeeFile | null> {
    return await this.fileRepository.findOne({
      where: { employeeId, fileType, isPrimary: true },
    });
  }

  // 内部方法

  private async saveFile(file: Express.Multer.File, employeeId: string, fileName: string): Promise<string> {
    // 创建目录结构
    const uploadPath = path.join(process.cwd(), 'uploads', 'employees', employeeId);
    await this.ensureDirectoryExists(uploadPath);

    // 根据文件类型创建子目录
    const subDir = this.getSubDirectoryByFileType(file.mimetype);
    const fullPath = path.join(uploadPath, subDir);
    await this.ensureDirectoryExists(fullPath);

    // 完整的文件路径
    const filePath = path.join(fullPath, fileName);

    // 保存文件
    await fs.promises.writeFile(filePath, file.buffer);

    // 返回相对路径（用于数据库存储）
    return path.join('/uploads', 'employees', employeeId, subDir, fileName).replace(/\\/g, '/');
  }

  private generateFileName(employeeId: string, fileType: FileType, originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    return `employee_${employeeId}_${fileType}_${timestamp}${ext}`;
  }

  private getSubDirectoryByFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'photos';
    } else if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return 'documents';
    } else {
      return 'others';
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.promises.access(dirPath);
    } catch {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
  }

  private async clearPrimaryFlag(employeeId: string, fileType: FileType): Promise<void> {
    await this.fileRepository.update(
      { employeeId, fileType, isPrimary: true },
      { isPrimary: false },
    );
  }

  private buildWhereClause(
    queryBuilder: SelectQueryBuilder<EmployeeFile>,
    filters: {
      fileType?: FileType;
    }
  ): void {
    const conditions: string[] = [];
    const parameters: any = {};

    // 文件类型过滤
    if (filters.fileType) {
      conditions.push('file.fileType = :fileType');
      parameters.fileType = filters.fileType;
    }

    // 应用条件
    if (conditions.length > 0) {
      queryBuilder.andWhere(conditions.join(' AND '), parameters);
    }
  }

  private toListItemDto(file: EmployeeFile): FileListItemDto {
    return {
      id: file.id,
      fileType: file.fileType,
      originalName: file.originalName,
      fileName: file.fileName,
      filePath: file.filePath,
      fileSize: file.fileSize,
      fileSizeFormatted: file.getFileSizeFormatted(),
      mimeType: file.mimeType,
      extension: file.extension,
      description: file.description,
      isPrimary: file.isPrimary,
      createdAt: file.createdAt,
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
