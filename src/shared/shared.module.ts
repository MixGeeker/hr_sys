import { Module, Global } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RefreshTokenGuard } from 'src/common/guards/jwt-refresh.guard';
import { ClsUserGuard } from 'src/common/guards/cls-user.guard';

@Global()
@Module({
  providers: [
    // 将 JwtAuthGuard 作为全局守卫（使用 APP_GUARD 提供）
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
      inject: [Reflector],
    },
    // 将 ClsUserGuard 作为全局守卫，确保在认证通过后把 user 写入 CLS
    {
      provide: APP_GUARD,
      useClass: ClsUserGuard,
    },
    // 另一个在控制器中可使用的守卫（非全局），按需导出
    RefreshTokenGuard,
  ],
  exports: [RefreshTokenGuard],
})
export class SharedModule {}
