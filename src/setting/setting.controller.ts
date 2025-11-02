import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SystemSettings } from './types/setting.types';
import { SystemSettingsDto } from './dto/system-settings.dto';
@ApiTags('Setting')
@ApiBearerAuth()
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @ApiOperation({ summary: '获取设置' })
  @ApiResponse({ status: 200, description: '设置', type: SystemSettingsDto })
  /**
   * 获取系统设置详情
   */
  getSettings(): Promise<SystemSettings> {
    return this.settingService.getSettingDetails();
  }

  @Post()
  @ApiOperation({ summary: '更新设置' })
  @ApiResponse({
    status: 200,
    description: '设置已更新',
    type: SystemSettingsDto,
  })
  @ApiBody({ type: CreateSettingDto })
  /**
   * 更新系统设置
   * @param createSettingDto 更新设置的请求体
   */
  updateSettings(
    @Body() createSettingDto: CreateSettingDto,
  ): Promise<SystemSettings> {
    return this.settingService.updateSettings(createSettingDto);
  }
}
