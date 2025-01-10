import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { WalletInfoResponse, TransferFundsDto, CreatePaymentOrderDto, PayOrderDto } from './wallet.types';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';

@ApiTags('钱包')
@ApiBearerAuth()
@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('info')
  @ApiOperation({ summary: '获取钱包信息' })
  @ApiResponse({ status: 200, type: WalletInfoResponse })
  async getWalletInfo(@User() userId: string): Promise<WalletInfoResponse> {
    try {
      const data = await this.walletService.getWalletInfo(userId);
      return {
        code: 0,
        message: 'success',
        data
      };
    } catch (error) {
      return {
        code: 3001,
        message: error.message,
        data: null
      };
    }
  }

  @Post('transfer')
  @ApiOperation({ summary: '发起转账交易' })
  @ApiResponse({ status: 200, description: '转账成功' })
  async transfer(@User() userId: string, @Body() body: TransferFundsDto) {
    const { to_address, token, amount, memo } = body;
    const result = await this.walletService.transferFunds(userId, to_address, token, amount, memo);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: '获取交易历史记录' })
  @ApiResponse({ status: 200, description: '成功获取交易记录' })
  async getTransactions(
    @User() userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('token') token?: string
  ) {
    const result = await this.walletService.getTransactions(userId, page, limit, token);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Post('create-order')
  @ApiOperation({ summary: '创建支付订单，用于购买 Discord 会员资格' })
  @ApiResponse({ status: 200, description: '成功创建支付订单' })
  async createOrder(
    @Body() body: CreatePaymentOrderDto
  ) {
    const { membership_type, duration_months } = body;
    const result = await this.walletService.createPaymentOrder(membership_type, duration_months);
    return {
      code: 0,
      message: 'Order created successfully',
      data: result,
    };
  }

  @Post('pay')
  @ApiOperation({ summary: '支付订单，用于购买 Discord 会员资格' })
  @ApiResponse({ status: 200, description: '支付成功' })
  async payOrder(
    @User() userId: string,
    @Body() body: PayOrderDto
  ) {
    const { currency, amount } = body;
    const result = await this.walletService.payOrder(userId, currency, amount);
    return {
      code: 0,
      message: 'Payment for Discord membership successful',
      data: result,
    };
  }
} 