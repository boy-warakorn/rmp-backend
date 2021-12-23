import { forwardRef, Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.model';
import { UsersModule } from 'src/users/users.module';
import { RoomsModule } from 'src/rooms/rooms.module';
import { ReportImage } from './entities/report-image.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ReportImage]),
    UsersModule,
    forwardRef(() => RoomsModule),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
