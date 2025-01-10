-- 创建钱包表
create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 设置 RLS 策略
alter table public.wallets enable row level security;

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

-- 创建触发器函数
create or replace function create_wallet_and_balance()
returns trigger as $$
declare
    wallet_id uuid;
begin
    -- 创建钱包，使用 UUID 作为地址
    insert into public.wallets (user_id, address)
    values (new.id, uuid_generate_v4()::text)
    returning id into wallet_id;

    -- 初始化余额
    insert into public.balances (wallet_id, token, balance, usd_value)
    values 
        (wallet_id, 'ETH', '100', '300000'),
        (wallet_id, 'USDT', '100', '100');

    return new;
end;
$$ language plpgsql;

-- 创建触发器
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_user_insert') then
    create trigger on_user_insert
    after insert on auth.users
    for each row
    execute procedure create_wallet_and_balance();
  end if;
end;
$$;

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