# 日志模块（LogModule）

**状态：✅ 重构完成**

日志模块已重新构建完成，专注于内部事件记录，提供简洁的API供其他模块调用，实现内部事件的记录、查询和管理。

## 功能特性

### ✅ 已完成功能
- [x] 基本的日志记录功能
- [x] 批量事件记录
- [x] 复杂的日志查询和过滤
- [x] 分页查询支持
- [x] 日志统计和分析
- [x] 日志清理和归档
- [x] 日志装饰器支持
- [x] 完整的API接口
- [x] 数据库表结构：`sys_log_event`

### 🔧 核心服务

#### LogService
主要提供以下方法：

```typescript
// 记录单个事件
async recordEvent(eventName: string, level: string, source: string, payload?: Record<string, unknown>): Promise<LogEvent>

// 批量记录事件
async recordBatch(events: LogEventInput[]): Promise<LogEvent[]>

// 查询日志
async queryLogs(query: QueryLogDto): Promise<LogListResponse>

// 获取统计
async getLogStats(filters: any): Promise<LogStats>

// 清理过期日志
async cleanupOldLogs(daysToKeep: number = 30): Promise<number>
```

## 使用方法

### 1. 在其他模块中注入LogService

```typescript
// 在你的模块中导入LogModule
@Module({
  imports: [
    // ... 其他模块
    LogModule, // 确保导入LogModule
  ],
})
export class YourModule {}

// 在服务中注入LogService
@Injectable()
export class YourService {
  constructor(
    private readonly logService: LogService, // 注入LogService
  ) {}

  async yourMethod() {
    // 记录事件
    await this.logService.recordEvent(
      'user.action', 
      'info', 
      'user', 
      { userId: 123, action: 'update_profile' }
    );
  }
}
```

### 2. 使用装饰器记录事件

```typescript
import { LogEvent, LogError, LogSuccess } from '../decorators/log-event.decorator';

@Injectable()
export class UserService {
  // 使用装饰器自动记录方法调用
  @LogEvent({ eventName: 'user.login', level: 'info', source: 'auth' })
  async login(username: string, password: string) {
    // 登录逻辑
    return { success: true };
  }

  @LogError({ eventName: 'user.delete', source: 'user' })
  async deleteUser(userId: string) {
    // 删除用户逻辑
    throw new Error('删除失败');
  }

  @LogSuccess({ eventName: 'user.create', source: 'user' })
  async createUser(userData: any) {
    // 创建用户逻辑
    return { id: 123, ...userData };
  }
}
```

### 3. API接口

#### 查询日志
```http
GET /logs?level=info&source=auth&startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z&page=1&limit=20&search=login
```

#### 获取统计
```http
GET /logs/stats?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z&source=auth
```

#### 清理过期日志
```http
POST /logs/cleanup?daysToKeep=30
```

#### 手动记录事件
```http
POST /logs/record
Content-Type: application/json

{
  "eventName": "user.login",
  "level": "info",
  "source": "auth",
  "payload": {
    "userId": 123,
    "ip": "192.168.1.1"
  }
}
```

## 数据模型

### LogEvent实体
- `id` (uuid): 事件ID
- `eventName` (string): 事件名称
- `level` (string): 事件级别 (info|warn|error)
- `source` (string): 事件来源模块
- `payload` (jsonb): 事件负载数据
- `createdAt` (timestamptz): 创建时间

## 最佳实践

### 事件命名约定
- 使用点号分隔：`模块.动作` (如 `user.login`, `order.create`)
- 统一前缀：根据来源模块使用一致的前缀

### 日志级别使用
- `info`: 一般信息事件
- `warn`: 警告信息
- `error`: 错误和异常

### 负载数据设计
```typescript
// 好的负载数据示例
await logService.recordEvent('user.login', 'info', 'auth', {
  userId: 123,
  username: 'john_doe',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
  duration: 150
});
```

## 数据库索引

已创建索引：
- `idx_log_event_name`: 事件名称索引，用于快速查询特定事件
- 主键索引：UUID主键自动索引
- 自动创建的createdAt索引用于时间范围查询

## 性能考虑

- 使用批量插入减少数据库压力
- 异步记录避免阻塞业务逻辑
- 合理的索引策略提高查询性能
- 支持分页查询避免大量数据传输

## 监控和维护

- 日志定期清理（建议设置定时任务）
- 监控日志表大小增长
- 关注查询性能，必要时添加额外索引
- 定期查看统计信息了解系统运行状况
