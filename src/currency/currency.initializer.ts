import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './exchange-rate/entity/exchange_rate.entity';
import { Setting } from 'src/setting/entity/setting.entity';
import { SystemConfigDto } from 'src/setting/dto/system-cofig.dto';
import { LEGAL_TENDER_CURRENCY_CODE } from './core/currency-codes';

/**
 * 货币模块初始化器
 *
 * 在应用启动后自动确保：
 * 1. 初始化四个汇率对（其他货币对玻利瓦尔）；
 * 2. 写入初始汇率。
 */
@Injectable()
export class CurrencyInitializer implements OnApplicationBootstrap {
  private readonly logger = new Logger('CurrencyInitializer');

  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  /**
   * 应用启动完成后执行初始化。
   */
  async onApplicationBootstrap(): Promise<void> {
    try {
      const setting = await this.getOrCreateSetting();
      const hasJsonFlag = setting.config?.init?.currency === true;
      if (hasJsonFlag || setting.currencyInitialized) {
        this.logger.log(
          '[Currency Init] 设置标记已完成初始化，跳过。',
          'CurrencyInitializer',
        );
        return;
      }

      // 初始化四个汇率对（其他货币对玻利瓦尔）
      await this.ensureInitialExchangeRates();

      // 标记已完成
      setting.currencyInitialized = true;
      await this.settingRepository.save(setting);
      this.logger.log('[Currency Init] 货币初始化完成');
    } catch (error) {
      this.logger.error('[Currency Init] 初始化失败', error);
    }
  }

  /**
   * 获取或创建系统设置记录
   */
  private async getOrCreateSetting(): Promise<Setting> {
    let setting = await this.settingRepository.findOne({ where: {} });
    if (!setting) {
      setting = this.settingRepository.create({
        config: {} as SystemConfigDto,
        currencyInitialized: false,
      });
      setting = await this.settingRepository.save(setting);
    }
    return setting;
  }

  /**
   * 确保初始汇率存在
   */
  private async ensureInitialExchangeRates(): Promise<void> {
    // 定义四个汇率对（其他货币对玻利瓦尔）
    const initialRates = [
      {
        fromCurrencyCode: 'USD',
        toCurrencyCode: 'VES',
        rate: '200.0000000000',
      },
      {
        fromCurrencyCode: 'EUR',
        toCurrencyCode: 'VES',
        rate: '220.0000000000',
      },
      {
        fromCurrencyCode: 'CNY',
        toCurrencyCode: 'VES',
        rate: '30.0000000000',
      },
      {
        fromCurrencyCode: 'PLACEHOLDER',
        toCurrencyCode: 'VES',
        rate: '100.0000000000',
      },
    ];

    for (const rateData of initialRates) {
      // 检查是否已存在相同的汇率对
      const existingRate = await this.exchangeRateRepository.findOne({
        where: {
          fromCurrencyCode: rateData.fromCurrencyCode,
          toCurrencyCode: rateData.toCurrencyCode,
        },
      });

      if (!existingRate) {
        const exchangeRate = this.exchangeRateRepository.create(rateData);
        await this.exchangeRateRepository.save(exchangeRate);
        this.logger.log(
          `[Currency Init] 创建初始汇率: ${rateData.fromCurrencyCode} -> ${rateData.toCurrencyCode} = ${rateData.rate}`,
        );
      } else {
        this.logger.log(
          `[Currency Init] 汇率已存在，跳过: ${rateData.fromCurrencyCode} -> ${rateData.toCurrencyCode}`,
        );
      }
    }
  }
}
