/**
 * 硬编码货币配置
 * 定义系统中使用的五种固定货币
 */

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  isBaseCurrency: boolean;
  isLegalTender: boolean;
  status: 'active' | 'inactive';
  description: string;
}

/**
 * 系统中使用的五种固定货币
 */
export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: '美元',
    symbol: '$',
    isBaseCurrency: true,
    isLegalTender: false,
    status: 'active',
    description: '美利坚合众国的法定货币，系统基础货币',
  },
  VES: {
    code: 'VES',
    name: '玻利瓦尔',
    symbol: 'Bs',
    isBaseCurrency: false,
    isLegalTender: true,
    status: 'active',
    description: '委内瑞拉的法定货币',
  },
  EUR: {
    code: 'EUR',
    name: '欧元',
    symbol: '€',
    isBaseCurrency: false,
    isLegalTender: false,
    status: 'active',
    description: '欧盟的法定货币',
  },
  CNY: {
    code: 'CNY',
    name: '人民币',
    symbol: '¥',
    isBaseCurrency: false,
    isLegalTender: false,
    status: 'active',
    description: '中华人民共和国的法定货币',
  },
  PLACEHOLDER: {
    code: 'PLACEHOLDER',
    name: '占位货币',
    symbol: 'PH',
    isBaseCurrency: false,
    isLegalTender: false,
    status: 'active',
    description: '系统占位货币，用于特殊场景',
  },
};

/**
 * 获取所有货币代码
 */
export const CURRENCY_CODES = Object.keys(CURRENCIES);

/**
 * 获取基础货币代码
 */
export const BASE_CURRENCY_CODE = 'USD';

/**
 * 获取法定货币代码
 */
export const LEGAL_TENDER_CURRENCY_CODE = 'VES';

/**
 * 获取所有启用的货币
 */
export const ACTIVE_CURRENCIES = Object.values(CURRENCIES).filter(
  (currency) => currency.status === 'active',
);

/**
 * 根据代码获取货币配置
 */
export function getCurrencyByCode(code: string): CurrencyConfig | undefined {
  return CURRENCIES[code.toUpperCase()];
}

/**
 * 检查货币代码是否有效
 */
export function isValidCurrencyCode(code: string): boolean {
  return code.toUpperCase() in CURRENCIES;
}

/**
 * 获取基础货币配置
 */
export function getBaseCurrency(): CurrencyConfig {
  return CURRENCIES[BASE_CURRENCY_CODE];
}

/**
 * 获取法定货币配置
 */
export function getLegalTenderCurrency(): CurrencyConfig {
  return CURRENCIES[LEGAL_TENDER_CURRENCY_CODE];
}
