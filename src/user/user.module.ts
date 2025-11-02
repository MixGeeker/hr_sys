import { Logger, Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserInitializer } from './user.initializer';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserInitializer, Logger],
  exports: [UserService, TypeOrmModule.forFeature([User])],
})
export class UserModule {}
