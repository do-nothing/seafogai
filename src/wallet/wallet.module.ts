import { Module} from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    SupabaseModule,
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    SupabaseService,
  ],
  exports: [WalletService]
})
export class WalletModule {} 