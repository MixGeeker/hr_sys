import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEvent } from './entity/log-event.entity';
import { LogService } from './service/log.service';
import { LogController } from './controllers/log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogEvent])],
  providers: [LogService],
  controllers: [LogController],
  exports: [LogService], // 导出LogService供其他模块使用
})
export class LogModule {}
