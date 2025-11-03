import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EmployeeInitializer implements OnModuleInit {
  private readonly logger = new Logger(EmployeeInitializer.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('初始化职员模块...');
    await this.createTables();
    await this.createIndexes();
    this.logger.log('职员模块初始化完成');
  }

  private async createTables() {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 创建职员表
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS employee (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(50) NOT NULL COMMENT '姓名',
          gender VARCHAR(20) NOT NULL COMMENT '性别',
          birth_date DATE NOT NULL COMMENT '出生日期',
          phone VARCHAR(20) NOT NULL COMMENT '手机号',
          email VARCHAR(100) NULL COMMENT '邮箱地址',
          address TEXT NOT NULL COMMENT '家庭住址',
          position VARCHAR(50) NOT NULL COMMENT '职位',
          hire_date DATE NOT NULL COMMENT '入职日期',
          emergency_contacts JSONB NULL COMMENT '紧急联系人信息',
          status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '职员状态',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '创建时间',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '更新时间'
        ) COMMENT = '职员表';
      `);

      // 创建薪酬表
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS employee_salary (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL COMMENT '职员ID',
          daily_wage DECIMAL(10,2) NOT NULL COMMENT '日薪金额',
          work_date DATE NOT NULL COMMENT '工作日期',
          remark TEXT NULL COMMENT '备注信息',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '创建时间',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '更新时间',
          FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
        ) COMMENT = '薪酬记录表';
      `);

      // 创建奖罚表
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS employee_reward_penalty (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL COMMENT '职员ID',
          type VARCHAR(20) NOT NULL COMMENT '类型：reward-奖励，penalty-处罚',
          amount DECIMAL(10,2) NOT NULL COMMENT '金额',
          reason TEXT NOT NULL COMMENT '原因',
          date DATE NOT NULL COMMENT '日期',
          remark TEXT NULL COMMENT '备注信息',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '创建时间',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '更新时间',
          FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
        ) COMMENT = '奖罚记录表';
      `);

      // 创建文件表
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS employee_file (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID NOT NULL COMMENT '职员ID',
          file_type VARCHAR(50) NOT NULL COMMENT '文件类型',
          original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
          file_name VARCHAR(255) NOT NULL COMMENT '存储文件名',
          file_path TEXT NOT NULL COMMENT '文件路径',
          file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
          mime_type VARCHAR(100) NOT NULL COMMENT '文件MIME类型',
          extension VARCHAR(10) NOT NULL COMMENT '文件扩展名',
          description VARCHAR(255) NULL COMMENT '文件描述',
          is_primary BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为主文件',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '创建时间',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() COMMENT '更新时间',
          FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
        ) COMMENT = '职员文件表';
      `);

      await queryRunner.commitTransaction();
      this.logger.log('数据表创建完成');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('数据表创建失败', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createIndexes() {
    const queryRunner = this.dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 创建索引
      const indexes = [
        // 职员表索引
        'CREATE INDEX IF NOT EXISTS idx_employee_status ON employee(status)',
        'CREATE INDEX IF NOT EXISTS idx_employee_created_at ON employee(created_at)',
        
        // 薪酬表索引
        'CREATE INDEX IF NOT EXISTS idx_salary_employee_id ON employee_salary(employee_id)',
        'CREATE INDEX IF NOT EXISTS idx_salary_work_date ON employee_salary(work_date)',
        'CREATE INDEX IF NOT EXISTS idx_salary_created_at ON employee_salary(created_at)',
        
        // 奖罚表索引
        'CREATE INDEX IF NOT EXISTS idx_reward_penalty_employee_id ON employee_reward_penalty(employee_id)',
        'CREATE INDEX IF NOT EXISTS idx_reward_penalty_type ON employee_reward_penalty(type)',
        'CREATE INDEX IF NOT EXISTS idx_reward_penalty_date ON employee_reward_penalty(date)',
        'CREATE INDEX IF NOT EXISTS idx_reward_penalty_created_at ON employee_reward_penalty(created_at)',
        
        // 文件表索引
        'CREATE INDEX IF NOT EXISTS idx_employee_file_employee_id ON employee_file(employee_id)',
        'CREATE INDEX IF NOT EXISTS idx_employee_file_type ON employee_file(file_type)',
        'CREATE INDEX IF NOT EXISTS idx_employee_file_created_at ON employee_file(created_at)',
      ];

      for (const indexSql of indexes) {
        await queryRunner.query(indexSql);
      }

      await queryRunner.commitTransaction();
      this.logger.log('索引创建完成');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('索引创建失败', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
