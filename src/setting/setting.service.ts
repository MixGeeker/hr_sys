import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entity/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { SystemSettings } from './types/setting.types';
import { SYSTEM_SETTINGS } from './setting.constants';
@Injectable()
export class SettingService {
  private internalSystemSettings: SystemSettings = {} as SystemSettings;

  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly logger: Logger,
  ) {
    this.initializeSettings();
  }

  private async initializeSettings() {
    await this.updateSystemSettingsCache();
  }

  private async findOrCreate(): Promise<Setting> {
    let settings = await this.settingRepository.findOne({
      where: {},
    });

    if (!settings) {
      this.logger.log('找不到设置，创建一个新设置', 'SettingService');
      settings = this.settingRepository.create();
      await this.settingRepository.save(settings);
      this.logger.log('新设置创建成功', 'SettingService');
      // 更新系统设置
      await this.updateSystemSettingsCache();
    }

    return settings;
  }

  /**
   * 获取系统设置详情
   * @returns 系统设置详情，包含配置信息
   */
  async getSettingDetails(): Promise<SystemSettings> {
    const settings = await this.findOrCreate();
    const config = settings.config || {};
    return {
      companyName: settings.companyName,
      taxId: settings.taxId,
      address: settings.address,
      config: {
        init: config.init || {},
      },
    };
  }

  /**
   * 更新系统设置
   * @param createSettingDto 更新设置的数据传输对象
   * @returns 更新后的系统设置详情
   */
  async updateSettings(
    createSettingDto: CreateSettingDto,
  ): Promise<SystemSettings> {
    let settings = await this.findOrCreate();

    // 如果提供了 config，需要合并而不是替换
    if (createSettingDto.config) {
      settings.config = {
        ...settings.config,
        ...createSettingDto.config,
      };
      // 从 DTO 中移除 config，避免重复合并
      const { config, ...restDto } = createSettingDto;
      settings = this.settingRepository.merge(settings, restDto);
    } else {
      // 更新实体
      settings = this.settingRepository.merge(settings, createSettingDto);
    }

    const updatedSettings = await this.settingRepository.save(settings);

    // 更新全局设置
    await this.updateSystemSettingsCache();

    // 返回更新后的设置详情
    const detailedSettings = await this.settingRepository.findOne({
      where: { id: updatedSettings.id },
    });

    if (!detailedSettings) {
      // 这在理论上不应该发生，因为我们刚刚保存了它
      this.logger.error(
        `Could not find settings with id ${updatedSettings.id} after saving.`,
        'SettingService',
      );
      throw new Error('Failed to retrieve settings after update.');
    }

    // 这里返回的值可以从更新后的全局变量中获取，确保一致性
    return this.internalSystemSettings;
  }

  private async updateSystemSettingsCache() {
    const settings = await this.getSettingDetails();
    // 直接将查询到的最新设置赋值给内部持有的对象
    Object.assign(this.internalSystemSettings, settings);
    this.logger.log('内部系统设置缓存已更新', 'SettingService');
  }

  getSystemSettingsFromCache(): SystemSettings {
    return this.internalSystemSettings;
  }
}
