import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.model';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { RoomsService } from 'src/rooms/rooms.service';
import { PayPaymentDto } from './dto/pay-payment.dto';

dayjs.extend(utc);

// status “in-active”, “active” , “pending” , “complete”, “reject”

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => RoomsService))
    private readonly roomService: RoomsService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const payment = new Payment();
    payment.amount = createPaymentDto.amount;
    payment.businessId = createPaymentDto.businessId;
    payment.isRenew = createPaymentDto.isRenew;
    payment.roomRoomNumber = createPaymentDto.roomNumber;
    payment.status = createPaymentDto.status;
    payment.type = createPaymentDto.type;
    payment.issuedAt = dayjs().format();

    await this.paymentRepository.save(payment);
  }

  async getPayments(
    businessId: string,
    status: string,
    roomNumber: string,
    userId: string,
  ) {
    let payments: Payment[];
    if (userId) {
      const roomNumberRes = await this.roomService.getRoomNumberByUserId(
        userId,
      );
      payments = await this.paymentRepository.find({
        where: [
          {
            roomRoomNumber: roomNumberRes,
            status: 'active',
          },
          {
            roomRoomNumber: roomNumberRes,
            status: 'pending',
          },
          {
            roomRoomNumber: roomNumberRes,
            status: 'complete',
          },
        ],
      });
    } else if (roomNumber) {
      payments = await this.paymentRepository.find({
        roomRoomNumber: roomNumber,
        businessId: businessId,
      });
    } else if (status) {
      payments = await this.paymentRepository.find({
        status: status,
        businessId: businessId,
      });
    } else {
      payments = await this.paymentRepository.find({ businessId: businessId });
    }

    return {
      payments: payments.map((payment) => ({
        id: payment.id,
        roomNumber: payment.roomRoomNumber,
        paidAt: payment.paidAt
          ? dayjs(payment.paidAt).format('YYYY-MM-DD HH:MM:ss')
          : '',
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        issuedAt: payment.issuedAt
          ? dayjs(payment.issuedAt).format('YYYY-MM-DD HH:MM:ss')
          : '',
        confirmedAt: payment.confirmedAt
          ? dayjs(payment.confirmedAt).format('YYYY-MM-DD HH:MM:ss')
          : '',
      })),
    };
  }

  async renewAllPayment() {
    const rooms = await this.roomService.getRoomsForRenewPayment();

    for await (const room of rooms) {
      const payments = await this.paymentRepository.find({
        where: {
          roomRoomNumber: room.roomNumber,
        },
      });
      if (payments.length < 1) {
        const commonChargePayment = new CreatePaymentDto();
        commonChargePayment.amount = this.getCommonCharge();
        commonChargePayment.businessId = room.businessId;
        commonChargePayment.isRenew = true;
        commonChargePayment.roomNumber = room.roomNumber;
        commonChargePayment.status = 'active';
        commonChargePayment.type = 'common-charge';
        const rentPayment = new CreatePaymentDto();
        rentPayment.amount = room.pricePerMonth;
        rentPayment.businessId = room.businessId;
        rentPayment.isRenew = true;
        rentPayment.roomNumber = room.roomNumber;
        rentPayment.status = 'active';
        rentPayment.type = 'rent';

        await this.createPayment(commonChargePayment);
        await this.createPayment(rentPayment);
      }
    }
  }

  async paySpecificPayment(id: string, payDto: PayPaymentDto) {
    await this.paymentRepository.save({
      id: id,
      receiptUrl: payDto.receiptUrl,
      paidAt: dayjs().format(),
      status: 'pending',
    });
  }

  async getReceipt(id: string) {
    return await this.paymentRepository.findOne(id, { select: ['receiptUrl'] });
  }

  async confirmPayment(id: string) {
    const specificPayment = await this.paymentRepository.findOne(id);

    if (specificPayment.status !== 'pending') {
      throw new ConflictException();
    }

    await this.paymentRepository.save({
      id: id,
      confirmedAt: dayjs().format(),
      status: 'complete',
    });
  }

  getCommonCharge() {
    return 3000;
  }
}