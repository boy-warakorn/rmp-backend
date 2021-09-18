import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from './configs';
import { BusinessModule } from './business/business.module';
import { UsersModule } from './users/users.module';
import { JwtAuthModule } from './jwt-auth/jwt-auth.module';
import { JwtAuthStrategy } from './jwt-auth/jwt-auth.strategy';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module';
import { AccountsModule } from './accounts/accounts.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(database),
    BusinessModule,
    UsersModule,
    JwtAuthModule,
    AuthModule,
    RoomsModule,
    AccountsModule,
    ReportsModule,
  ],
})
export class AppModule {}
