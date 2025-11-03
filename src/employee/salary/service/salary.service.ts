import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, SelectQueryBuilder } from 'typeorm';
import { Salary } from '../entity/salary.entity';
import { Employee } from '../../core/entity/employee.entity';
import { 
  CreateSalaryDto, 
  UpdateSalaryDto, 
  QuerySalaryDto, 
  SalaryListItemDto, 
  SalaryListResponseDto, 
  SalaryStatsDto 
} from '../dto';

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(employeeId: string, createSalaryDto: CreateSalaryDto): Promise<Salary> {
    // 检查职员是否存在
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`职员不存在: ${employeeId}`);
    }

    try {
      const salary = this.salaryRepository.create({
        ...createSalaryDto,
        employeeId,
      });
      return await this.salaryRepository.save(salary) as Salary;
    } catch (error) {
      throw new BadRequestException('创建薪酬记录失败: ' + error.message);
    }
  }

  async findAll(employeeId: string, queryDto: QuerySalaryDto): Promise<SalaryListResponseDto> {
    const { page = 1, limit = 10, dateFrom, dateTo, sortBy = 'workDate', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.salaryRepository.createQueryBuilder('salary')
      .leftJoin('salary.employee', 'employee')
      .where('salary.employeeId = :employeeId', { employeeId });

    // 构建查询条件
    this.buildWhereClause(queryBuilder, { dateFrom, dateTo });

    // 构建排序
    queryBuilder.orderBy(`salary.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // 执行查询
    const [salaries, total] = await queryBuilder.getManyAndCount();

    // 转换为响应格式
    const data = salaries.map(salary => this.toListItemDto(salary));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string, employeeId?: string): Promise<Salary> {
    const queryBuilder = this.salaryRepository.createQueryBuilder('salary')
      .leftJoin('salary.employee', 'employee')
      .where('salary.id = :id', { id });

    if (employeeId) {
      queryBuilder.andWhere('salary.employeeId = :employeeId', { employeeId });
    }

    const salary = await queryBuilder.getOne();
    if (!salary) {
      throw new NotFoundException(`薪酬记录不存在: ${id}`);
    }
    return salary;
  }

  async update(id: string, updateSalaryDto: UpdateSalaryDto, employeeId?: string): Promise<Salary> {
    const salary = await this.findOne(id, employeeId);
    Object.assign(salary, updateSalaryDto);
    return await this.salaryRepository.save(salary);
  }

  async remove(id: string, employeeId?: string): Promise<void> {
    const salary = await this.findOne(id, employeeId);
    await this.salaryRepository.remove(salary);
  }

  async getStats(employeeId: string, dateFrom?: Date, dateTo?: Date): Promise<SalaryStatsDto> {
    const queryBuilder = this.salaryRepository.createQueryBuilder('salary')
      .where('salary.employeeId = :employeeId', { employeeId });

    this.buildWhereClause(queryBuilder, { dateFrom, dateTo });

    // 总工作天数
    const totalDays = await queryBuilder.getCount();

    // 总薪酬金额
    const totalResult = await queryBuilder
      .select('SUM(salary.dailyWage)', 'totalAmount')
      .getRawOne();
    const totalAmount = parseFloat(totalResult?.totalAmount || '0');

    // 平均日薪
    const averageDailyWage = totalDays > 0 ? totalAmount / totalDays : 0;

    return {
      totalDays,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      averageDailyWage: parseFloat(averageDailyWage.toFixed(2)),
    };
  }

  async getMonthlyStats(employeeId: string, year: number, month: number): Promise<{
    workingDays: number;
    totalSalary: number;
    days: SalaryListItemDto[];
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // 获取月份的最后一天

    const queryBuilder = this.salaryRepository.createQueryBuilder('salary')
      .where('salary.employeeId = :employeeId', { employeeId })
      .andWhere('salary.workDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('salary.workDate', 'ASC');

    const salaries = await queryBuilder.getMany();
    const workingDays = salaries.length;
    const totalSalary = salaries.reduce((sum, salary) => sum + parseFloat(salary.dailyWage.toString()), 0);
    const days = salaries.map(salary => this.toListItemDto(salary));

    return {
      workingDays,
      totalSalary: parseFloat(totalSalary.toFixed(2)),
      days,
    };
  }

  private buildWhereClause(
    queryBuilder: SelectQueryBuilder<Salary>,
    filters: {
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): void {
    const conditions: string[] = [];
    const parameters: any = {};

    // 日期范围过滤
    if (filters.dateFrom && filters.dateTo) {
      conditions.push('salary.workDate BETWEEN :dateFrom AND :dateTo');
      parameters.dateFrom = filters.dateFrom;
      parameters.dateTo = filters.dateTo;
    } else if (filters.dateFrom) {
      conditions.push('salary.workDate >= :dateFrom');
      parameters.dateFrom = filters.dateFrom;
    } else if (filters.dateTo) {
      conditions.push('salary.workDate <= :dateTo');
      parameters.dateTo = filters.dateTo;
    }

    // 应用条件
    if (conditions.length > 0) {
      queryBuilder.andWhere(conditions.join(' AND '), parameters);
    }
  }

  private toListItemDto(salary: Salary): SalaryListItemDto {
    return {
      id: salary.id,
      dailyWage: salary.dailyWage,
      workDate: salary.workDate,
      remark: salary.remark,
      createdAt: salary.createdAt,
    };
  }
}
