import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiResponse({
    status: 200,
    description: '获取Hello',
    schema: {
      type: 'string',
      example: 'Hello World',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
