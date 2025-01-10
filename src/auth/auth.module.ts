import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [
        ConfigModule,
        SupabaseModule,
    ],
    controllers: [AuthController],
    providers: [AuthGuard],
    exports: [AuthGuard]
})
export class AuthModule { } 