import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrencyService } from '../services/currency.service';
import { CurrencyConfig } from '../currency-codes';

@ApiTags('Currency')
@ApiBearerAuth()
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: '获取所有货币' })
  @ApiResponse({
    status: 200,
    description: '获取所有货币',
    type: [Object],
  })
  findAll(): CurrencyConfig[] {
    return this.currencyService.findAllCurrencies();
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据货币代码查询货币' })
  @ApiParam({ name: 'code', description: '货币代码', example: 'CNY' })
  @ApiResponse({ status: 200, description: '根据代码获取货币', type: Object })
  findByCode(@Param('code') code: string): CurrencyConfig {
    return this.currencyService.findCurrencyByCode(code);
  }

  @Get('base')
  @ApiOperation({ summary: '获取基础货币' })
  @ApiResponse({ status: 200, description: '基础货币', type: Object })
  getBase(): CurrencyConfig {
    return this.currencyService.getBaseCurrency();
  }

  @Get('legal')
  @ApiOperation({ summary: '获取法定货币' })
  @ApiResponse({ status: 200, description: '法定货币', type: Object })
  getLegalTender(): CurrencyConfig {
    return this.currencyService.getLegalTenderCurrency();
  }

  @Get('active')
  @ApiOperation({ summary: '获取所有启用的货币' })
  @ApiResponse({ status: 200, description: '启用的货币列表', type: [Object] })
  getActiveCurrencies(): CurrencyConfig[] {
    return this.currencyService.findActiveCurrencies();
  }

  @Get('exchange/:fromCurrencyCode/:toCurrencyCode/:amount')
  @ApiOperation({ summary: '货币兑换' })
  @ApiParam({ name: 'fromCurrencyCode', description: '源货币代码' })
  @ApiParam({ name: 'toCurrencyCode', description: '目标货币代码' })
  @ApiParam({ name: 'amount', description: '兑换金额' })
  @ApiResponse({
    status: 200,
    description: '兑换结果',
    schema: {
      type: 'object',
      properties: {
        fromCurrency: { type: 'object' },
        toCurrency: { type: 'object' },
        fromAmount: { type: 'string' },
        toAmount: { type: 'string' },
        rate: { type: 'string' },
      },
    },
  })
  exchangeCurrency(
    @Param('fromCurrencyCode') fromCurrencyCode: string,
    @Param('toCurrencyCode') toCurrencyCode: string,
    @Param('amount') amount: string,
  ) {
    return this.currencyService.exchangeCurrency(
      fromCurrencyCode,
      toCurrencyCode,
      amount,
    );
  }

  @Get('calculate-rate/:fromCurrencyCode/:toCurrencyCode')
  @ApiOperation({ summary: '计算两种货币之间的汇率' })
  @ApiParam({ name: 'fromCurrencyCode', description: '源货币代码' })
  @ApiParam({ name: 'toCurrencyCode', description: '目标货币代码' })
  @ApiResponse({
    status: 200,
    description: '汇率值',
    schema: {
      type: 'string',
      example: '7.2500000000',
    },
  })
  calculateRate(
    @Param('fromCurrencyCode') fromCurrencyCode: string,
    @Param('toCurrencyCode') toCurrencyCode: string,
  ) {
    return this.currencyService.calculateExchangeRate(
      fromCurrencyCode,
      toCurrencyCode,
    );
  }

  @Get('rate-path/:fromCurrencyCode/:toCurrencyCode')
  @ApiOperation({ summary: '获取货币之间的汇率路径' })
  @ApiParam({ name: 'fromCurrencyCode', description: '源货币代码' })
  @ApiParam({ name: 'toCurrencyCode', description: '目标货币代码' })
  @ApiResponse({
    status: 200,
    description: '汇率路径',
    schema: {
      type: 'object',
      properties: {
        path: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from: { type: 'object' },
              to: { type: 'object' },
              rate: { type: 'string' },
            },
          },
        },
        totalRate: { type: 'string' },
        isDirect: { type: 'boolean' },
      },
    },
  })
  getRatePath(
    @Param('fromCurrencyCode') fromCurrencyCode: string,
    @Param('toCurrencyCode') toCurrencyCode: string,
  ) {
    return this.currencyService.getExchangeRatePath(
      fromCurrencyCode,
      toCurrencyCode,
    );
  }

  @Get('rate/base-to-legal/latest')
  @ApiOperation({ summary: '获取基础货币到法定货币的最新汇率' })
  @ApiResponse({ status: 200, description: '最新汇率值', type: String })
  getBaseToLegalLatest(): Promise<string> {
    return this.currencyService.getBaseToLegalLatestRateValue();
  }
}
