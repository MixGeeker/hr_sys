import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * 数据库能力服务：检测并缓存数据库扩展的可用性。
 */
@Injectable()
export class DatabaseCapabilityService {
  private extensionAvailabilityCache: Map<string, boolean> = new Map(); // 缓存扩展的可用性

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * 检查指定扩展是否启用（结果缓存）
   * @param extname 扩展名，例如 'pg_trgm'
   */
  async isExtensionEnabled(extname: string): Promise<boolean> {
    if (!extname) return false;
    if (this.extensionAvailabilityCache.has(extname)) {
      return this.extensionAvailabilityCache.get(extname)!;
    }
    try {
      const rows = await this.dataSource.query(
        'SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = $1) AS enabled',
        [extname],
      );
      const enabled = Boolean(rows?.[0]?.enabled);
      this.extensionAvailabilityCache.set(extname, enabled);
      return enabled;
    } catch (_) {
      this.extensionAvailabilityCache.set(extname, false);
      return false;
    }
  }

  /**
   * 是否启用 pg_trgm 扩展
   */
  async isPgTrgmEnabled(): Promise<boolean> {
    return this.isExtensionEnabled('pg_trgm');
  }

  /**
   * 是否启用 pg_stat_statements 扩展
   */
  async isPgStatStatementsEnabled(): Promise<boolean> {
    return this.isExtensionEnabled('pg_stat_statements');
  }
}
