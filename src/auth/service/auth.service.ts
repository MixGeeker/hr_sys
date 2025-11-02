import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/service/user.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { User } from 'src/user/entity/user.entity';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (user && (await user.comparePassword(pass))) {
      return user;
    }
    return null;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { username: user.username, userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async refreshToken(user: User): Promise<{ access_token: string }> {
    const payload = { username: user.username, userId: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const existingUser = await this.userService.findByUsername(
      registerUserDto.username,
    );

    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    return this.userService.create(registerUserDto);
  }
}
