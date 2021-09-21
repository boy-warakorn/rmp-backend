import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.model';
import { RoomsModule } from 'src/rooms/rooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), forwardRef(() => RoomsModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
