# HR后端系统

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  一个使用 <a href="http://nodejs.org" target="_blank">Node.js</a> 和 NestJS 构建的高效、可扩展的HR（人力资源）系统后端。
</p>

## 描述

本项目是基于UNameERP系统改造的HR后端服务，使用NestJS框架、TypeORM和PostgreSQL数据库构建。旨在为企业提供一套完整的人力资源管理解决方案。

## 主要功能模块

- **认证与授权**: 基于JWT的安全登录与会话管理
- **权限系统**: 精细到API端点的RBAC (基于角色的访问控制)
- **用户与员工管理**: 管理系统用户和内部员工信息
- **货币与财务**: 支持多货币与汇率管理，适用于跨国企业
- **操作历史**: 自动记录关键实体的变更历史
- **系统日志**: 完整的操作日志记录和统计分析
- **文件上传**: 支持员工资料、证件等文件的上传管理
- **系统设置**: 灵活的系统配置管理

## 技术栈

- **框架**: [NestJS](https://nestjs.com/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **语言**: TypeScript
- **认证**: JWT
- **API文档**: Swagger

## 项目设置

1.  **克隆代码仓库**
    ```bash
    git clone https://github.com/MixGeeker/hr_sys.git
    cd hr_sys
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    在项目根目录创建一个 `.env` 文件，并根据需要配置以下变量：
    ```env
    # 数据库连接
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=your_db_user
    DB_PASSWORD=your_db_password
    DB_DATABASE=hr_sys

    # JWT 认证
    JWT_SECRET=your_jwt_secret
    JWT_REFRESH_SECRET=your_jwt_refresh_secret
    ```

4.  **启动数据库**
    请确保您的 PostgreSQL 服务正在运行，并且已创建对应的数据库。TypeORM 将根据实体定义自动同步数据表结构。

## 运行项目

```bash
# 开发模式 (带热重载)
$ npm run start:dev

# 调试模式
$ npm run start:debug

# 生产模式
$ npm run start:prod
```

## 运行测试

```bash
# 单元测试
$ npm run test

# 端到端测试 (e2e)
$ npm run test:e2e

# 测试覆盖率
$ npm run test:cov
```

## 架构与约定

- **应用模块入口**: 主应用模块 (`AppModule`) 位于 `src/main` 目录下
- **数据类型**: 所有涉及金额、数量等需要高精度的数字均使用 `decimal(30, 10)` 类型，以确保计算准确
- **代码注释**: 所有新增函数、方法都应遵循 JSDoc 规范，并使用中文编写注释
- **日志记录**: 使用自定义日志装饰器记录关键操作和业务事件

## HR系统扩展

这个基础后端框架可以轻松扩展添加以下HR功能：

- **员工管理**: 员工档案、部门管理、职位管理
- **考勤管理**: 签到签出、请假申请、排班管理
- **薪资管理**: 薪资结构、工资单、社保管理
- **招聘管理**: 职位发布、简历管理、面试安排
- **绩效管理**: 绩效评估、目标设定、考核流程
- **培训管理**: 培训计划、学习记录、课程管理
- **组织架构**: 部门结构、汇报关系、权限分配

## 开发指南

### 添加新的HR模块

1. 在 `src` 目录下创建新的模块文件夹
2. 定义实体类（Entity）
3. 创建服务类（Service）和控制器（Controller）
4. 在 `app.module.ts` 中注册新模块
5. 添加相应的DTO类进行数据验证

### 数据库迁移

```bash
# 生成迁移文件
npm run migration:generate -- -n MigrationName

# 运行迁移
npm run migration:run

# 还原迁移
npm run migration:revert
```

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
