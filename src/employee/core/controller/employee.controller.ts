import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EmployeeService } from '../service/employee.service';
import { Employee } from '../entity/employee.entity';
import { 
  CreateEmployeeDto, 
  UpdateEmployeeDto, 
  QueryEmployeeDto, 
  EmployeeListItemDto, 
  EmployeeListResponseDto 
} from '../dto';

@ApiTags('职员管理')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: '创建职员' })
  @ApiResponse({ status: 201, description: '创建成功', type: Employee })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return await this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: '获取职员列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页大小' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'status', required: false, description: '职员状态' })
  @ApiQuery({ name: 'position', required: false, description: '职位' })
  @ApiQuery({ name: 'hireDateFrom', required: false, description: '入职起始日期' })
  @ApiQuery({ name: 'hireDateTo', required: false, description: '入职结束日期' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向' })
  @ApiResponse({ status: 200, description: '获取成功', type: EmployeeListResponseDto })
  async findAll(@Query() queryDto: QueryEmployeeDto): Promise<EmployeeListResponseDto> {
    return await this.employeeService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取职员统计信息' })
  @ApiResponse({ 
    status: 200, 
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: '总人数' },
        active: { type: 'number', description: '在职人数' },
        inactive: { type: 'number', description: '离职人数' },
      },
    },
  })
  async getStats() {
    return await this.employeeService.getEmployeeStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取职员详情' })
  @ApiParam({ name: 'id', description: '职员ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Employee })
  @ApiResponse({ status: 404, description: '职员不存在' })
  async findOne(@Param('id') id: string): Promise<Employee> {
    return await this.employeeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新职员信息' })
  @ApiParam({ name: 'id', description: '职员ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: Employee })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '职员不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    return await this.employeeService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除职员' })
  @ApiParam({ name: 'id', description: '职员ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '职员不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return await this.employeeService.remove(id);
  }
}
