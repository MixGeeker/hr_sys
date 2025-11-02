import { SystemConfigDto } from '../dto/system-cofig.dto';

/**
 * 系统设置接口
 */
export interface SystemSettings {
  companyName: string | null;
  taxId: string | null;
  address: string[];
  config: SystemConfigDto;
}
