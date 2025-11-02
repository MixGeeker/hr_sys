import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from './exchange-rate/entity/exchange_rate.entity';
import { CurrencyInitializer } from './currency.initializer';
import { CurrencyCoreModule } from './core/currency-core.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeRate]),
    CurrencyCoreModule, // 核心货币模块
    ExchangeRateModule, // 汇率子模块
  ],
  controllers: [],
  providers: [CurrencyInitializer],
  exports: [
    CurrencyCoreModule,
    ExchangeRateModule,
    TypeOrmModule, // 导出 TypeOrmModule 以便其他模块可以注入相关实体
  ],
})
export class CurrencyModule {}
