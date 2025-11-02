import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

export class CreateExchangeRateDto {
  @ApiProperty({
    description: '源货币代码',
    example: 'USD',
  })
  @IsString({ message: '源货币代码必须是字符串' })
  @Length(3, 16, { message: '源货币代码长度必须在3-16个字符之间' })
  @IsNotEmpty({ message: '源货币代码不能为空' })
  fromCurrencyCode: string;

  @ApiProperty({
    description: '目标货币代码',
    example: 'VES',
  })
  @IsString({ message: '目标货币代码必须是字符串' })
  @Length(3, 16, { message: '目标货币代码长度必须在3-16个字符之间' })
  @IsNotEmpty({ message: '目标货币代码不能为空' })
  toCurrencyCode: string;

  @ApiProperty({
    description: '汇率（1源货币兑换多少目标货币）',
    example: '7.25000000',
  })
  @IsNumberString({}, { message: '汇率必须为数字字符串' })
  @IsNotEmpty({ message: '汇率不能为空' })
  rate: string;
}
