import { Module, Logger, Global } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entity/setting.entity';
import { SYSTEM_SETTINGS } from './setting.constants';
import { SettingInitializer } from './setting.initializer';

const settingsProvider = {
  provide: SYSTEM_SETTINGS,
  useFactory: (settingService: SettingService) => {
    // 现在从缓存中同步获取，而不是异步调用
    return settingService.getSystemSettingsFromCache();
  },
  inject: [SettingService],
};

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  controllers: [SettingController],
  providers: [SettingService, SettingInitializer, Logger, settingsProvider],
  exports: [settingsProvider],
})
export class SettingModule {}
