import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, SelectQueryBuilder } from 'typeorm';
import { Employee } from '../entity/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto, EmployeeListItemDto, EmployeeListResponseDto } from '../dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      const employee = this.employeeRepository.create(createEmployeeDto);
      return await this.employeeRepository.save(employee) as Employee;
    } catch (error) {
      throw new BadRequestException('创建职员失败: ' + error.message);
    }
  }

  async findAll(queryDto: QueryEmployeeDto): Promise<EmployeeListResponseDto> {
    const { page = 1, limit = 10, search, status, position, hireDateFrom, hireDateTo, sortBy = 'createdAt', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.employeeRepository.createQueryBuilder('employee');

    // 构建查询条件
    this.buildWhereClause(queryBuilder, { search, status, position, hireDateFrom, hireDateTo });

    // 构建排序
    queryBuilder.orderBy(`employee.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // 执行查询
    const [employees, total] = await queryBuilder.getManyAndCount();

    // 转换为响应格式
    const data = employees.map(employee => this.toListItemDto(employee));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`职员不存在: ${id}`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return await this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }

  async getEmployeeStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const total = await this.employeeRepository.count();
    const active = await this.employeeRepository.count({ where: { status: 'active' as any } });
    const inactive = await this.employeeRepository.count({ where: { status: 'inactive' as any } });

    return { total, active, inactive };
  }

  private buildWhereClause(
    queryBuilder: SelectQueryBuilder<Employee>,
    filters: {
      search?: string;
      status?: any;
      position?: string;
      hireDateFrom?: Date;
      hireDateTo?: Date;
    }
  ): void {
    const conditions: string[] = [];
    const parameters: any = {};

    // 搜索条件
    if (filters.search) {
      conditions.push(
        '(employee.name ILIKE :search OR employee.phone ILIKE :search OR employee.email ILIKE :search OR employee.position ILIKE :search)'
      );
      parameters.search = `%${filters.search}%`;
    }

    // 状态过滤
    if (filters.status) {
      conditions.push('employee.status = :status');
      parameters.status = filters.status;
    }

    // 职位过滤
    if (filters.position) {
      conditions.push('employee.position ILIKE :position');
      parameters.position = `%${filters.position}%`;
    }

    // 入职日期范围过滤
    if (filters.hireDateFrom && filters.hireDateTo) {
      conditions.push('employee.hireDate BETWEEN :hireDateFrom AND :hireDateTo');
      parameters.hireDateFrom = filters.hireDateFrom;
      parameters.hireDateTo = filters.hireDateTo;
    } else if (filters.hireDateFrom) {
      conditions.push('employee.hireDate >= :hireDateFrom');
      parameters.hireDateFrom = filters.hireDateFrom;
    } else if (filters.hireDateTo) {
      conditions.push('employee.hireDate <= :hireDateTo');
      parameters.hireDateTo = filters.hireDateTo;
    }

    // 应用条件
    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), parameters);
    }
  }

  private toListItemDto(employee: Employee): EmployeeListItemDto {
    return {
      id: employee.id,
      name: employee.name,
      gender: employee.gender,
      phone: employee.phone,
      email: employee.email,
      position: employee.position,
      hireDate: employee.hireDate,
      status: employee.status,
      createdAt: employee.createdAt,
    };
  }
}
