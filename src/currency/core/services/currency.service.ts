import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeRate } from '../../exchange-rate/entity/exchange_rate.entity';
import {
  CURRENCIES,
  CURRENCY_CODES,
  BASE_CURRENCY_CODE,
  LEGAL_TENDER_CURRENCY_CODE,
  ACTIVE_CURRENCIES,
  getCurrencyByCode,
  isValidCurrencyCode,
  getBaseCurrency,
  getLegalTenderCurrency,
  CurrencyConfig,
} from '../currency-codes';
import { Repository } from 'typeorm';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  /**
   * 获取所有货币
   * @returns 货币配置数组
   */
  findAllCurrencies(): CurrencyConfig[] {
    return Object.values(CURRENCIES);
  }

  /**
   * 根据代码查找指定的货币
   * @param code 货币的代码
   * @returns 找到的货币配置，如果找不到则抛出异常
   */
  findOneCurrency(code: string): CurrencyConfig {
    const currency = getCurrencyByCode(code);
    if (!currency) {
      throw new NotFoundException(`未找到代码为 ${code} 的货币`);
    }
    return currency;
  }

  /**
   * 使用货币代码查询货币
   * @param code 货币代码（如 CNY、USD）
   * @returns 匹配的货币
   */
  findCurrencyByCode(code: string): CurrencyConfig {
    return this.findOneCurrency(code);
  }

  /**
   * 获取基础货币
   */
  getBaseCurrency(): CurrencyConfig {
    return getBaseCurrency();
  }

  /**
   * 获取法定货币
   */
  getLegalTenderCurrency(): CurrencyConfig {
    return getLegalTenderCurrency();
  }

  /**
   * 获取所有启用的货币
   */
  findActiveCurrencies(): CurrencyConfig[] {
    return ACTIVE_CURRENCIES;
  }

  // ===================== ExchangeRate =====================

  /**
   * 计算两种货币之间的汇率（支持间接汇率计算）
   * @param fromCurrencyCode 源货币代码
   * @param toCurrencyCode 目标货币代码
   * @returns 汇率值
   */
  async calculateExchangeRate(
    fromCurrencyCode: string,
    toCurrencyCode: string,
  ): Promise<string> {
    // 验证货币代码
    if (!isValidCurrencyCode(fromCurrencyCode)) {
      throw new NotFoundException(`未找到代码为 ${fromCurrencyCode} 的货币`);
    }
    if (!isValidCurrencyCode(toCurrencyCode)) {
      throw new NotFoundException(`未找到代码为 ${toCurrencyCode} 的货币`);
    }

    // 如果是同一种货币，汇率为1
    if (fromCurrencyCode === toCurrencyCode) {
      return '1.0000000000';
    }

    try {
      // 首先尝试直接汇率
      const directRate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyCode,
          toCurrencyCode,
        },
      });

      if (directRate) {
        return directRate.rate;
      }

      // 如果没有直接汇率，尝试通过基础货币计算间接汇率
      const baseCurrencyCode = BASE_CURRENCY_CODE;

      // 查找从源货币到基础货币的汇率
      const fromToBaseRate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyCode,
          toCurrencyCode: baseCurrencyCode,
        },
      });

      // 查找从基础货币到目标货币的汇率
      const baseToToRate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyCode: baseCurrencyCode,
          toCurrencyCode,
        },
      });

      if (fromToBaseRate && baseToToRate) {
        // 计算间接汇率：源货币 -> 基础货币 -> 目标货币
        const fromToBase = parseFloat(fromToBaseRate.rate);
        const baseToTo = parseFloat(baseToToRate.rate);
        const calculatedRate = fromToBase * baseToTo;
        return calculatedRate.toFixed(10);
      }

      // 尝试反向计算：目标货币 -> 基础货币 -> 源货币
      const toToBaseRate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyCode: toCurrencyCode,
          toCurrencyCode: baseCurrencyCode,
        },
      });

      const baseToFromRate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyCode: baseCurrencyCode,
          toCurrencyCode: fromCurrencyCode,
        },
      });

      if (toToBaseRate && baseToFromRate) {
        // 计算反向间接汇率：源货币 -> 基础货币 -> 目标货币
        const toToBase = parseFloat(toToBaseRate.rate);
        const baseToFrom = parseFloat(baseToFromRate.rate);
        // 反向计算：1 / (目标货币到基础货币的汇率 * 基础货币到源货币的汇率)
        const calculatedRate = 1 / (toToBase * baseToFrom);
        return calculatedRate.toFixed(10);
      }

      throw new NotFoundException(
        `无法计算从 ${fromCurrencyCode} 到 ${toCurrencyCode} 的汇率，请确保存在直接或间接汇率路径`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`计算汇率时发生错误: ${error.message}`);
    }
  }

  /**
   * 货币兑换
   * @param fromCurrencyCode 源货币代码
   * @param toCurrencyCode 目标货币代码
   * @param amount 兑换金额
   * @returns 兑换结果
   */
  async exchangeCurrency(
    fromCurrencyCode: string,
    toCurrencyCode: string,
    amount: string,
  ): Promise<{
    fromCurrency: CurrencyConfig;
    toCurrency: CurrencyConfig;
    fromAmount: string;
    toAmount: string;
    rate: string;
  }> {
    const fromCurrency = this.findOneCurrency(fromCurrencyCode);
    const toCurrency = this.findOneCurrency(toCurrencyCode);

    // 确保货币都是启用状态
    if (fromCurrency.status !== 'active' || toCurrency.status !== 'active') {
      throw new Error('只能兑换启用状态的货币');
    }

    // 验证金额
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('兑换金额必须是大于0的数字');
    }

    // 计算汇率
    const rate = await this.calculateExchangeRate(
      fromCurrencyCode,
      toCurrencyCode,
    );
    const rateNum = parseFloat(rate);

    // 计算兑换后的金额
    const toAmountNum = amountNum * rateNum;
    const toAmount = toAmountNum.toFixed(10);

    return {
      fromCurrency,
      toCurrency,
      fromAmount: amountNum.toFixed(10),
      toAmount,
      rate,
    };
  }

  /**
   * 获取货币之间的汇率路径
   * @param fromCurrencyCode 源货币代码
   * @param toCurrencyCode 目标货币代码
   * @returns 汇率路径
   */
  async getExchangeRatePath(
    fromCurrencyCode: string,
    toCurrencyCode: string,
  ): Promise<{
    path: Array<{ from: CurrencyConfig; to: CurrencyConfig; rate: string }>;
    totalRate: string;
    isDirect: boolean;
  }> {
    // 验证货币代码
    if (!isValidCurrencyCode(fromCurrencyCode)) {
      throw new NotFoundException(`未找到代码为 ${fromCurrencyCode} 的货币`);
    }
    if (!isValidCurrencyCode(toCurrencyCode)) {
      throw new NotFoundException(`未找到代码为 ${toCurrencyCode} 的货币`);
    }

    // 如果是同一种货币
    if (fromCurrencyCode === toCurrencyCode) {
      const currency = this.findOneCurrency(fromCurrencyCode);
      return {
        path: [],
        totalRate: '1.0000000000',
        isDirect: true,
      };
    }

    // 尝试直接汇率
    const directRate = await this.exchangeRateRepository.findOne({
      where: {
        fromCurrencyCode,
        toCurrencyCode,
      },
    });

    if (directRate) {
      return {
        path: [
          {
            from: this.findOneCurrency(fromCurrencyCode),
            to: this.findOneCurrency(toCurrencyCode),
            rate: directRate.rate,
          },
        ],
        totalRate: directRate.rate,
        isDirect: true,
      };
    }

    // 尝试通过基础货币的间接汇率
    const baseCurrencyCode = BASE_CURRENCY_CODE;

    // 查找从源货币到基础货币的汇率
    const fromToBaseRate = await this.exchangeRateRepository.findOne({
      where: {
        fromCurrencyCode,
        toCurrencyCode: baseCurrencyCode,
      },
    });

    // 查找从基础货币到目标货币的汇率
    const baseToToRate = await this.exchangeRateRepository.findOne({
      where: {
        fromCurrencyCode: baseCurrencyCode,
        toCurrencyCode,
      },
    });

    if (fromToBaseRate && baseToToRate) {
      // 计算间接汇率
      const fromToBase = parseFloat(fromToBaseRate.rate);
      const baseToTo = parseFloat(baseToToRate.rate);
      const calculatedRate = fromToBase * baseToTo;

      return {
        path: [
          {
            from: this.findOneCurrency(fromCurrencyCode),
            to: this.findOneCurrency(baseCurrencyCode),
            rate: fromToBaseRate.rate,
          },
          {
            from: this.findOneCurrency(baseCurrencyCode),
            to: this.findOneCurrency(toCurrencyCode),
            rate: baseToToRate.rate,
          },
        ],
        totalRate: calculatedRate.toFixed(10),
        isDirect: false,
      };
    }

    throw new NotFoundException(
      `无法找到从 ${fromCurrencyCode} 到 ${toCurrencyCode} 的汇率路径`,
    );
  }

  // ===================== Base -> Legal Exchange Rate =====================

  /**
   * 获取"基础货币 -> 法定货币"的最新汇率。
   * @returns 最新的汇率值（1 基础货币 = rate 法定货币）
   */
  async getBaseToLegalLatestRateValue(): Promise<string> {
    try {
      const rate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyCode: BASE_CURRENCY_CODE,
          toCurrencyCode: LEGAL_TENDER_CURRENCY_CODE,
        },
      });

      if (!rate) {
        throw new NotFoundException('未找到基础货币到法定货币的最新汇率');
      }

      return rate.rate;
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }
      throw e;
    }
  }
}
