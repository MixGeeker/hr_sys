import { NotFoundException } from '@nestjs/common';
import { isValidCurrencyCode } from '../../core/currency-codes';

/**
 * 验证货币代码是否有效
 * @param code 货币代码
 * @throws NotFoundException 当货币代码无效时抛出异常
 */
export function validateCurrencyCode(code: string): void {
  if (!isValidCurrencyCode(code)) {
    throw new NotFoundException(`未找到代码为 ${code} 的货币`);
  }
}

/**
 * 验证汇率值是否有效
 * @param rate 汇率值
 * @returns 标准化后的汇率值字符串
 * @throws Error 当汇率值无效时抛出异常
 */
export function normalizeRate(rate: string | number): string {
  const numRate = typeof rate === 'string' ? parseFloat(rate) : rate;
  if (isNaN(numRate) || numRate <= 0) {
    throw new Error('汇率必须是大于0的数字');
  }
  // 保留10位小数，符合数据库定义
  return numRate.toFixed(10);
}
