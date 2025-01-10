import { Controller, Post, Body, Injectable, forwardRef, Inject } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { LoginDto, SendCodeDto, LoginResponse, SendCodeResponse } from './auth.types';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Injectable()
@ApiTags('认证')
@Controller('auth')
export class AuthController {
  private supabase;

  constructor(
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_KEY')
    );
  }

  @Post('send-code')
  @ApiOperation({ summary: '发送登录验证码' })
  @ApiResponse({ status: 200, type: SendCodeResponse })
  async sendCode(@Body() body: SendCodeDto): Promise<SendCodeResponse> {
    const { error } = await this.supabase.auth.signInWithOtp({
      email: body.email,
      options: {
        shouldCreateUser: true,
        data: {
          email_confirm: true
        }
      }
    });

    return error
      ? { code: 2001, message: error.message }
      : { code: 0, message: 'success' };
  }

  @Post('login')
  @ApiOperation({ summary: '验证码登录' })
  @ApiResponse({ status: 200, type: LoginResponse })
  async login(@Body() body: LoginDto): Promise<LoginResponse> {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email: body.email,
      token: body.code,
      type: 'email'
    });

    if (error || !data.user || !data.session) {
      return { code: 2001, message: 'Invalid login response' };
    }

    return {
      code: 0,
      message: 'success',
      data: {
        user_id: data.user.id,
        email: data.user.email || '',
        token: data.session.access_token
      }
    };
  }
} 