import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { ConfigService } from '@nestjs/config';

/**
 * 应用启动后的用户初始化器。
 *
 * 负责在系统首次启动且尚无任何用户时：
 * 1. 创建"超级管理员"角色，并自动授予系统内全部权限；
 * 2. 创建默认超级管理员账号并绑定该角色。
 */
@Injectable()
export class UserInitializer implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  /**
   * 应用启动完成后执行初始化逻辑。
   * - 若数据库中已存在任意用户，则不做任何处理；
   * - 若不存在用户，则自动创建超级管理员账号。
   */
  async onApplicationBootstrap(): Promise<void> {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      this.logger.log(
        '[User Init] 已检测到用户，无需初始化超级账号。',
        'UserInitializer',
      );
      return;
    }

    await this.createSuperAdminIfNeeded();
  }

  /**
   * 创建超级管理员角色并自动创建默认超级管理员账号。
   */
  private async createSuperAdminIfNeeded(): Promise<void> {
    const defaultUsername =
      this.configService.get<string>('SUPER_ADMIN_USERNAME') || 'admin';
    const defaultPassword =
      this.configService.get<string>('SUPER_ADMIN_PASSWORD') || 'admin123';

    // 创建默认超级管理员账号
    const adminUser = this.userRepository.create({
      username: defaultUsername,
      password: defaultPassword,
      nickname: '超级管理员',
      status: 1,
    });
    await this.userRepository.save(adminUser);

    this.logger.log(
      `[User Init] 已创建默认超级管理员账号：${defaultUsername}`,
      'UserInitializer',
    );
  }
}
