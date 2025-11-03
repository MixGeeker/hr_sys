import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from 'src/database/database.module';
import * as fs from 'fs';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ClsModule } from 'nestjs-cls';
import { Request } from 'express';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { UploadModule } from 'src/upload/upload.module';
import { CurrencyModule } from 'src/currency/currency.module';
import { SharedModule } from 'src/shared/shared.module';
import { LogModule } from 'src/log/log.module';
import { EmployeeModule } from 'src/employee/employee.module';

@Module({})
export class AppModule {
  static register(): DynamicModule {
    const businessModules = [
      AuthModule,
      UserModule,
      UploadModule,
      CurrencyModule,
      LogModule,
      EmployeeModule, // 添加EmployeeModule
    ];

    const imports = [
      SharedModule,
      ConfigModule.forRoot({ isGlobal: true }),
      ClsModule.forRoot({
        global: true,
        middleware: {
          // 自动挂载一个中间件
          mount: true,
          // 在中间件内部，上下文创建后，执行这个初始化函数
          setup: (cls, req: Request) => {
            cls.set('user', req.user);
          },
        },
      }),
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', '..', 'uploads', 'files'),
        serveRoot: '/files',
      }),
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', '..', 'uploads', 'images'),
        serveRoot: '/images',
      }),
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', '..', 'uploads'),
        serveRoot: '/uploads',
      }),
      DatabaseModule,
    ];

    // if (isInitialized) {
    //   imports.push(...businessModules);
    // }

    imports.push(...businessModules);

    return {
      module: AppModule,
      imports,
      controllers: [AppController],
      providers: [AppService],
    };
  }
}
