import { Logger, Module } from '@nestjs/common';
import { UserService } from './core/service/user.service';
import { UserController } from './core/controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './core/entity/user.entity';
import { UserInitializer } from './user.initializer';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserInitializer, Logger],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
