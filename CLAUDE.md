# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是基于 NestJS、TypeScript 和 PostgreSQL 构建的 UName ERP（企业资源计划）系统后端。该系统提供全面的业务管理功能，包括认证、库存管理、客户关系、财务操作、订单处理等。

## 核心命令

### 开发相关
```bash
# 安装依赖
npm install

# 启动开发服务器（热重载）
npm run start:dev

# 调试模式启动
npm run start:debug

# 生产环境构建
npm run build

# 启动生产服务器
npm run start:prod
```

### 测试与代码质量
```bash
# 运行单元测试
npm run test

# 监视模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:cov

# 运行端到端测试
npm run test:e2e

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 架构概览

### 独特架构特性
- **双服务器模式**：同时运行主 NestJS Web 服务器（端口 3000）和守护进程服务器（端口 3001）
- **应用模块位置**：主应用模块位于 `src/main/app.module.ts` 而非项目根目录
- **数据库自动创建**：自动创建 PostgreSQL 数据库并启用必需的扩展（pg_trgm、pg_stat_statements、vector）
- **网络发现**：使用 Bonjour 协议自动发布服务到局域网，支持服务发现

### 核心模块结构
- **认证模块**：基于 JWT 的认证，包含刷新令牌和全局守卫（`src/auth/`）
- **用户管理**：用户管理，支持分页查询（`src/user/`）
- **客户管理**：客户信息管理与分组（`src/customer/`）
- **财务模块**：货币管理与汇率（`src/currency/`）
- **设备管理**：设备管理和设置，支持分页查询（`src/device/`）
- **历史记录**：关键实体的变更自动跟踪（`src/history/`）
- **日志系统**：操作日志记录（`src/log/`）
- **网络模块**：局域网服务发现和广播（`src/network/`）
- **网关模块**：WebSocket 事件通信（`src/gateway/`）
- **上传模块**：文件上传服务（`src/upload/`）
- **设置模块**：系统设置管理（`src/setting/`）

> **注意**：商品管理、库存管理、订单管理、员工管理和权限系统模块已被移除

### 数据库配置
- 使用 TypeORM 与 PostgreSQL
- 所有金额/数量值使用 `decimal(30, 10)` 确保高精度
- 非生产环境启用数据库同步
- 强制使用 UTC 时区保持一致性
- 所有日期字段统一使用 `timestamptz` 类型提高时间数据一致性

### 关键技术模式
- **全局守卫**：自动应用 JWT 认证和 CLS 用户上下文，新增 ClsUserGuard 确保认证后将用户信息写入 CLS
- **事件驱动**：使用 NestJS EventEmitter 实现解耦操作
- **WebSocket 支持**：通过 Socket.IO 提供实时事件，包含 AsyncAPI 文档和多个专用网关（AI任务、货币、订单等）
- **文件上传**：服务多个静态目录（`/uploads`、`/files`、`/images`）
- **审计跟踪**：内置实体变更历史跟踪
- **网络发现**：使用 Bonjour 协议自动发布服务到局域网，支持服务发现和扫描

## 开发规范

### 代码标准（根据项目约定）
1. **语言要求**：所有注释和用户界面信息必须使用中文
2. **文档规范**：所有函数必须附上符合 JSDoc 规范的中文注释
3. **避免弃用**：不要使用已弃用的函数
4. **验证优先**：不清楚的接口或函数需要先搜索查询

### API/实体/DTO 要求
- **强制 @ApiProperty()**：DTO 和实体中的所有 public 属性必须有 @ApiProperty() 装饰器
- **必需字段**：每个 @ApiProperty() 必须包含 `description`（中文）和 `example` 值
- **可选属性**：在 @ApiProperty() 中用 `required: false` 标记可选字段
- **验证规则**：在 DTO 中使用 class-validator 装饰器
- **日期字段**：DTO 中日期字段使用 string 类型提高数据一致性

### 模块开发工作流
1. **实体**：在 `src/<module>/entity/` 中创建，继承 BaseEntity，包含完整的 TypeORM 装饰器
2. **DTO**：为 create/update/query 操作创建独立的 DTO，包含验证规则
3. **服务**：实现业务逻辑，正确注入仓库，添加 JSDoc 注释
4. **控制器**：定义 REST 端点，添加 Swagger 注解和权限装饰器
5. **模块**：在模块文件中配置 imports、controllers 和 providers
6. **权限**：通过装饰器应用权限控制

### 循环依赖解决
当模块间存在相互依赖时使用 `forwardRef()`：
```typescript
import { Module, forwardRef } from '@nestjs/common';
// 在 imports 中使用：forwardRef(() => DependentModule)
```

## 环境配置

必需的环境变量（创建 `.env` 文件，参考 `.env.example`）：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=erp_system

# 服务器端口
PORT=3000
DAEMON_PORT=3001

# JWT 认证
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# 系统（可选）
SYSTEM_NAME=UName ERP Server
SERVER_ID=your_server_id

# 环境
NODE_ENV=development
```

## API 文档访问
- **Swagger UI**：http://localhost:3000/api-docs-ui
- **Swagger JSON**：http://localhost:3000/api-docs
- **AsyncAPI（WebSocket）**：http://localhost:3000/asyncapi

## 测试说明
- 单元测试位于 `test/` 目录，遵循 NestJS 约定
- E2E 测试配置在 `test/jest-e2e.json` 中
- Jest 配置 TypeScript，使用 ts-jest 转换器
- 覆盖率报告生成在 `coverage/` 目录

## 文件上传结构
- 上传目录：`uploads/`
- 静态文件服务：
  - `/uploads` → `uploads/`
  - `/files` → `uploads/files/`
  - `/images` → `uploads/images/`

## 最近重要更新

### 架构优化
- **库存模块重构**：完成库存模块的简化重构，移除了复杂的子模块结构
- **商品管理优化**：采用简化版本的商品管理，废弃了复杂的 catalog 模块
- **权限系统增强**：权限实体新增 SHA-256 哈希索引，提高权限查询性能

### 功能增强
- **用户模块优化**：新增分页获取用户列表API，支持多维度筛选
- **设备模块增强**：新增分页获取设备列表API，支持机器码、MAC地址和设备名称筛选

### 数据类型统一
- **日期字段标准化**：所有实体类统一日期字段类型为 'timestamptz'
- **DTO 字段优化**：DTO 中日期字段从 Date 类型更改为 string 类型
- **软删除支持**：相关实体中添加软删除时间字段的类型定义

### 安全与性能
- **全局守卫增强**：新增 ClsUserGuard 作为全局守卫
- **权限哈希**：权限系统支持权限编码的 SHA-256 哈希存储和索引
- **网络服务发现**：集成 Bonjour 协议，支持局域网服务自动发现

### API 改进
- **销售汇总**：订单模块新增销售汇总API，支持按时间范围和可选维度查询
- **支付状态**：优化订单查询API，新增支付状态查询选项
- **设置模块**：移除不再使用的货币相关字段，增强系统设置的可读性

## 重要提醒
- 项目启动时会自动检查并创建数据库
- 所有涉及金额、数量的字段必须使用 decimal 类型
- 新增功能时需要同时考虑权限控制和历史记录
- 遵循中文注释和文档规范
- 数据库配置参考 `.env.example` 文件，默认数据库名称为 `erp_system`