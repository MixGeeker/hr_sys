import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises'; // 使用 promise 版本的 fs，代码更简洁

/**
 * 定义图片尺寸的类型别名，更具可读性
 */
export type ImageSize = 'thumbnail' | 'content' | 'full';

@Injectable()
export class UploadService {
  /**
   * 修复 Multer 文件名中文乱码问题
   * @param filename 从 Express.Multer.File 获取的原始文件名
   * @returns 经过 UTF-8 解码后的正确文件名
   */
  private fixFilenameEncoding(filename: string): string {
    return Buffer.from(filename, 'latin1').toString('utf8');
  }

  /**
   * 将图片压缩、转换格式并保存
   * @param file 上传的文件对象
   * @param size 预设的图片尺寸 ('thumbnail', 'content', 'full')
   * @returns 处理后图片的可访问路径
   */
  async compressAndSaveImage(
    file: Express.Multer.File,
    size: ImageSize,
  ): Promise<{ fullPath: string; path: string }> {
    // 使用更具描述性的尺寸映射
    const sizeMap = {
      thumbnail: { width: 300, height: 300 },
      content: { width: 800, height: 800 },
      full: { width: 1920, height: 1920 },
    };

    const { width, height } = sizeMap[size];

    // 0. 修复文件名编码
    const decodedOriginalName = this.fixFilenameEncoding(file.originalname);

    // 1. 获取原始文件名（不含扩展名）
    const originalName = path.parse(decodedOriginalName).name;

    // 2. 构建新的带 WebP 扩展名的文件名
    const filename = `${Date.now()}-${originalName}-${size}.webp`;
    const outputPath = path.join(
      process.cwd(), // 获取项目根目录
      'uploads',
      'images',
      filename,
    );

    // 确保目录存在，如果不存在则创建
    await this.ensureDirectoryExists(path.dirname(outputPath));

    // Sharp 链式处理
    await sharp(file.buffer)
      .resize(width, height, {
        fit: 'inside', // 保持宽高比，防止图片变形或被放大
        withoutEnlargement: true, // 确保小图片不会被强制放大
      })
      .webp({ quality: 80 }) // 3. 转换为 WebP 格式，并设置质量为 80
      .toFile(outputPath);

    // 返回可供前端访问的相对路径
    return {
      fullPath: `/images/${filename}`,
      path: `${Date.now()}-${originalName}`,
    };
  }

  /**
   * 保存原始文件（非图片或其他不需要处理的文件）
   * @param file 上传的文件对象
   * @returns 文件的可访问路径
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    // 修复文件名编码
    const decodedOriginalName = this.fixFilenameEncoding(file.originalname);
    const filename = `${Date.now()}-${decodedOriginalName}`;
    const outputPath = path.join(process.cwd(), 'uploads', 'files', filename);

    await this.ensureDirectoryExists(path.dirname(outputPath));

    await fs.writeFile(outputPath, file.buffer);

    return `/files/${filename}`;
  }

  /**
   * 确保指定的目录存在，如果不存在则递归创建它
   * @param directoryPath 目录路径
   */
  private async ensureDirectoryExists(directoryPath: string): Promise<void> {
    try {
      await fs.access(directoryPath);
    } catch (error) {
      // 目录不存在，创建它
      await fs.mkdir(directoryPath, { recursive: true });
    }
  }
}
