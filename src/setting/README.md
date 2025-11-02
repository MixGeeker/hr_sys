# 系统设置模块

## 概述

系统设置模块用于管理整个应用的全局配置，包括公司信息、系统配置和初始化标记。

## 功能特性

### 1. 基础设置
- **公司名称** (`companyName`): 公司的名称
- **税号** (`taxId`): 税务识别号
- **地址** (`address`): 公司地址数组

### 2. 系统配置 (`config`)

系统配置存储在 JSONB 字段中，支持以下配置项：

#### 订单配置
- **allowCrossCurrencyOrderModification**: 是否允许跨汇率订单的修改
  - 类型: `boolean`
  - 默认值: `false`
  - 说明: 当订单中存在不同货币的商品时，是否允许修改订单

- **reloadPriceOnOrderModification**: 修改订单是否需要重新加载价格
  - 类型: `boolean`
  - 默认值: `false`
  - 说明: 修改订单时是否自动重新计算商品价格

#### 初始化标记 (`init`)
用于记录一次性模块的初始化状态（仅用于数据初始化）：
- `currency`: 货币模块是否已初始化（一次性数据初始化）
- `user`: 用户模块是否已初始化（一次性数据初始化）

**注意：** 系统配置项（如订单相关配置）不使用初始化标记，而是在每次应用启动时自动检查并补全缺失的配置项。

## 初始化器

### SettingInitializer

系统配置初始化器在**每次**应用启动时自动运行，确保配置的完整性：

1. **检测并补全策略**：不使用初始化标记，每次启动都会检查配置项
2. 如果检测到配置项不存在（`undefined`），自动补充默认值：
   - `allowCrossCurrencyOrderModification = false`
   - `reloadPriceOnOrderModification = false`
3. 如果配置项已存在（即使值为 `false`），则保持不变

**与其他初始化器的区别：**
- **货币/用户初始化器**：一次性数据初始化，使用 `init` 标记，完成后不再执行
- **配置初始化器**：每次启动都检查，自动补全新增的配置项，确保向前兼容

**优势：**
- 新版本添加配置项时，自动为现有系统补充默认值
- 无需手动数据迁移
- 保持配置结构的完整性

## API 端点

### 获取设置

```http
GET /setting
```

**响应示例：**
```json
{
  "companyName": "UName",
  "taxId": "J-1234567890",
  "address": ["Street 1", "City"],
  "config": {
    "allowCrossCurrencyOrderModification": false,
    "reloadPriceOnOrderModification": false,
    "init": {
      "currency": true,
      "user": true
    }
  }
}
```

### 更新设置

```http
POST /setting
Content-Type: application/json
```

**请求体示例：**
```json
{
  "companyName": "新公司名称",
  "config": {
    "allowCrossCurrencyOrderModification": true,
    "reloadPriceOnOrderModification": true
  }
}
```

**注意：** 配置更新采用合并策略，不会覆盖未提供的字段。

## 在代码中使用

### 1. 在订单服务中使用配置

```typescript
import { Injectable } from '@nestjs/common';
import { SettingService } from '../setting/setting.service';

@Injectable()
export class OrderService {
  constructor(private readonly settingService: SettingService) {}

  /**
   * 检查是否允许修改订单
   */
  async checkOrderModificationAllowed(order: Order): Promise<void> {
    const settings = await this.settingService.getSettingDetails();
    
    // 检查是否存在跨货币项
    const hasCrossCurrency = this.orderHasDifferentCurrencies(order);
    
    if (hasCrossCurrency && !settings.config.allowCrossCurrencyOrderModification) {
      throw new BadRequestException('不允许修改包含多种货币的订单');
    }
  }

  /**
   * 修改订单
   */
  async updateOrder(orderId: string, updateDto: UpdateOrderDto): Promise<Order> {
    const settings = await this.settingService.getSettingDetails();
    const order = await this.findOrder(orderId);
    
    // 检查是否允许修改
    await this.checkOrderModificationAllowed(order);
    
    // 如果配置要求，重新加载价格
    if (settings.config.reloadPriceOnOrderModification) {
      await this.reloadOrderPrices(order);
    }
    
    // 继续更新订单...
    return order;
  }
}
```

### 2. 使用缓存的设置（更快）

如果不需要实时的设置，可以使用缓存版本：

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { SYSTEM_SETTINGS } from '../setting/setting.constants';
import { SystemSettings } from '../setting/types/setting.types';

@Injectable()
export class SomeService {
  constructor(
    @Inject(SYSTEM_SETTINGS)
    private readonly systemSettings: SystemSettings,
  ) {}

  someMethod() {
    // 直接使用缓存的设置
    if (this.systemSettings.config.allowCrossCurrencyOrderModification) {
      // ...
    }
  }
}
```

**注意：** 缓存的设置在应用启动时加载，之后通过 `SettingService.updateSettings()` 更新时会自动刷新。

## 数据结构

### SystemConfigDto

```typescript
export class SystemConfigDto {
  allowCrossCurrencyOrderModification?: boolean;
  reloadPriceOnOrderModification?: boolean;
  init?: InitFlagsDto;
}
```

### InitFlagsDto

```typescript
export class InitFlagsDto {
  currency?: boolean;
  user?: boolean;
}
```

## 最佳实践

1. **使用缓存设置**：对于不经常变化的配置，使用注入的 `SYSTEM_SETTINGS` 获得更好的性能
2. **配置验证**：在使用配置前，确保有合理的默认值
3. **部分更新**：更新配置时只传递需要修改的字段，其他字段会保持不变
4. **添加新配置项**：
   - 在 `SystemConfigDto` 中添加新字段
   - 在 `SettingInitializer.ensureConfigDefaults()` 中添加检测和默认值逻辑
   - 系统会在下次启动时自动为所有现有记录补充该配置项
5. **初始化标记**：仅用于一次性数据初始化（如添加新模块），在 `InitFlagsDto` 中添加相应标记

## 相关文件

- `setting.entity.ts` - 设置实体定义
- `setting.service.ts` - 设置服务
- `setting.controller.ts` - 设置控制器
- `setting.initializer.ts` - 配置初始化器
- `dto/system-cofig.dto.ts` - 系统配置 DTO
- `dto/create-setting.dto.ts` - 创建/更新设置 DTO
- `dto/system-settings.dto.ts` - 系统设置响应 DTO
- `types/setting.types.ts` - 类型定义

