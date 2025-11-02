# 货币和汇率模块文档

## 概述

货币和汇率模块负责管理系统中的货币配置和汇率信息。系统采用单一基础货币设计，所有其他货币的汇率都是相对于基础货币来定义的。

## 架构设计

### 模块结构

```
src/currency/
├── core/                          # 货币核心模块
│   ├── controllers/                # 控制器
│   │   └── currency.controller.ts  # 货币相关API
│   ├── services/                   # 服务
│   │   └── currency.service.ts     # 货币核心服务
│   ├── currency-codes.ts           # 货币代码定义
│   └── currency-core.module.ts     # 核心模块定义
├── exchange-rate/                  # 汇率模块
│   ├── controllers/                # 控制器
│   │   └── exchange-rate.controller.ts  # 汇率相关API
│   ├── services/                   # 服务
│   │   └── exchange-rate.service.ts    # 汇率服务
│   ├── entity/                     # 实体
│   │   └── exchange_rate.entity.ts      # 汇率实体
│   ├── dto/                        # 数据传输对象
│   │   └── update-exchange-rate.dto.ts  # 更新汇率DTO
│   ├── utils/                      # 工具函数
│   │   └── currency-validation.util.ts   # 货币验证工具
│   └── exchange-rate.module.ts     # 汇率模块定义
├── currency.initializer.ts          # 货币初始化器
└── currency.module.ts              # 货币模块总入口
```

### 职责划分

1. **CurrencyService (货币核心服务)**
   - 管理货币配置和基本信息
   - 提供货币兑换计算功能
   - 处理货币代码验证

2. **ExchangeRateService (汇率服务)**
   - 管理汇率的查询和更新操作
   - 提供当前有效汇率的查询
   - 处理汇率数据的验证和标准化

## 货币系统

### 基础货币

系统中只有一个基础货币，所有其他货币的汇率都是相对于这个基础货币来定义的。基础货币可以通过系统设置进行配置。

### 货币代码

系统使用标准的ISO 4217货币代码（如USD、EUR、CNY等）来标识不同的货币。所有支持的货币代码在`currency-codes.ts`文件中定义。

### 货币配置

每个货币都有以下基本配置：
- 代码：ISO 4217货币代码
- 名称：货币的全名
- 符号：货币符号（如$、€、¥等）
- 小数位数：货币支持的小数位数
- 是否为法定货币：标识是否为法定货币

## 汇率系统

### 汇率定义

汇率表示1单位基础货币可以兑换多少单位的目标货币。例如，如果基础货币是USD，目标货币是EUR，汇率为0.85，则表示1 USD = 0.85 EUR。

### 汇率存储

系统每个货币对只存储一条汇率记录，通过更新操作来修改汇率值，而不是创建新的记录。

### 汇率计算

系统支持直接汇率和间接汇率计算：
- 直接汇率：基础货币到目标货币的直接汇率
- 间接汇率：通过中间货币计算的汇率（当没有直接汇率时）

## API接口

### 货币相关API

#### 获取所有支持的货币
```
GET /currency
```
返回所有支持的货币列表。

#### 获取基础货币
```
GET /currency/base
```
返回当前系统设置的基础货币。

#### 获取法定货币
```
GET /currency/legal-tender
```
返回所有法定货币列表。

#### 货币兑换计算
```
GET /currency/exchange/:fromCurrencyCode/:toCurrencyCode/:amount
```
计算指定金额从一种货币兑换到另一种货币的结果。

### 汇率相关API

#### 获取所有当前有效汇率
```
GET /currency/exchange-rate/current
```
返回所有货币对的当前有效汇率列表。

#### 获取指定货币的当前有效汇率
```
GET /currency/exchange-rate/current/:currencyCode
```
返回指定货币相对于基础货币的当前有效汇率。

#### 更新汇率
```
PATCH /currency/exchange-rate/:currencyCode
Content-Type: application/json

{
  "rate": "0.8600000000"
}
```

## 使用示例

### 前端调用示例

```javascript
// 获取所有支持的货币
const currencies = await fetch('/currency').then(res => res.json());

// 获取基础货币
const baseCurrency = await fetch('/currency/base').then(res => res.json());

// 获取EUR的当前汇率
const eurRate = await fetch('/currency/exchange-rate/current/EUR').then(res => res.json());

// 更新EUR汇率
const updatedRate = await fetch('/currency/exchange-rate/EUR', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rate: '0.8600000000'
  })
}).then(res => res.json());

// 计算货币兑换
const exchangeResult = await fetch('/currency/exchange/USD/EUR/100').then(res => res.json());
// 返回: { fromAmount: 100, fromCurrency: 'USD', toAmount: 86.00, toCurrency: 'EUR', rate: '0.8600000000' }
```

### 后端服务调用示例

```typescript
import { CurrencyService } from './currency/core/services/currency.service';
import { ExchangeRateService } from './currency/exchange-rate/services/exchange-rate.service';

@Injectable()
export class SomeService {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  async exampleMethod() {
    // 获取基础货币
    const baseCurrency = await this.currencyService.getBaseCurrency();
    
    // 获取EUR的当前汇率
    const eurRate = await this.exchangeRateService.findCurrentRateByCurrency('EUR');
    
    // 计算货币兑换
    const exchangeResult = await this.currencyService.calculateExchange(100, 'USD', 'EUR');
    
    // 更新EUR汇率
    const updatedRate = await this.exchangeRateService.updateByCurrency('EUR', {
      rate: '0.8600000000'
    });
  }
}
```

## 事件系统

汇率模块会触发以下事件：

1. `currency.exchange_rate.updated` - 当汇率被更新时触发
   - 事件数据包含：
     - `originalRate`: 原始汇率
     - `updatedRate`: 更新后的汇率
     - `action`: 操作类型（update）

## 注意事项

1. **汇率精度**：汇率值使用decimal(20,10)类型存储，确保高精度计算
2. **货币代码验证**：所有货币代码都会进行有效性验证
3. **汇率更新**：系统通过更新操作修改汇率，而不是创建新记录
4. **基础货币**：系统必须设置基础货币，否则汇率相关操作会失败
5. **并发控制**：汇率更新操作会触发事件，其他模块可以监听这些事件进行相应处理

## 常见问题

### Q: 如何添加新的货币？
A: 在`currency-codes.ts`文件中添加新的货币配置，然后重启应用。

### Q: 如何更改基础货币？
A: 通过系统设置更改基础货币配置，然后重启应用。

### Q: 汇率计算是如何处理的？
A: 系统首先尝试直接汇率计算，如果没有直接汇率，则通过基础货币进行间接计算。

### Q: 如何初始化汇率？
A: 汇率通过CurrencyInitializer在应用启动时自动初始化。系统会创建四个基础汇率对（USD->VES, EUR->VES, CNY->VES, PLACEHOLDER->VES），如果这些汇率已存在则跳过。如需修改初始汇率，可以更新currency.initializer.ts文件中的initialRates数组。

## 更新日志

### v3.0.0 (当前版本)
- 去掉了生效日期和失效日期的设计
- 去掉了创建汇率对的API端点
- 去掉了删除货币对的端点
- 简化了汇率查询逻辑，不再考虑日期条件
- 汇率更新是直接更新，而不是创建新记录

### v2.0.0
- 简化了API设计，使用单个货币代码而不是货币对
- 移除了不必要的端点，只保留核心功能
- 优化了模块结构，消除了循环依赖
- 提取了公共验证逻辑到工具函数
- 明确了服务职责边界

### v1.0.0
- 初始版本，包含基本的货币和汇率管理功能
