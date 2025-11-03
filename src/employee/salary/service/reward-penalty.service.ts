import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { RewardPenalty, RewardPenaltyType } from '../entity/reward-penalty.entity';
import { Employee } from '../../core/entity/employee.entity';
import { 
  CreateRewardPenaltyDto, 
  UpdateRewardPenaltyDto, 
  QueryRewardPenaltyDto, 
  RewardPenaltyListItemDto, 
  RewardPenaltyListResponseDto, 
  RewardPenaltyStatsDto 
} from '../dto';

@Injectable()
export class RewardPenaltyService {
  constructor(
    @InjectRepository(RewardPenalty)
    private readonly rewardPenaltyRepository: Repository<RewardPenalty>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(employeeId: string, createRewardPenaltyDto: CreateRewardPenaltyDto): Promise<RewardPenalty> {
    // 检查职员是否存在
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`职员不存在: ${employeeId}`);
    }

    try {
      const rewardPenalty = this.rewardPenaltyRepository.create({
        ...createRewardPenaltyDto,
        employeeId,
      });
      return await this.rewardPenaltyRepository.save(rewardPenalty) as RewardPenalty;
    } catch (error) {
      throw new BadRequestException('创建奖罚记录失败: ' + error.message);
    }
  }

  async findAll(employeeId: string, queryDto: QueryRewardPenaltyDto): Promise<RewardPenaltyListResponseDto> {
    const { page = 1, limit = 10, type, dateFrom, dateTo, sortBy = 'date', sortOrder = 'DESC' } = queryDto;

    const queryBuilder = this.rewardPenaltyRepository.createQueryBuilder('rewardPenalty')
      .leftJoin('rewardPenalty.employee', 'employee')
      .where('rewardPenalty.employeeId = :employeeId', { employeeId });

    // 构建查询条件
    this.buildWhereClause(queryBuilder, { type, dateFrom, dateTo });

    // 构建排序
    queryBuilder.orderBy(`rewardPenalty.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // 分页
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // 执行查询
    const [rewardPenalties, total] = await queryBuilder.getManyAndCount();

    // 转换为响应格式
    const data = rewardPenalties.map(rewardPenalty => this.toListItemDto(rewardPenalty));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string, employeeId?: string): Promise<RewardPenalty> {
    const queryBuilder = this.rewardPenaltyRepository.createQueryBuilder('rewardPenalty')
      .leftJoin('rewardPenalty.employee', 'employee')
      .where('rewardPenalty.id = :id', { id });

    if (employeeId) {
      queryBuilder.andWhere('rewardPenalty.employeeId = :employeeId', { employeeId });
    }

    const rewardPenalty = await queryBuilder.getOne();
    if (!rewardPenalty) {
      throw new NotFoundException(`奖罚记录不存在: ${id}`);
    }
    return rewardPenalty;
  }

  async update(id: string, updateRewardPenaltyDto: UpdateRewardPenaltyDto, employeeId?: string): Promise<RewardPenalty> {
    const rewardPenalty = await this.findOne(id, employeeId);
    Object.assign(rewardPenalty, updateRewardPenaltyDto);
    return await this.rewardPenaltyRepository.save(rewardPenalty);
  }

  async remove(id: string, employeeId?: string): Promise<void> {
    const rewardPenalty = await this.findOne(id, employeeId);
    await this.rewardPenaltyRepository.remove(rewardPenalty);
  }

  async getStats(employeeId: string, dateFrom?: Date, dateTo?: Date): Promise<RewardPenaltyStatsDto> {
    const queryBuilder = this.rewardPenaltyRepository.createQueryBuilder('rewardPenalty')
      .where('rewardPenalty.employeeId = :employeeId', { employeeId });

    this.buildWhereClause(queryBuilder, { dateFrom, dateTo });

    // 奖励总金额
    const rewardResult = await queryBuilder.clone()
      .select('SUM(rewardPenalty.amount)', 'totalReward')
      .where('rewardPenalty.type = :type', { type: RewardPenaltyType.REWARD })
      .getRawOne();
    const totalReward = parseFloat(rewardResult?.totalReward || '0');

    // 处罚总金额
    const penaltyResult = await queryBuilder.clone()
      .select('SUM(rewardPenalty.amount)', 'totalPenalty')
      .where('rewardPenalty.type = :type', { type: RewardPenaltyType.PENALTY })
      .getRawOne();
    const totalPenalty = parseFloat(penaltyResult?.totalPenalty || '0');

    // 净奖励金额
    const netAmount = totalReward - totalPenalty;

    // 奖励记录数
    const rewardCount = await queryBuilder.clone()
      .where('rewardPenalty.type = :type', { type: RewardPenaltyType.REWARD })
      .getCount();

    // 处罚记录数
    const penaltyCount = await queryBuilder.clone()
      .where('rewardPenalty.type = :type', { type: RewardPenaltyType.PENALTY })
      .getCount();

    return {
      totalReward: parseFloat(totalReward.toFixed(2)),
      totalPenalty: parseFloat(totalPenalty.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      rewardCount,
      penaltyCount,
    };
  }

  async getMonthlyStats(employeeId: string, year: number, month: number): Promise<{
    totalReward: number;
    totalPenalty: number;
    netAmount: number;
    rewards: RewardPenaltyListItemDto[];
    penalties: RewardPenaltyListItemDto[];
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // 获取月份的最后一天

    const queryBuilder = this.rewardPenaltyRepository.createQueryBuilder('rewardPenalty')
      .where('rewardPenalty.employeeId = :employeeId', { employeeId })
      .andWhere('rewardPenalty.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('rewardPenalty.date', 'DESC');

    const allRecords = await queryBuilder.getMany();
    
    const rewards = allRecords
      .filter(record => record.type === RewardPenaltyType.REWARD)
      .map(record => this.toListItemDto(record));
    
    const penalties = allRecords
      .filter(record => record.type === RewardPenaltyType.PENALTY)
      .map(record => this.toListItemDto(record));

    const totalReward = rewards.reduce((sum, reward) => sum + parseFloat(reward.amount.toString()), 0);
    const totalPenalty = penalties.reduce((sum, penalty) => sum + parseFloat(penalty.amount.toString()), 0);
    const netAmount = totalReward - totalPenalty;

    return {
      totalReward: parseFloat(totalReward.toFixed(2)),
      totalPenalty: parseFloat(totalPenalty.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
      rewards,
      penalties,
    };
  }

  private buildWhereClause(
    queryBuilder: SelectQueryBuilder<RewardPenalty>,
    filters: {
      type?: RewardPenaltyType;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): void {
    const conditions: string[] = [];
    const parameters: any = {};

    // 类型过滤
    if (filters.type) {
      conditions.push('rewardPenalty.type = :type');
      parameters.type = filters.type;
    }

    // 日期范围过滤
    if (filters.dateFrom && filters.dateTo) {
      conditions.push('rewardPenalty.date BETWEEN :dateFrom AND :dateTo');
      parameters.dateFrom = filters.dateFrom;
      parameters.dateTo = filters.dateTo;
    } else if (filters.dateFrom) {
      conditions.push('rewardPenalty.date >= :dateFrom');
      parameters.dateFrom = filters.dateFrom;
    } else if (filters.dateTo) {
      conditions.push('rewardPenalty.date <= :dateTo');
      parameters.dateTo = filters.dateTo;
    }

    // 应用条件
    if (conditions.length > 0) {
      queryBuilder.andWhere(conditions.join(' AND '), parameters);
    }
  }

  private toListItemDto(rewardPenalty: RewardPenalty): RewardPenaltyListItemDto {
    return {
      id: rewardPenalty.id,
      type: rewardPenalty.type,
      amount: rewardPenalty.amount,
      reason: rewardPenalty.reason,
      date: rewardPenalty.date,
      remark: rewardPenalty.remark,
      createdAt: rewardPenalty.createdAt,
    };
  }
}
