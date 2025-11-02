import { SetMetadata } from '@nestjs/common';

/**
 * 日志事件装饰器元数据键
 */
export const LOG_EVENT_KEY = 'log_event';

/**
 * 日志事件装饰器参数接口
 */
export interface LogEventOptions {
  eventName: string;
  level: 'info' | 'warn' | 'error';
  source?: string;
}

/**
 * 日志事件装饰器
 * 自动记录方法调用事件
 * 
 * @param options 日志事件配置
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @LogEvent({ eventName: 'user.login', level: 'info', source: 'auth' })
 *   async login(username: string, password: string) {
 *     // 登录逻辑
 *   }
 * }
 * ```
 */
export const LogEvent = (options: LogEventOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // 保存原始方法
    const originalMethod = descriptor.value;
    
    // 重写方法实现
    descriptor.value = async function (...args: any[]) {
      const instance = this;
      
      // 尝试获取LogService实例
      let logService: any = null;
      if (instance && instance.logService) {
        logService = instance.logService;
      } else if (instance && instance.logger) {
        // 如果没有LogService，记录到普通日志
        instance.logger.log(`事件: ${options.eventName}`, { level: options.level, source: options.source });
      }

      // 记录方法开始事件
      const startTime = Date.now();
      try {
        const result = await originalMethod.apply(instance, args);
        
        // 记录成功事件
        if (logService) {
          const duration = Date.now() - startTime;
          await logService.recordEvent(
            `${options.eventName}.success`,
            options.level,
            options.source || target.constructor.name,
            {
              method: propertyKey,
              duration,
              args: args.length > 0 ? '[已记录]' : null,
            }
          );
        }
        
        return result;
      } catch (error) {
        // 记录错误事件
        if (logService) {
          await logService.recordEvent(
            `${options.eventName}.error`,
            'error',
            options.source || target.constructor.name,
            {
              method: propertyKey,
              error: error.message,
              stack: error.stack,
              args: args.length > 0 ? '[已记录]' : null,
            }
          );
        }
        
        throw error;
      }
    };
    
    return descriptor;
  };
};

/**
 * 错误日志装饰器
 * 专门记录方法中的异常
 * 
 * @param options 日志事件配置
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @LogError({ eventName: 'user.operation', level: 'error', source: 'user' })
 *   async deleteUser(id: string) {
 *     // 删除逻辑
 *   }
 * }
 * ```
 */
export const LogError = (options: Omit<LogEventOptions, 'level'>) => {
  return LogEvent({ ...options, level: 'error' });
};

/**
 * 成功日志装饰器
 * 专门记录方法成功执行
 * 
 * @param options 日志事件配置
 * 
 * @example
 * ```typescript
 * class UserService {
 *   @LogSuccess({ eventName: 'user.create', level: 'info', source: 'user' })
 *   async createUser(userData: any) {
 *     // 创建逻辑
 *   }
 * }
 * ```
 */
export const LogSuccess = (options: Omit<LogEventOptions, 'level'>) => {
  return LogEvent({ ...options, level: 'info' });
};
