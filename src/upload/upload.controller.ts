import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageSize, UploadService } from './upload.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { UploadFileResponseDto } from './dto/upload-file-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传图片',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '上传图片成功',
    type: UploadImageResponseDto,
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const [original, thumbnail, content, full] = await Promise.all([
      this.uploadService.saveFile(file),
      this.uploadService.compressAndSaveImage(file, 'thumbnail'),
      this.uploadService.compressAndSaveImage(file, 'content'),
      this.uploadService.compressAndSaveImage(file, 'full'),
    ]);

    return {
      original,
      thumbnail: thumbnail.fullPath,
      content: content.fullPath,
      full: full.fullPath,
      path: thumbnail.path,
    };
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传文件',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '上传文件成功',
    type: UploadFileResponseDto,
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileUrl = await this.uploadService.saveFile(file);
    return { path: fileUrl };
  }
}
