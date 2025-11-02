import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        // console.log(
        //   '[JwtModule] Secret used for signing:',
        //   process.env.JWT_SECRET || 'your-very-secret-key',
        // );
        return {
          secret: process.env.JWT_SECRET || 'your-very-secret-key', // 强烈建议使用环境变量
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d', // Token 过期时间
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
