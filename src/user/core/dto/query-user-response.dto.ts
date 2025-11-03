import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from 'src/common/dto/pagination.dto';
import { User } from '../entity/user.entity';

/**
 * 用户查询响应DTO
 * 包含用户列表和分页信息
 */
export class QueryUserResponseDto extends PaginationResponseDto<User> {
  @ApiProperty({
    description: '用户列表',
    type: [User],
  })
  declare data: User[];
}
