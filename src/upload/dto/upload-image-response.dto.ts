import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({
    description: '原始图片路径',
    example: '/files/1721132800000-test.jpg',
  })
  original: string;

  @ApiProperty({
    description: '缩略图路径 (用于列表等)',
    example: '/images/1721132800000-test-thumbnail.webp',
  })
  thumbnail: string;

  @ApiProperty({
    description: '内容图路径 (用于内容展示)',
    example: '/images/1721132800000-test-content.webp',
  })
  content: string;

  @ApiProperty({
    description: '全尺寸WebP图片路径 (用于查看大图)',
    example: '/images/1721132800000-test-full.webp',
  })
  full: string;

  @ApiProperty({
    description: '图片Path',
    example: '1721132800000-test',
  })
  path: string;
}
