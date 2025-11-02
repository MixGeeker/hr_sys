import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from '../exchange-rate/entity/exchange_rate.entity';
import { CurrencyService } from './services/currency.service';
import { CurrencyController } from './controllers/currency.controller';

/**
 * 货币核心模块
 * 包含货币的核心功能
 */
@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate])],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService, TypeOrmModule],
})
export class CurrencyCoreModule {}
