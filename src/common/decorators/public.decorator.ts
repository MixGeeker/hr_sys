import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 允许接口跳过JWT验证
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
