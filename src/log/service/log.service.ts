import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In, LessThan } from 'typeorm';
import { LogEvent } from '../entity/log-event.entity';
import { QueryLogDto } from '../dto/query-log.dto';
import { RecordLogDto } from '../dto/record-log.dto';
import { LogListResponse } from '../dto/log-list.response';
import { LogStats } from '../dto/log-stats.response';

export interface LogEventInput {
  eventName: string;
  level: string;
  source: string;
  payload?: Record<string, unknown>;
}

/**
 * 日志模块服务：记录和管理内部事件日志
 * 提供供其他模块调用的日志记录和查询功能
 */
@Injectable()
export class LogService {
  private readonly logger = new Logger(LogService.name);

  constructor(
    @InjectRepository(LogEvent) private readonly logRepo: Repository<LogEvent>,
  ) {}

  /**
   * 记录单个事件
   */
  async recordEvent(eventName: string, level: string, source: string, payload?: Record<string, unknown>): Promise<LogEvent> {
    try {
      const logEvent = this.logRepo.create({
        eventName,
        level,
        source,
        payload,
      });

      const saved = await this.logRepo.save(logEvent);
      this.logger.debug(`事件记录成功: ${eventName}`, { level, source });
      return saved;
    } catch (error) {
      this.logger.error(`事件记录失败: ${eventName}`, error);
      throw error;
    }
  }

  /**
   * 批量记录事件
   */
  async recordBatch(events: LogEventInput[]): Promise<LogEvent[]> {
    try {
      if (!events || events.length === 0) {
        return [];
      }

      const logEvents = events.map(event => this.logRepo.create({
        eventName: event.eventName,
        level: event.level,
        source: event.source,
        payload: event.payload,
      }));

      const saved = await this.logRepo.save(logEvents);
      this.logger.debug(`批量事件记录成功: ${events.length} 条记录`);
      return saved;
    } catch (error) {
      this.logger.error(`批量事件记录失败: ${events.length} 条记录`, error);
      throw error;
    }
  }

  /**
   * 查询日志
   */
  async queryLogs(query: QueryLogDto): Promise<LogListResponse> {
    try {
      const {
        level,
        source,
        eventName,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        search,
      } = query;

      const queryBuilder = this.logRepo.createQueryBuilder('log');

      // 构建查询条件
      if (level) {
        queryBuilder.andWhere('log.level = :level', { level });
      }

      if (source) {
        queryBuilder.andWhere('log.source = :source', { source });
      }

      if (eventName) {
        queryBuilder.andWhere('log.eventName LIKE :eventName', { 
          eventName: `%${eventName}%` 
        });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      } else if (startDate) {
        queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
      }

      if (search) {
        queryBuilder.andWhere(`
          (log.eventName ILIKE :search OR 
           log.source ILIKE :search OR 
           log.payload::text ILIKE :search)
        `, { search: `%${search}%` });
      }

      // 排序
      queryBuilder.orderBy('log.createdAt', 'DESC');

      // 分页
      const offset = (page - 1) * limit;
      queryBuilder.skip(offset).take(limit);

      const [logs, total] = await queryBuilder.getManyAndCount();

      const response: LogListResponse = {
        data: logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      return response;
    } catch (error) {
      this.logger.error('查询日志失败', error);
      throw error;
    }
  }

  /**
   * 获取日志统计
   */
  async getLogStats(filters: {
    startDate?: Date;
    endDate?: Date;
    source?: string;
  }): Promise<LogStats> {
    try {
      const { startDate, endDate, source } = filters;

      const queryBuilder = this.logRepo.createQueryBuilder('log');

      // 应用过滤条件
      if (source) {
        queryBuilder.andWhere('log.source = :source', { source });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      } else if (startDate) {
        queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
      }

      // 获取级别统计
      const levelStats = await this.logRepo
        .createQueryBuilder('log')
        .select('log.level', 'level')
        .addSelect('COUNT(*)', 'count')
        .groupBy('log.level')
        .getRawMany();

      // 获取来源统计
      const sourceStats = await this.logRepo
        .createQueryBuilder('log')
        .select('log.source', 'source')
        .addSelect('COUNT(*)', 'count')
        .groupBy('log.source')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      // 获取时间范围统计
      const timeStats = await this.logRepo
        .createQueryBuilder('log')
        .select("DATE_TRUNC('hour', log.createdAt)", 'hour')
        .addSelect('COUNT(*)', 'count')
        .groupBy("DATE_TRUNC('hour', log.createdAt)")
        .orderBy('hour', 'DESC')
        .limit(24)
        .getRawMany();

      // 获取总数
      const total = await queryBuilder.getCount();

      return {
        total,
        levelStats,
        sourceStats,
        timeStats,
      };
    } catch (error) {
      this.logger.error('获取日志统计失败', error);
      throw error;
    }
  }

  /**
   * 清理过期日志
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.logRepo.delete({
        createdAt: LessThan(cutoffDate),
      });

      const deletedCount = result.affected || 0;
      this.logger.log(`清理过期日志完成: ${deletedCount} 条记录`);
      return deletedCount;
    } catch (error) {
      this.logger.error('清理过期日志失败', error);
      throw error;
    }
  }
}
