/**
 * 日志模块使用示例
 * 展示如何在其他模块中集成和使用日志功能
 */

import { Injectable, Module } from '@nestjs/common';
import { LogModule } from '../log.module';
import { LogService } from '../service/log.service';
import { LogEvent, LogError, LogSuccess } from '../decorators/log-event.decorator';

// 示例1: 在服务中直接注入LogService
@Injectable()
export class UserService {
  constructor(private readonly logService: LogService) {}

  // 手动记录事件
  async login(userId: number, username: string) {
    await this.logService.recordEvent(
      'user.login',
      'info',
      'auth',
      { userId, username, timestamp: new Date() }
    );
    
    // 业务逻辑...
    return { success: true };
  }

  // 使用装饰器自动记录
  @LogEvent({ eventName: 'user.update_profile', level: 'info', source: 'user' })
  async updateProfile(userId: number, profileData: any) {
    // 业务逻辑...
    return { userId, ...profileData };
  }

  // 错误记录装饰器
  @LogError({ eventName: 'user.delete', source: 'user' })
  async deleteUser(userId: number) {
    // 业务逻辑...
    if (!userId) {
      throw new Error('用户ID不能为空');
    }
    
    // 删除用户...
    return { success: true, userId };
  }

  // 成功记录装饰器
  @LogSuccess({ eventName: 'user.create', source: 'user' })
  async createUser(userData: any) {
    // 业务逻辑...
    return { id: 123, ...userData };
  }

  // 批量记录示例
  async batchProcessUsers(users: any[]) {
    const events = users.map(user => ({
      eventName: 'user.batch_process',
      level: 'info',
      source: 'user',
      payload: { userId: user.id, action: 'batch_update' }
    }));

    await this.logService.recordBatch(events);
  }
}

// 示例2: 在订单模块中使用
@Injectable()
export class OrderService {
  constructor(private readonly logService: LogService) {}

  @LogEvent({ eventName: 'order.create', level: 'info', source: 'order' })
  async createOrder(orderData: any) {
    await this.logService.recordEvent(
      'order.create.start',
      'info',
      'order',
      { orderId: orderData.id, amount: orderData.total }
    );
    
    try {
      // 创建订单逻辑...
      const result = { id: orderData.id, status: 'pending' };
      
      await this.logService.recordEvent(
        'order.create.success',
        'info',
        'order',
        { orderId: result.id, duration: 150 }
      );
      
      return result;
    } catch (error) {
      await this.logService.recordEvent(
        'order.create.error',
        'error',
        'order',
        { error: error.message, orderId: orderData.id }
      );
      throw error;
    }
  }
}

// 示例3: 模块配置
@Module({
  imports: [
    LogModule, // 导入日志模块
    // ... 其他模块
  ],
  providers: [
    UserService,
    OrderService,
    // ... 其他服务
  ],
  exports: [
    UserService,
    OrderService,
  ],
})
export class ExampleModule {}

/**
 * 使用建议:
 * 
 * 1. 在需要使用日志的模块中导入LogModule
 * 2. 在服务中注入LogService
 * 3. 使用装饰器简化常用的事件记录
 * 4. 对于复杂的事件序列，使用手动记录
 * 5. 保持事件命名的规范性
 * 
 * 事件命名规范:
 * - 使用模块.动作格式: 'user.login', 'order.create'
 * - 动作后缀: '.start', '.success', '.error'
 * - 统一前缀: 保持模块前缀的一致性
 */
