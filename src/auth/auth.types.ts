import { ApiProperty } from '@nestjs/swagger';

export class SendCodeDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com'
  })
  email: string;
}

export class LoginDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '验证码',
    example: '123456'
  })
  code: string;
}

export class LoginResponseData {
  @ApiProperty({
    description: '用户ID',
    example: 'uuid'
  })
  user_id: string;

  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: '访问令牌',
    example: 'jwt_token'
  })
  token: string;
}

export class LoginResponse {
  @ApiProperty({
    description: '状态码',
    example: 0
  })
  code: number;

  @ApiProperty({
    description: '返回信息',
    example: 'success'
  })
  message: string;

  @ApiProperty({
    description: '返回数据',
    required: false,
    type: LoginResponseData
  })
  data?: LoginResponseData;
}

export class SendCodeResponse {
  @ApiProperty({
    description: '状态码',
    example: 0
  })
  code: number;

  @ApiProperty({
    description: '返回信息',
    example: 'success'
  })
  message: string;
} 