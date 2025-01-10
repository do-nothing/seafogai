import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WalletService {
    constructor(private supabaseService: SupabaseService) {}

    async getWalletInfo(userId: string) {
        const { data: wallet, error: walletError } = await this.supabaseService
            .getClient()
            .from('wallets')
            .select('id, address')
            .eq('user_id', userId)
            .single();

        if (walletError) throw walletError;

        const { data: balances, error: balanceError } = await this.supabaseService
            .getClient()
            .from('balances')
            .select('token, balance, usd_value')
            .eq('wallet_id', wallet.id);

        if (balanceError) throw balanceError;

        return {
            wallet_address: wallet.address,
            balances,
        };
    }

    async transferFunds(userId: string, toAddress: string, token: string, amount: string, memo: string) {
        // 检查用户的余额
        const { data: wallet, error: walletError } = await this.supabaseService
            .getClient()
            .from('wallets')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (walletError || !wallet) {
            throw new Error('Wallet not found');
        }

        const { data: balanceData, error: balanceError } = await this.supabaseService
            .getClient()
            .from('balances')
            .select('balance')
            .eq('wallet_id', wallet.id)
            .eq('token', token)
            .single();

        if (balanceError || !balanceData) {
            throw new Error('Balance not found');
        }

        const currentBalance = parseFloat(balanceData.balance);
        const transferAmount = parseFloat(amount);

        if (currentBalance < transferAmount) {
            throw new Error('Insufficient balance');
        }

        // 扣除发送方余额
        await this.supabaseService
            .getClient()
            .from('balances')
            .update({ balance: (currentBalance - transferAmount).toString() })
            .eq('wallet_id', wallet.id)
            .eq('token', token);

        // 更新收款方余额
        const { data: recipientWallet, error: recipientWalletError } = await this.supabaseService
            .getClient()
            .from('wallets')
            .select('id')
            .eq('address', toAddress) // 假设收款人通过地址查找钱包
            .single();

        let recipientFound = true; // 标记收款方是否找到

        if (recipientWalletError || !recipientWallet) {
            // 如果找不到收款方，设置标记为 false
            console.warn(`Recipient wallet not found for address: ${toAddress}`);
            recipientFound = false;
        }

        // 记录转账交易
        const { error: transactionError } = await this.supabaseService
            .getClient()
            .from('transactions')
            .insert({
                sender_id: wallet.id,
                recipient_address: toAddress,
                token: token,
                amount: amount,
                memo: memo,
                status: recipientFound ? 'completed' : 'pending', // 如果找不到收款方，状态为 pending
            });

        if (transactionError) {
            throw new Error('Transaction record failed');
        }

        // 如果找到收款方，增加收款方余额
        if (recipientFound) {
            const { data: recipientBalanceData, error: recipientBalanceError } = await this.supabaseService
                .getClient()
                .from('balances')
                .select('balance')
                .eq('wallet_id', recipientWallet.id)
                .eq('token', token)
                .single();

            if (recipientBalanceError || !recipientBalanceData) {
                console.warn(`Recipient balance not found for wallet ID: ${recipientWallet.id}`);
                return {
                    tx_hash: 'mock_tx_hash', // 这里可以替换为实际的交易哈希
                    status: 'pending',
                    estimated_fee: '0.001 ETH', // 这里可以根据实际情况计算费用
                };
            }

            const recipientCurrentBalance = parseFloat(recipientBalanceData.balance);

            // 增加收款方余额
            await this.supabaseService
                .getClient()
                .from('balances')
                .update({ balance: (recipientCurrentBalance + transferAmount).toString() })
                .eq('wallet_id', recipientWallet.id)
                .eq('token', token);
        }

        return {
            tx_hash: 'mock_tx_hash', // 这里可以替换为实际的交易哈希
            status: 'completed', // 如果交易记录成功，状态为 completed
            estimated_fee: '0.001 ETH', // 这里可以根据实际情况计算费用
        };
    }

    async getTransactions(userId: string, page: number = 1, limit: number = 20, token?: string) {
        // 获取用户的钱包
        const { data: wallet, error: walletError } = await this.supabaseService
            .getClient()
            .from('wallets')
            .select('id, address')
            .eq('user_id', userId)
            .single();

        if (walletError || !wallet) {
            throw new Error('Wallet not found');
        }

        // 查询交易记录
        const { data: transactions, error: transactionError } = await this.supabaseService
            .getClient()
            .from('transactions')
            .select('*')
            .or(`sender_id.eq.${wallet.id},recipient_address.eq.${wallet.address}`)
            .range((page - 1) * limit, page * limit - 1)
            .order('created_at', { ascending: false });

        if (transactionError) {
            throw new Error('Error fetching transactions');
        }

        // 获取总交易记录数
        const { count } = await this.supabaseService
            .getClient()
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .or(`sender_id.eq.${wallet.id},recipient_address.eq.${wallet.address}`);

        return {
            total: count,
            transactions,
        };
    }

    async createPaymentOrder(membershipType: string, durationMonths: number) {
        let amount: string;
        let currency: string;

        // 根据会员类型和持续时间计算价格
        if (membershipType === 'basic') {
            amount = (20 * durationMonths).toString(); // 每月 20 USDT
            currency = 'USDT';
        } else if (membershipType === 'premium') {
            amount = (0.01 * durationMonths).toString(); // 每月 0.01 ETH
            currency = 'ETH';
        } else {
            throw new Error('Invalid membership type');
        }

        return {
            currency,
            amount,
        };
    }

    async payOrder(userId: string, currency: string, amount: string) {
        const recipientAddress = '0x1234567890abcdef1234567890abcdef12345678'; // 模拟收款地址

        // 模拟转账逻辑
        const result = await this.transferFunds(userId, recipientAddress, currency, amount, 'Payment for Discord membership');
        return result;
    }
} 