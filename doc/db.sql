-- 启用 UUID 扩展
create extension if not exists "uuid-ossp";

-- 创建钱包表
create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 创建余额表
create table if not exists public.balances (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid not null references public.wallets(id),
  token text not null,
  balance text not null,
  usd_value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(wallet_id, token)
);

alter table public.balances enable row level security;
create policy "Users can only view their own balances"
    on public.balances for select
    to authenticated
    using (wallet_id in (
        select id from public.wallets where user_id = auth.uid()
    ));

-- 为触发器函数设置权限
grant execute on function public.create_wallet_and_balance to postgres;

-- 修改触发器函数，明确指定 schema
create or replace function public.create_wallet_and_balance()
returns trigger as $$
declare
    wallet_id uuid;
begin
    -- 设置搜索路径，包含 auth schema
    set search_path = public, auth;
    
    -- 记录开始执行
    raise log 'Starting create_wallet_and_balance for user %', new.id;
    raise log 'Function executing as user: %', current_user;
    
    begin
        -- 创建钱包
        raise log 'Creating wallet for user %', new.id;
        insert into public.wallets (user_id, address)
        values (new.id, gen_random_uuid()::text)
        returning id into wallet_id;
        
        raise log 'Wallet created with ID: %', wallet_id;

        -- 初始化余额
        raise log 'Initializing balances for wallet %', wallet_id;
        insert into public.balances (wallet_id, token, balance, usd_value)
        values 
            (wallet_id, 'ETH', '100', '300000'),
            (wallet_id, 'USDT', '100', '100');
        
        raise log 'Balances initialized successfully';

    exception when others then
        -- 记录详细错误信息
        raise log 'Error in create_wallet_and_balance for user %: % %', new.id, SQLERRM, SQLSTATE;
        return new;
    end;

    raise log 'Successfully completed create_wallet_and_balance for user %', new.id;
    return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

-- 删除旧触发器（如果存在）
drop trigger if exists on_user_insert on auth.users;

-- 创建新触发器
create trigger on_user_insert
after insert on auth.users
for each row
execute procedure public.create_wallet_and_balance();

-- 为已存在用户插入钱包和余额数据
do $$
declare
    user_record record;
    wallet_id uuid;
begin
    for user_record in select id from auth.users loop
        -- 检查钱包是否已存在
        if not exists (select 1 from public.wallets where user_id = user_record.id) then
            -- 创建钱包，使用 UUID 作为地址
            insert into public.wallets (user_id, address)
            values (user_record.id, uuid_generate_v4()::text)
            returning id into wallet_id;

            -- 初始化余额
            insert into public.balances (wallet_id, token, balance, usd_value)
            values 
                (wallet_id, 'ETH', '100', '300000'),
                (wallet_id, 'USDT', '100', '100');
        end if;
    end loop;
end;
$$;

-- 创建交易记录表
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.wallets(id),
  recipient_address text not null,
  token text not null,
  amount text not null,
  memo text,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;
create policy "Users can view their own transactions"
    on public.transactions for select
    to authenticated
    using (sender_id in (
        select id from public.wallets where user_id = auth.uid()
    ));