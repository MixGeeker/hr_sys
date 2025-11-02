import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true, // 关键：允许过期的Token
      secretOrKey: process.env.JWT_SECRET || 'your-very-secret-key',
    });
  }

  async validate(payload: { userId: number; username: string }) {
    const user = await this.userService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('无效的Token');
    }
    return user;
  }
}
