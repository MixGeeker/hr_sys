import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { QueryUserResponseDto } from '../dto/query-user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      return this.userRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('通过ID查找用户时出错');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return this.userRepository.find({});
    } catch (error) {
      throw new InternalServerErrorException('查找所有用户时出错');
    }
  }

  /**
   * 分页查询用户列表（支持多维度筛选）
   * @param query 查询参数
   * @returns 用户列表和分页信息
   */
  async findAllUsers(query: QueryUserDto): Promise<QueryUserResponseDto> {
    const { page = 1, limit = 10, username, nickname, email, status } = query;

    const where: FindManyOptions<User>['where'] = {};

    // 用户名模糊搜索
    if (username) {
      where.username = ILike(`%${username}%`);
    }

    // 昵称模糊搜索
    if (nickname) {
      where.nickname = ILike(`%${nickname}%`);
    }

    // 邮箱模糊搜索
    if (email) {
      where.email = ILike(`%${email}%`);
    }

    // 状态精确筛选
    if (status !== undefined) {
      where.status = status;
    }

    try {
      const [users, total] = await this.userRepository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        success: true,
        data: users,
        meta: {
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('分页查询用户时出错');
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return this.userRepository.findOne({
        where: { username },
      });
    } catch (error) {
      throw new InternalServerErrorException('通过用户名查找用户时出错');
    }
  }

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    try {
      const newUser = this.userRepository.create(registerUserDto);
      return this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('创建用户时出错');
    }
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateUserDto 更新用户的数据传输对象
   * @returns 更新后的用户实体
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`未找到ID为 ${id} 的用户`);
    }

    // 更新除密码和角色外的其他字段
    const { password, ...otherFields } = updateUserDto;
    Object.assign(user, otherFields);

    // 如果提供了新密码，则进行哈希处理
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    try {
      await this.userRepository.save(user);
      return this.findById(id) as Promise<User>;
    } catch (error) {
      throw new InternalServerErrorException('更新用户信息时出错');
    }
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除后的用户实体
   */
  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`未找到ID为 ${id} 的用户`);
    }
    await this.userRepository.remove(user);
  }
}
