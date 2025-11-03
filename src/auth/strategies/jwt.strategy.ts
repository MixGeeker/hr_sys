import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/core/service/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    const secret = process.env.JWT_SECRET || 'your-very-secret-key';
    // console.log('[JwtStrategy] Secret used for verification:', secret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { userId: number; username: string }) {
    const user = await this.userService.findByUsername(payload.username);
    if (!user) {
      throw new UnauthorizedException('无效的Token');
    }
    // Passport 会将这个返回值附加到 Request 对象上，通常是 req.user
    return user;
  }
}
