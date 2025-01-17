import { ApiProperty } from '@nestjs/swagger';

export class Balance {
  @ApiProperty({
    description: '代币符号，包括 "ETH", "USDT"',
    example: 'ETH'
  })
  token: string;

  @ApiProperty({
    description: '用户的余额，使用字符串表示以避免浮点数精度问题',
    example: '100.00'
  })
  balance: string;

  @ApiProperty({
    description: '该代币的美元价值，使用字符串表示以避免浮点数精度问题',
    example: '300000.00'
  })
  usd_value: string;
}

export class WalletInfoData {
  @ApiProperty({
    description: '用户的钱包地址',
    example: '0x1234567890abcdef1234567890abcdef12345678'
  })
  wallet_address: string;

  @ApiProperty({
    description: '用户的余额列表',
    type: [Balance]
  })
  balances: Balance[];
}

export class WalletInfoResponse {
  @ApiProperty({
    description: '状态码，0表示成功',
    example: 0
  })
  code: number;

  @ApiProperty({
    description: '返回信息，通常为 "success" 或错误信息',
    example: 'success'
  })
  message: string;

  @ApiProperty({
    description: '返回的数据，包含钱包信息',
    type: WalletInfoData
  })
  data: WalletInfoData;
}

// 添加货币类型枚举
export enum TokenType {
  ETH = 'ETH',
  USDT = 'USDT'
}

// 修改 TransferFundsDto
export class TransferFundsDto {
  @ApiProperty({
    description: '接收方钱包地址，必须是有效的以太坊地址',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  to_address: string;

  @ApiProperty({
    description: '代币类型',
    enum: TokenType,
    example: TokenType.ETH
  })
  token: TokenType;

  @ApiProperty({
    description: '转账金额，使用字符串表示以避免浮点数精度问题',
    example: '0.1',
  })
  amount: string;

  @ApiProperty({
    description: '备注信息，用户可以提供额外信息，例如支付目的',
    example: '支付订单 #123',
    required: false,
  })
  memo?: string;
}

// 添加枚举定义
export enum MembershipType {
  BASIC = 'basic',
  PREMIUM = 'premium'
}

// 修改 CreatePaymentOrderDto
export class CreatePaymentOrderDto {
  @ApiProperty({
    description: '会员类型',
    enum: MembershipType,
    example: MembershipType.BASIC
  })
  membership_type: MembershipType;

  @ApiProperty({
    description: '购买的月份数',
    example: 1
  })
  duration_months: number;
}

// 修改 PayOrderDto
export class PayOrderDto {
  @ApiProperty({
    description: '货币类型',
    enum: TokenType,
    example: TokenType.USDT
  })
  currency: TokenType;

  @ApiProperty({
    description: '支付金额',
    example: '20.00'
  })
  amount: string;
}