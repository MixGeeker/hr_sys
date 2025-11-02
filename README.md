# UName ERP 本地服务器

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  一个使用 <a href="http://nodejs.org" target="_blank">Node.js</a> 和 NestJS 构建的高效、可扩展的ERP系统后端。
</p>

## 描述

本项目是 UName ERP 系统的后端服务，使用 NestJS 框架、TypeORM 和 PostgreSQL 数据库构建。旨在为企业提供一套完整的资源计划、管理与追踪解决方案。

## 主要功能模块

- **认证与授权**: 基于 JWT 的安全登录与会话管理。
- **权限系统**: 精细到API端点的 RBAC (基于角色的访问控制)。
- **用户与员工管理**: 管理系统用户和内部员工信息。
- **商品管理**: 支持 SPU/SKU 模型，管理商品品牌、分类、规格、价格等。
- **仓库与库存管理**: 支持多层级仓库结构，实时跟踪商品库存与变动流水。
- **客户管理**: 维护客户信息、分组与销售渠道。
- **供应商管理**: 管理供应商信息与分组。
- **货币与财务**: 支持多货币与汇率管理。
- **操作历史**: 自动记录关键实体的变更历史。
- **守护进程**: 包含一个独立的守护进程服务，用于处理后台任务。

## 技术栈

- **框架**: [NestJS](https://nestjs.com/)
- **数据库**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **语言**: TypeScript

## 项目设置

1.  **克隆代码仓库**
    ```bash
    git clone [your-repository-url]
    cd local_server
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境变量**
    在项目根目录创建一个 `.env` 文件，并根据需要配置以下变量。请参考 `src/database/database.provider.ts` 和 `src/auth/strategies` 下的策略文件获取所有必需的环境变量。
    ```env
    # 数据库连接
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=your_db_user
    DB_PASSWORD=your_db_password
    DB_DATABASE=uname_erp

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

- **应用模块入口**: 主应用模块 (`AppModule`) 位于 `src/main` 目录下，而非标准的根目录。
- **双服务模式**: 项目同时启动一个主 NestJS Web 服务器和一个守护进程服务器 (`daemon`)。
- **数据类型**: 所有涉及金额、数量等需要高精度的数字均使用 `decimal(30, 10)` 类型，以确保计算准确。
- **代码注释**: 所有新增函数、方法都应遵循 JSDoc 规范，并使用中文编写注释。
