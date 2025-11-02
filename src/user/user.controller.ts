import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { QueryUserResponseDto } from './dto/query-user-response.dto';

@ApiTags('User')
@ApiBearerAuth() // 标记这个 Controller 下的所有接口都需要 Bearer Token
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '分页获取用户列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取用户列表',
    type: QueryUserResponseDto,
  })
  async findAllUsers(
    @Query() query: QueryUserDto,
  ): Promise<QueryUserResponseDto> {
    return this.userService.findAllUsers(query);
  }

  @Post('profile')
  @ApiOperation({ summary: '创建用户' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: '创建后的用户信息',
    type: User,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiResponse({
    status: 200,
    description: '用户信息',
    type: User,
  })
  async getProfile(@Request() req): Promise<User> {
    // req.user 是由 JwtAuthGuard 附加的
    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  @Get('profile/all')
  @ApiOperation({ summary: '获取所有用户信息' })
  @ApiResponse({
    status: 200,
    description: '用户信息列表',
    type: [User],
  })
  async getAllUsers(): Promise<User[]> {
    const users = await this.userService.findAll();
    if (!users) {
      throw new NotFoundException('用户不存在');
    }
    return users;
  }

  @Get('profile/:id')
  @ApiOperation({ summary: '获取指定用户信息' })
  @ApiParam({
    name: 'id',
    description: '用户ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '用户信息',
    type: User,
  })
  async getProfileById(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  @Patch('profile/:id')
  @ApiOperation({ summary: '更新指定用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: '更新后的用户信息',
    type: User,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userService.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  @Delete('profile/:id')
  @ApiOperation({ summary: '删除指定用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '删除后的用户信息',
    type: User,
  })
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.delete(id);
  }
}
