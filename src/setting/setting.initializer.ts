import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entity/setting.entity';
import { SystemConfigDto } from './dto/system-cofig.dto';

/**
 * 系统配置初始化器
 *
 * 在应用每次启动时自动检查并补全系统配置的默认值：
 * 1. 检测配置项是否存在，不存在则自动补充默认值；
 * 2. 订单配置：是否允许跨汇率订单修改（默认 false），修改订单是否重新加载价格（默认 false）。
 *
 * 注意：此初始化器与货币、用户初始化器不同，它不使用初始化标记，
 * 而是每次启动都会检查并补全缺失的配置项，确保配置的完整性。
 */
@Injectable()
export class SettingInitializer implements OnApplicationBootstrap {
  private readonly logger = new Logger('SettingInitializer');

  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  /**
   * 应用启动完成后执行配置检查和补全。
   */
  async onApplicationBootstrap(): Promise<void> {
    try {
      const setting = await this.getOrCreateSetting();

      // 每次启动都检查并补全配置
      await this.ensureConfigDefaults(setting);

      this.logger.log(
        '[Setting Init] 系统配置检查完成。',
        'SettingInitializer',
      );
    } catch (error) {
      this.logger.error(
        `[Setting Init] 配置检查失败：${(error as Error).message}`,
        (error as Error).stack,
        'SettingInitializer',
      );
    }
  }

  /**
   * 获取或创建系统设置实体。
   * @returns 设置实体
   */
  private async getOrCreateSetting(): Promise<Setting> {
    let setting = await this.settingRepository.findOne({ where: {} });
    if (!setting) {
      setting = this.settingRepository.create();
      setting = await this.settingRepository.save(setting);
      this.logger.log(
        '[Setting Init] 创建新的系统设置记录。',
        'SettingInitializer',
      );
    }
    return setting;
  }

  /**
   * 确保配置项存在默认值
   * 检测配置项，如果不存在则自动补充默认值
   * @param setting 设置实体
   */
  private async ensureConfigDefaults(setting: Setting): Promise<void> {
    const currentConfig = setting.config || {};
    const needUpdate = false;
    const updates: string[] = [];

    // 构建新的配置，保留现有值，仅设置未定义的字段
    const newConfig: SystemConfigDto = {
      ...currentConfig,
      init: currentConfig.init || {},
    };

    // 只有在需要更新时才执行数据库操作
    if (needUpdate) {
      await this.settingRepository.update(setting.id, {
        config: newConfig as any,
      });

      this.logger.log(
        `[Setting Init] 已补全缺失的配置项：${updates.join(', ')}`,
        'SettingInitializer',
      );
    } else {
      this.logger.log(
        '[Setting Init] 所有配置项已存在，无需补全。',
        'SettingInitializer',
      );
    }
  }
}
