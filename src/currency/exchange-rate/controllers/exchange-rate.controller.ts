import { Body, Controller, Get, Param, Patch, Logger } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { UpdateExchangeRateDto } from '../dto/update-exchange-rate.dto';
import { ExchangeRate } from '../entity/exchange_rate.entity';

@ApiTags('CurrencyExchangeRate')
@ApiBearerAuth()
@Controller('currency/exchange-rate')
export class ExchangeRateController {
  constructor(private readonly service: ExchangeRateService) {}

  private readonly logger = new Logger(ExchangeRateController.name);

  @Get('current')
  @ApiOperation({ summary: '获取所有货币对的当前有效汇率' })
  @ApiResponse({
    status: 200,
    description: '当前有效汇率列表',
    type: [ExchangeRate],
  })
  current(): Promise<ExchangeRate[]> {
    return this.service.findAllCurrent();
  }

  @Get('current/:currencyCode')
  @ApiOperation({ summary: '获取指定货币的当前有效汇率' })
  @ApiParam({ name: 'currencyCode', description: '货币代码' })
  @ApiResponse({ status: 200, description: '当前有效汇率', type: ExchangeRate })
  getCurrentRate(
    @Param('currencyCode') currencyCode: string,
  ): Promise<ExchangeRate> {
    return this.service.findCurrentRateByCurrency(currencyCode);
  }

  @Patch(':currencyCode')
  @ApiOperation({ summary: '更新汇率' })
  @ApiParam({ name: 'currencyCode', description: '货币代码' })
  @ApiBody({ type: UpdateExchangeRateDto })
  @ApiResponse({ status: 200, description: '更新成功', type: ExchangeRate })
  update(
    @Param('currencyCode') currencyCode: string,
    @Body() dto: UpdateExchangeRateDto,
  ): Promise<ExchangeRate> {
    return this.service.updateByCurrency(currencyCode, dto);
  }
}
