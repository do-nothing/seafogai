import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { WalletInfoResponse, TransferFundsDto, CreatePaymentOrderDto, PayOrderDto, MembershipType, TokenType } from './wallet.types';

@ApiTags('钱包')
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('info')
  @ApiOperation({ summary: '获取钱包余额信息' })
  @ApiResponse({ status: 200, type: WalletInfoResponse })
  async getWalletInfo(
    @Query('accessToken') accessToken: string
  ): Promise<WalletInfoResponse> {
    try {
      let userId: string;
      if (accessToken) {
        userId = await this.walletService.verifyAccessToken(accessToken);
      } else {
        return {
          code: 3002,
          message: 'Access token is required',
          data: null
        };
      }

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
  async transfer(
    @Query('accessToken') accessToken: string,
    @Body() body: TransferFundsDto
  ) {
    try {
      let userId: string;
      if (accessToken) {
        userId = await this.walletService.verifyAccessToken(accessToken);
      } else {
        return {
          code: 3002,
          message: 'Access token is required',
          data: null
        };
      }

      const { to_address, token, amount, memo } = body;
      const result = await this.walletService.transferFunds(userId, to_address, token, amount, memo);
      return {
        code: 0,
        message: 'success',
        data: result,
      };
    } catch (error) {
      return {
        code: 3001,
        message: error.message,
        data: null
      };
    }
  }

  @Get('transactions')
  @ApiOperation({ summary: '获取交易历史记录' })
  @ApiResponse({ status: 200, description: '成功获取交易记录' })
  @ApiQuery({ name: 'accessToken', required: true })
  @ApiQuery({ 
    name: 'token', 
    required: false,
    enum: TokenType,
    description: '代币类型: ETH 或 USDT'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    type: Number,
    description: '页码，默认为1'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: '每页条数，默认为20'
  })
  async getTransactions(
    @Query('accessToken') accessToken: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('token') token?: TokenType
  ) {
    try {
      let userId: string;
      if (accessToken) {
        userId = await this.walletService.verifyAccessToken(accessToken);
      } else {
        return {
          code: 3002,
          message: 'Access token is required',
          data: null
        };
      }

      const result = await this.walletService.getTransactions(userId, page, limit, token);
      return {
        code: 0,
        message: 'success',
        data: result,
      };
    } catch (error) {
      return {
        code: 3001,
        message: error.message,
        data: null
      };
    }
  }

  @Post('create-order')
  @ApiOperation({ summary: '创建支付订单，用于购买 Discord 会员资格' })
  @ApiResponse({ status: 200, description: '成功创建支付订单' })
  @ApiQuery({ name: 'accessToken', required: true })
  @ApiQuery({ 
    name: 'membership_type', 
    required: true,
    enum: MembershipType,
    description: '会员类型: basic 或 premium'
  })
  @ApiQuery({ 
    name: 'duration_months', 
    required: true, 
    type: Number,
    description: '购买的月份数'
  })
  async createOrder(
    @Query('accessToken') accessToken: string,
    @Query('membership_type') membership_type: MembershipType,
    @Query('duration_months') duration_months: number
  ) {
    try {
      let userId: string;
      if (accessToken) {
        userId = await this.walletService.verifyAccessToken(accessToken);
      } else {
        return {
          code: 3002,
          message: 'Access token is required',
          data: null
        };
      }

      const result = await this.walletService.createPaymentOrder(membership_type, duration_months);
      return {
        code: 0,
        message: 'Order created successfully',
        data: result,
      };
    } catch (error) {
      return {
        code: 3001,
        message: error.message,
        data: null
      };
    }
  }

  @Post('pay')
  @ApiOperation({ summary: '支付订单，用于购买 Discord 会员资格' })
  @ApiResponse({ status: 200, description: '支付成功' })
  async payOrder(
    @Query('accessToken') accessToken: string,
    @Body() body: PayOrderDto
  ) {
    try {
      let userId: string;
      if (accessToken) {
        userId = await this.walletService.verifyAccessToken(accessToken);
      } else {
        return {
          code: 3002,
          message: 'Access token is required',
          data: null
        };
      }

      const { currency, amount } = body;
      const result = await this.walletService.payOrder(userId, currency, amount);
      return {
        code: 0,
        message: 'Payment for Discord membership successful',
        data: result,
      };
    } catch (error) {
      return {
        code: 3001,
        message: error.message,
        data: null
      };
    }
  }
} 