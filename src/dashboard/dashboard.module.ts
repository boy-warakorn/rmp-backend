import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { RoomsModule } from 'src/rooms/rooms.module';
import { PostalsModule } from 'src/postals/postals.module';
import { ReportsModule } from 'src/reports/reports.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [RoomsModule, PostalsModule, ReportsModule, PaymentsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
