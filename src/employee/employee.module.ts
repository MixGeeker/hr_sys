import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Core模块
import { EmployeeService } from './core/service/employee.service';
import { EmployeeController } from './core/controller/employee.controller';
import { Employee } from './core/entity/employee.entity';

// Salary模块
import { SalaryService } from './salary/service/salary.service';
import { SalaryController } from './salary/controller/salary.controller';
import { RewardPenaltyService } from './salary/service/reward-penalty.service';
import { Salary } from './salary/entity/salary.entity';
import { RewardPenalty } from './salary/entity/reward-penalty.entity';

// File模块
import { EmployeeFileService } from './file/service/employee-file.service';
import { EmployeeFileController } from './file/controller/employee-file.controller';
import { EmployeeFile } from './file/entity/employee-file.entity';

// 初始化器
import { EmployeeInitializer } from './employee.initializer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core entities
      Employee,
      
      // Salary entities
      Salary,
      RewardPenalty,
      
      // File entities
      EmployeeFile,
    ]),
  ],
  controllers: [
    // Core controllers
    EmployeeController,
    
    // Salary controllers
    SalaryController,
    
    // File controllers
    EmployeeFileController,
  ],
  providers: [
    // Core services
    EmployeeService,
    
    // Salary services
    SalaryService,
    RewardPenaltyService,
    
    // File services
    EmployeeFileService,
    
    // 初始化器
    EmployeeInitializer,
    Logger,
  ],
  exports: [
    // Export core entities for other modules
    TypeOrmModule.forFeature([Employee, Salary, RewardPenalty, EmployeeFile]),
    
    // Export core services
    EmployeeService,
    SalaryService,
    RewardPenaltyService,
    EmployeeFileService,
  ],
})
export class EmployeeModule {}
