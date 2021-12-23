import { forwardRef, Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.model';
import { UsersModule } from 'src/users/users.module';
import { PostalsModule } from 'src/postals/postals.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { ReportsModule } from 'src/reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    UsersModule,
    forwardRef(() => PostalsModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => ReportsModule),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
