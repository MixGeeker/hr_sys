// 在最顶部添加 dotenv 配置
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './main/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';

// 读取.env的port
const mainPort = Number(process.env.PORT) || 3000;
const daemonPort = Number(process.env.DAEMON_PORT) || mainPort + 1;

let app: INestApplication;

// 启动主应用
async function bootstrapMainApp() {
  app = await NestFactory.create(AppModule.register());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 全局守卫已通过 SharedModule 使用 APP_GUARD 提供，这里无需重复设置

  const config = new DocumentBuilder()
    .setTitle('UName ERP API')
    .setDescription('UName ERP API 文档')
    .setVersion('1.0')
    .addTag('erp')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '请输入你的 JWT Token',
        in: 'header',
      },
      // 'JWT', // <--- 我将注释掉这个自定义名称
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const server = app.getHttpAdapter().getInstance();
  server.get('/api-docs', (req: any, res: any) => {
    res.json(document);
  });
  SwaggerModule.setup('api-docs-ui', app, document);

  await app.listen(mainPort);
  Logger.log(`主应用已启动，监听端口 ${mainPort}`, 'Bootstrap');
  Logger.log(
    `API文档(UI)地址: http://localhost:${mainPort}/api-docs-ui`,
    'Bootstrap',
  );
  Logger.log(
    `API文档(JSON)地址: http://localhost:${mainPort}/api-docs`,
    'Bootstrap',
  );
}

async function stopServer() {
  if (app) {
    await app.close();
    Logger.log('主应用已停止', 'Bootstrap');
  }
}

async function startServer() {
  await bootstrapMainApp();
}

async function restartServer() {
  await stopServer();
  await startServer();
}

// 同时启动主应用和守护进程
bootstrapMainApp();

export { mainPort, daemonPort, startServer, stopServer, restartServer };
