import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { database } from './configs';
import { BusinessModule } from './business/business.module';
import { UsersModule } from './users/users.module';
import { JwtAuthModule } from './jwt-auth/jwt-auth.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RoomsModule } from './rooms/rooms.module';
import { AccountsModule } from './accounts/accounts.module';
import { ReportsModule } from './reports/reports.module';
import { PostalsModule } from './postals/postals.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { ContactsModule } from './contacts/contacts.module';
import { BuildingModule } from './building/building.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(database),
    BusinessModule,
    UsersModule,
    JwtAuthModule,
    AuthModule,
    RoomsModule,
    AccountsModule,
    ReportsModule,
    PostalsModule,
    PaymentsModule,
    ContactsModule,
    BuildingModule,
    DashboardModule,
  ],
  providers: [TasksService],
})
export class AppModule {}
