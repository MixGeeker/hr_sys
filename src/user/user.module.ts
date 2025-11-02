import { Logger, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserInitializer } from './user.initializer';
import { Setting } from 'src/setting/entity/setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Setting])],
  controllers: [UserController],
  providers: [UserService, UserInitializer, Logger],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
