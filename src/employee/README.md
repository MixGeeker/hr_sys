# 职员管理模块

## 概述

职员管理模块是小商超HR系统的核心组成部分，提供了完整的职员信息管理、薪酬管理和文件管理功能。该模块设计为轻量级但功能完整，特别适合小商超的简单管理需求。

## 主要功能

### 1. 职员核心管理
- **基础信息管理**：姓名、性别、出生日期、联系方式、住址、职位、入职日期
- **紧急联系人**：支持多个紧急联系人信息（JSON存储）
- **状态管理**：在职/离职状态跟踪
- **查询功能**：支持分页、搜索、过滤、排序

### 2. 薪酬管理
- **日薪记录**：记录每日工作薪酬（按日薪计算）
- **奖罚记录**：管理奖励和处罚信息
- **统计功能**：月度/年度薪酬统计、工作天数统计
- **历史记录**：完整的薪酬和奖罚历史

### 3. 文件管理
- **照片管理**：职员照片上传和管理
- **身份证件**：支持身份证正反面图片
- **合同文件**：劳动合同等文档管理
- **文件组织**：按职员ID分组，自动创建目录结构

## 模块结构

```
src/employee/
├── core/                    # 职员核心模块
│   ├── entity/              # 实体定义
│   ├── dto/                 # 数据传输对象
│   ├── service/             # 业务逻辑服务
│   └── controller/          # API控制器
├── salary/                  # 薪酬管理模块
│   ├── entity/              # 薪酬和奖罚实体
│   ├── dto/                 # 薪酬相关DTO
│   ├── service/             # 薪酬业务服务
│   └── controller/          # 薪酬API控制器
├── file/                    # 文件管理模块
│   ├── entity/              # 文件实体
│   ├── dto/                 # 文件相关DTO
│   ├── service/             # 文件业务服务
│   └── controller/          # 文件API控制器
├── employee.module.ts       # 主模块文件
├── employee.initializer.ts  # 数据库初始化器
└── README.md               # 本文档
```

## API接口

### 职员管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/employees` | 创建职员 |
| GET | `/employees` | 获取职员列表（支持分页、搜索、过滤） |
| GET | `/employees/:id` | 获取职员详情 |
| PATCH | `/employees/:id` | 更新职员信息 |
| DELETE | `/employees/:id` | 删除职员 |
| GET | `/employees/stats` | 获取职员统计信息 |

### 薪酬管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/employees/:employeeId/salary` | 添加薪酬记录 |
| GET | `/employees/:employeeId/salary` | 获取薪酬记录列表 |
| GET | `/employees/:employeeId/salary/stats` | 获取薪酬统计 |
| GET | `/employees/:employeeId/salary/monthly/:year/:month` | 获取月度薪酬统计 |
| GET | `/employees/:employeeId/salary/:id` | 获取薪酬记录详情 |
| PATCH | `/employees/:employeeId/salary/:id` | 更新薪酬记录 |
| DELETE | `/employees/:employeeId/salary/:id` | 删除薪酬记录 |

### 奖罚管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/employees/:employeeId/reward-penalty` | 添加奖罚记录 |
| GET | `/employees/:employeeId/reward-penalty` | 获取奖罚记录列表 |
| GET | `/employees/:employeeId/reward-penalty/stats` | 获取奖罚统计 |
| GET | `/employees/:employeeId/reward-penalty/monthly/:year/:month` | 获取月度奖罚统计 |
| GET | `/employees/:employeeId/reward-penalty/:id` | 获取奖罚记录详情 |
| PATCH | `/employees/:employeeId/reward-penalty/:id` | 更新奖罚记录 |
| DELETE | `/employees/:employeeId/reward-penalty/:id` | 删除奖罚记录 |

### 文件管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/employees/:employeeId/files/upload` | 上传文件 |
| POST | `/employees/:employeeId/files/upload-photo` | 上传职员照片 |
| POST | `/employees/:employeeId/files/upload-idcard/:side` | 上传身份证 |
| POST | `/employees/:employeeId/files/upload-contract` | 上传合同文件 |
| GET | `/employees/:employeeId/files` | 获取文件列表 |
| GET | `/employees/:employeeId/files/stats` | 获取文件统计 |
| GET | `/employees/:employeeId/files/type/:fileType` | 按类型获取文件 |
| GET | `/employees/:employeeId/files/primary/:fileType` | 获取主文件 |
| GET | `/employees/:employeeId/files/:id` | 获取文件详情 |
| PATCH | `/employees/:employeeId/files/:id` | 更新文件信息 |
| DELETE | `/employees/:employeeId/files/:id` | 删除文件 |

## 数据模型

### 职员表 (employee)
- `id`: UUID主键
- `name`: 姓名
- `gender`: 性别 (male/female)
- `birth_date`: 出生日期
- `phone`: 手机号
- `email`: 邮箱地址（可选）
- `address`: 家庭住址
- `position`: 职位
- `hire_date`: 入职日期
- `emergency_contacts`: 紧急联系人信息（JSON）
- `status`: 状态 (active/inactive)
- `created_at/updated_at`: 时间戳

### 薪酬表 (employee_salary)
- `id`: UUID主键
- `employee_id`: 关联职员ID
- `daily_wage`: 日薪金额
- `work_date`: 工作日期
- `remark`: 备注信息

### 奖罚表 (employee_reward_penalty)
- `id`: UUID主键
- `employee_id`: 关联职员ID
- `type`: 类型 (reward/penalty)
- `amount`: 金额
- `reason`: 原因
- `date`: 日期
- `remark`: 备注信息

### 文件表 (employee_file)
- `id`: UUID主键
- `employee_id`: 关联职员ID
- `file_type`: 文件类型
- `original_name`: 原始文件名
- `file_name`: 存储文件名
- `file_path`: 文件路径
- `file_size`: 文件大小
- `mime_type`: MIME类型
- `extension`: 文件扩展名
- `description`: 文件描述
- `is_primary`: 是否为主文件

## 文件存储策略

文件按照以下结构存储：
```
uploads/employees/{employeeId}/
├── photos/          # 照片文件
├── documents/       # 文档文件
└── others/          # 其他文件
```

每个文件都有唯一的存储名称，格式为：
```
employee_{employeeId}_{fileType}_{timestamp}{extension}
```

## 使用示例

### 创建职员
```bash
curl -X POST http://localhost:3000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "gender": "male",
    "birthDate": "1990-01-01",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "address": "北京市朝阳区XX街道XX号",
    "position": "收银员",
    "hireDate": "2023-01-01",
    "emergencyContacts": [
      {
        "name": "李四",
        "relationship": "配偶",
        "phone": "13900139000"
      }
    ]
  }'
```

### 添加薪酬记录
```bash
curl -X POST http://localhost:3000/employees/{employeeId}/salary \
  -H "Content-Type: application/json" \
  -d '{
    "dailyWage": 150.00,
    "workDate": "2023-01-01",
    "remark": "正常工作日"
  }'
```

### 上传职员照片
```bash
curl -X POST http://localhost:3000/employees/{employeeId}/files/upload-photo \
  -F "file=@/path/to/photo.jpg" \
  -F "description=职员照片"
```

## 注意事项

1. **数据库初始化**：模块会在应用启动时自动创建数据表和索引
2. **文件权限**：确保服务器对`uploads`目录有写入权限
3. **数据验证**：所有输入数据都经过严格验证
4. **错误处理**：统一的错误处理和响应格式
5. **性能优化**：合理的索引设计和查询优化

## 扩展性

该模块采用模块化设计，易于扩展：

- 可添加新的文件类型
- 可扩展薪酬计算规则
- 可添加工作流和审批功能
- 可集成外部身份验证
- 可添加报表和分析功能

## 技术栈

- **框架**：NestJS
- **数据库**：PostgreSQL
- **ORM**：TypeORM
- **验证**：class-validator
- **文档**：Swagger
- **文件上传**：Multer
