# 区块链支付 API 文档

## 基础信息

- **基础URL**: `https://api.tmmk.cc/seafogai`
- **认证方式**: 请求头携带 JWT Token
  ```
  Authorization: Bearer <token>
  ```
- **响应格式**: JSON

## API 接口

### 1. 用户认证

#### 1.1 发送登录验证码

- **路径**: `/auth/send-code`
- **方法**: `POST`
- **描述**: 发送邮箱验证码
- **请求体**:
  ```json
  {
      "email": "user@example.com"
  }
  ```
- **响应**:
  ```json
  {
      "code": 0,
      "message": "success"
  }
  ```

#### 1.2 验证码登录

- **路径**: `/auth/login`
- **方法**: `POST`
- **描述**: 使用邮箱验证码登录，首次登录自动注册
- **请求体**:
  ```json
  {
      "email": "user@example.com",
      "code": "123456"
  }
  ```
- **响应**:
  ```json
  {
      "code": 0,
      "message": "success",
      "data": {
          "user_id": "uuid",
          "email": "user@example.com",
          "token": "jwt_token"
      }
  }
  ```

### 2. 钱包功能

#### 2.1 获取钱包信息

- **路径**: `/wallet/info`
- **方法**: `GET`
- **描述**: 获取当前用户的钱包地址和余额信息
- **响应**:
  ```json
  {
      "code": 0,
      "message": "success",
      "data": {
          "wallet_address": "0x...",
          "balances": [
              {
                  "token": "ETH",
                  "balance": "1.234",
                  "usd_value": "2345.67"
              },
              {
                  "token": "USDT",
                  "balance": "100.00",
                  "usd_value": "100.00"
              }
          ]
      }
  }
  ```

#### 2.2 转账

- **路径**: `/wallet/transfer`
- **方法**: `POST`
- **描述**: 发起转账交易
- **请求体**:
  ```json
  {
      "to_address": "0x...",
      "token": "ETH",
      "amount": "0.1",
      "memo": "支付订单 #123"
  }
  ```
- **响应**:
  ```json
  {
      "code": 0,
      "message": "success",
      "data": {
          "tx_hash": "0x...",
          "status": "pending",
          "estimated_fee": "0.001 ETH"
      }
  }
  ```

#### 2.3 获取交易记录

- **路径**: `/wallet/transactions`
- **方法**: `GET`
- **描述**: 获取交易历史记录
- **查询参数**:
  | 参数 | 类型 | 说明 | 默认值 |
  |------|------|------|--------|
  | page | int | 页码 | 1 |
  | limit | int | 每页条数 | 20 |
  | token | string | 代币类型（可选） | - |

- **响应**:
  ```json
  {
      "code": 0,
      "message": "success",
      "data": {
          "total": 100,
          "transactions": [
              {
                  "tx_hash": "0x...",
                  "type": "send/receive",
                  "token": "ETH",
                  "amount": "0.1",
                  "from": "0x...",
                  "to": "0x...",
                  "status": "confirmed",
                  "timestamp": "2024-03-20T12:00:00Z",
                  "memo": "支付订单 #123"
              }
          ]
      }
  }
  ```

### 3. 支付功能

#### 3.1 创建支付订单

- **路径**: `/payment/create-order`
- **方法**: `POST`
- **描述**: 创建一个新的支付订单，用于购买 Discord 会员资格。
- **请求体**:
  ```json
  {
      "membership_type": "string",    // 会员类型，例如 "basic", "premium"
      "duration_months": 1            // 购买的月份数
  }
  ```
- **响应**:
  ```json
  {
      "code": 0,
      "message": "Order created successfully",
      "data": {
          "currency": "string",        // 所需的货币类型，例如 "ETH", "USDT"
          "amount": "string"           // 需要支付的金额
      }
  }
  ```

#### 3.2 支付订单

- **路径**: `/payment/pay`
- **方法**: `POST`
- **描述**: 支付指定的订单金额。
- **请求体**:
  ```json
  {
      "currency": "string",           // 货币类型，例如 "ETH", "USDT"
      "amount": "string"              // 支付金额
  }
  ```
- **响应**:
  ```json
  {
      "code": 0,
      "message": "Payment successful",
      "data": {
          "transaction_id": "uuid",    // 交易的唯一标识符
          "status": "completed"        // 交易状态
      }
  }
  ```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 余额不足 |
| 2001 | 认证失败 |
| 2002 | 权限不足 |
| 3001 | 系统错误 |
| 3002 | 区块链网络错误 |

## 注意事项

1. **数值处理**: 所有金额相关的字段都使用字符串类型，避免浮点数精度问题
2. **交易状态**:
   - `pending`: 待确认
   - `confirmed`: 已确认
   - `failed`: 失败
3. **时间格式**: 所有时间戳使用 ISO 8601 格式
4. **安全建议**: 关键操作建议增加二次验证机制