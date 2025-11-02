import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from '../entity/exchange_rate.entity';
import { UpdateExchangeRateDto } from '../dto/update-exchange-rate.dto';
import {
  validateCurrencyCode,
  normalizeRate,
} from '../utils/currency-validation.util';
import { CurrencyService } from '../../core/services/currency.service';

@Injectable()
export class ExchangeRateService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly repo: Repository<ExchangeRate>,
    private readonly currencyService: CurrencyService,
  ) {}

  /** 当前有效的汇率（每对一条） */
  async findAllCurrent(): Promise<ExchangeRate[]> {
    // 获取所有汇率记录
    return this.repo.find({
      order: {
        fromCurrencyCode: 'ASC',
        toCurrencyCode: 'ASC',
      },
    });
  }

  /** 获取当前有效的汇率对 */
  async findCurrentRate(
    fromCurrencyCode: string,
    toCurrencyCode: string,
  ): Promise<ExchangeRate> {
    validateCurrencyCode(fromCurrencyCode);
    validateCurrencyCode(toCurrencyCode);

    const rate = await this.repo.findOne({
      where: { fromCurrencyCode, toCurrencyCode },
    });

    if (!rate) {
      throw new NotFoundException(
        `未找到从 ${fromCurrencyCode} 到 ${toCurrencyCode} 的汇率`,
      );
    }
    return rate;
  }

  /** 根据货币代码获取当前有效汇率（相对于基础货币） */
  async findCurrentRateByCurrency(currencyCode: string): Promise<ExchangeRate> {
    validateCurrencyCode(currencyCode);

    // 获取基础货币
    const baseCurrency = await this.currencyService.getBaseCurrency();
    if (!baseCurrency) {
      throw new NotFoundException('未设置基础货币');
    }

    // 查询从基础货币到目标货币的汇率
    return this.findCurrentRate(baseCurrency.code, currencyCode);
  }

  /** 更新 */
  async update(id: string, dto: UpdateExchangeRateDto): Promise<ExchangeRate> {
    // 如果更新了货币代码，需要验证
    if (dto.fromCurrencyCode) {
      validateCurrencyCode(dto.fromCurrencyCode);
    }
    if (dto.toCurrencyCode) {
      validateCurrencyCode(dto.toCurrencyCode);
    }

    // 获取原始汇率用于日志记录
    const originalRate = await this.findOne(id);

    // 确保汇率是有效的数字字符串
    const updateData: any = { ...dto };
    if (dto.rate) {
      updateData.rate = normalizeRate(dto.rate);
    }

    await this.repo.update(id, updateData); // 先更新，再触发事件，避免事件触发时，汇率不存在
    const updatedRate = await this.findOne(id);

    return updatedRate;
  }

  /** 通过货币代码对更新汇率 */
  async updateByCurrencyPair(
    fromCurrencyCode: string,
    toCurrencyCode: string,
    dto: UpdateExchangeRateDto,
  ): Promise<ExchangeRate> {
    // 验证货币代码
    validateCurrencyCode(fromCurrencyCode);
    validateCurrencyCode(toCurrencyCode);

    // 获取当前有效的汇率
    const currentRate = await this.findCurrentRate(
      fromCurrencyCode,
      toCurrencyCode,
    );

    // 确保汇率是有效的数字字符串
    const updateData: any = { ...dto };
    if (dto.rate) {
      updateData.rate = normalizeRate(dto.rate);
    }

    await this.repo.update(currentRate.id, updateData); // 先更新，再触发事件，避免事件触发时，汇率不存在
    const updatedRate = await this.findOne(currentRate.id);

    return updatedRate;
  }

  /** 根据货币代码更新汇率（相对于基础货币） */
  async updateByCurrency(
    currencyCode: string,
    dto: UpdateExchangeRateDto,
  ): Promise<ExchangeRate> {
    // 验证货币代码
    validateCurrencyCode(currencyCode);

    // 获取基础货币
    const baseCurrency = await this.currencyService.getBaseCurrency();
    if (!baseCurrency) {
      throw new NotFoundException('未设置基础货币');
    }

    // 使用货币代码对更新方法
    return this.updateByCurrencyPair(baseCurrency.code, currencyCode, dto);
  }

  /** 按ID查找汇率（内部方法，用于更新操作） */
  private async findOne(id: string): Promise<ExchangeRate> {
    const found = await this.repo.findOne({
      where: { id },
    });
    if (!found) throw new NotFoundException('未找到汇率');
    return found;
  }
}
