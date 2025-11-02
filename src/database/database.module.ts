import { Module, Global } from '@nestjs/common';
import { databaseProviders } from './database.provider';
import { DataSource } from 'typeorm';
import { DatabaseCapabilityService } from './database-capability.service';

@Global()
@Module({
  providers: [...databaseProviders, DatabaseCapabilityService],
  exports: [DataSource, DatabaseCapabilityService],
})
export class DatabaseModule {
  constructor(private readonly dataSource: DataSource) {}
}
