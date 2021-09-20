import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.model';

// status “in-active”, “active” , “pending” , “complete”, “reject”

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const payment = new Payment();
    payment.amount = createPaymentDto.amount;
    payment.businessId = createPaymentDto.businessId;
    payment.isRenew = createPaymentDto.isRenew;
    payment.roomRoomNumber = createPaymentDto.roomNumber;
    payment.status = createPaymentDto.status;
    payment.type = createPaymentDto.type;

    await this.paymentRepository.save(payment);
  }

  async renewAllPayment() {
    await this.paymentRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'active' })
      .where(`status = :status`, { status: 'in-active' })
      .execute();
  }

  getCommonCharge() {
    return 3000;
  }
}
