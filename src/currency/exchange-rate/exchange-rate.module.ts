import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRate } from './entity/exchange_rate.entity';
import { ExchangeRateService } from './services/exchange-rate.service';
import { ExchangeRateController } from './controllers/exchange-rate.controller';
import { CurrencyCoreModule } from '../core/currency-core.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeRate]), CurrencyCoreModule],
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService],
  exports: [TypeOrmModule, ExchangeRateService],
})
export class ExchangeRateModule {}
