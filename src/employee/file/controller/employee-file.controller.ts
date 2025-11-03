import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { EmployeeFileService } from '../service/employee-file.service';
import { EmployeeFile } from '../entity/employee-file.entity';
import { 
  UploadFileDto,
  UpdateFileDto,
  QueryFileDto,
  FileListResponseDto,
  UploadFileResponseDto,
  FileStatsDto,
} from '../dto';

@ApiTags('文件管理')
@Controller('employees/:employeeId/files')
export class EmployeeFileController {
  constructor(private readonly employeeFileService: EmployeeFileService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传文件' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功', type: UploadFileResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '职员不存在' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('employeeId') employeeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
  ): Promise<UploadFileResponseDto> {
    return await this.employeeFileService.upload(employeeId, file, uploadDto);
  }

  @Get()
  @ApiOperation({ summary: '获取文件列表' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页大小' })
  @ApiQuery({ name: 'fileType', required: false, description: '文件类型' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  @ApiResponse({ status: 200, description: '获取成功', type: FileListResponseDto })
  async findAll(
    @Param('employeeId') employeeId: string,
    @Query() queryDto: QueryFileDto,
  ): Promise<FileListResponseDto> {
    return await this.employeeFileService.findAll(employeeId, queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取文件统计' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    type: FileStatsDto,
  })
  async getStats(@Param('employeeId') employeeId: string): Promise<FileStatsDto> {
    return await this.employeeFileService.getStats(employeeId);
  }

  @Get('type/:fileType')
  @ApiOperation({ summary: '按类型获取文件' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'fileType', description: '文件类型' })
  @ApiResponse({ status: 200, description: '获取成功', type: [EmployeeFile] })
  async findByType(
    @Param('employeeId') employeeId: string,
    @Param('fileType') fileType: string,
  ): Promise<EmployeeFile[]> {
    return await this.employeeFileService.getFilesByType(employeeId, fileType as any);
  }

  @Get('primary/:fileType')
  @ApiOperation({ summary: '获取主文件' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'fileType', description: '文件类型' })
  @ApiResponse({ status: 200, description: '获取成功', type: EmployeeFile })
  @ApiResponse({ status: 404, description: '主文件不存在' })
  async getPrimary(
    @Param('employeeId') employeeId: string,
    @Param('fileType') fileType: string,
  ): Promise<EmployeeFile> {
    const primaryFile = await this.employeeFileService.getPrimaryFile(employeeId, fileType as any);
    if (!primaryFile) {
      throw new Error(`主文件不存在: ${fileType}`);
    }
    return primaryFile;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件详情' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '文件ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: EmployeeFile })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async findOne(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ): Promise<EmployeeFile> {
    return await this.employeeFileService.findOne(id, employeeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新文件信息' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '文件ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: EmployeeFile })
  @ApiResponse({ status: 404, description: '文件不存在' })
  async update(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<EmployeeFile> {
    return await this.employeeFileService.update(id, updateFileDto, employeeId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'id', description: '文件ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.employeeFileService.remove(id, employeeId);
  }

  // 便捷上传接口

  @Post('upload-photo')
  @ApiOperation({ summary: '上传职员照片' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('employeeId') employeeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ): Promise<UploadFileResponseDto> {
    const uploadDto: UploadFileDto = {
      fileType: 'photo' as any,
      description,
      isPrimary: true,
    };
    return await this.employeeFileService.upload(employeeId, file, uploadDto);
  }

  @Post('upload-idcard')
  @ApiOperation({ summary: '上传身份证' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiParam({ name: 'side', description: '证件面：front-正面，back-反面' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadIdCard(
    @Param('employeeId') employeeId: string,
    @Param('side') side: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ): Promise<UploadFileResponseDto> {
    const fileType = side === 'front' ? 'id_card_front' : 'id_card_back';
    const uploadDto: UploadFileDto = {
      fileType: fileType as any,
      description,
    };
    return await this.employeeFileService.upload(employeeId, file, uploadDto);
  }

  @Post('upload-contract')
  @ApiOperation({ summary: '上传合同文件' })
  @ApiParam({ name: 'employeeId', description: '职员ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '上传成功' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadContract(
    @Param('employeeId') employeeId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ): Promise<UploadFileResponseDto> {
    const uploadDto: UploadFileDto = {
      fileType: 'contract' as any,
      description,
    };
    return await this.employeeFileService.upload(employeeId, file, uploadDto);
  }
}
