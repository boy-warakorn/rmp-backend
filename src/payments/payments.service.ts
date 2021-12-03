import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Not, Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.model';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { RoomsService } from 'src/rooms/rooms.service';
import { PayPaymentDto } from './dto/pay-payment.dto';
import { ImportPaymentDto } from './dto/import-payment.dto';
import * as admin from 'firebase-admin';
import { UsersService } from 'src/users/users.service';

dayjs.extend(utc);

// status “in-active”, “active” , “pending” , “complete”, “reject”, "overdue"

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @Inject(forwardRef(() => RoomsService))
    private readonly roomService: RoomsService,
    private readonly userService: UsersService,
  ) {}

  // Done
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const payment = new Payment();
    payment.amount = createPaymentDto.amount;
    payment.businessId = createPaymentDto.businessId;
    payment.isRenew = createPaymentDto.isRenew;

    const currentDate = dayjs().format();
    const duedDate = dayjs().add(1, 'day').format();

    payment.roomId = createPaymentDto.roomId;
    payment.status = createPaymentDto.status;
    payment.type = createPaymentDto.type;
    payment.issuedAt = currentDate;
    payment.updatedAt = currentDate;
    payment.duedAt = duedDate;

    await this.paymentRepository.save(payment);
  }
  async checkDuedPayment() {
    const currentDate = dayjs().format();
    const payments = await this.paymentRepository.find({
      select: ['id', 'roomId'],
      where: { duedAt: LessThan(currentDate), status: 'active' },
    });

    const userId = [];

    for await (const payment of payments) {
      const room = await this.roomService.getRoom(payment.roomId);
      const user = await this.userService.getUser(room.resident.userId);

      if (user.deviceId && !userId.includes(user.id)) {
        await admin.messaging().sendToDevice(
          user.deviceId,
          {
            notification: {
              title: 'Overdued Payment',
              body: 'You have new overdued payment!. Please check it in application',
            },
          },
          { priority: 'high' },
        );

        userId.push(user.id);
      }

      await this.paymentRepository.save({ id: payment.id, status: 'overdue' });
    }
  }

  // Done
  async importPayment(importPaymentDto: ImportPaymentDto, businessId: string) {
    try {
      for await (const paymentDto of importPaymentDto.payments) {
        const payment = new Payment();
        payment.amount = paymentDto.amount;
        payment.businessId = businessId;
        payment.isRenew = false;

        const roomId = await this.roomService.getRoomIdByRoomNumber(
          paymentDto.roomNumber,
          businessId,
        );

        payment.roomId = roomId;
        payment.status = 'active';
        payment.type = paymentDto.type;
        payment.issuedAt = dayjs().format();
        payment.updatedAt = dayjs().format();
        this.paymentRepository.save(payment);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Done
  async getPayments(
    businessId: string,
    status: string,
    roomNumber: string,
    userId: string,
    buildingId: string,
  ) {
    let payments: Payment[];

    // TODO: Refactor
    if (userId) {
      const roomNumberRes = await this.roomService.getRoomNumberByUserId(
        userId,
      );
      payments = await this.paymentRepository.find({
        order: {
          updatedAt: 'DESC',
        },
        where: {
          roomId: roomNumberRes.id,
          status: status,
        },
        relations: ['room'],
      });
    } else {
      const roomId = roomNumber
        ? await this.roomService.getRoomIdByRoomNumber(roomNumber, businessId)
        : Not(IsNull());

      payments = await this.paymentRepository.find({
        order: {
          updatedAt: 'DESC',
        },
        where: {
          roomId: roomId,
          businessId: businessId,
          status: status ? status : Not(IsNull()),
        },
        relations: ['room'],
      });
    }

    if (buildingId) {
      payments = payments.filter(
        (payment) => payment.room.buildingId === buildingId,
      );
    }

    let resultPayment = [];

    for await (const payment of payments) {
      const roomNumber = await this.roomService.getRoomNumberByRoomId(
        payment.roomId,
      );

      const formattedPayment = {
        id: payment.id,
        roomNumber: roomNumber,
        paidAt: payment.paidAt
          ? dayjs(payment.paidAt).format('YYYY-MM-DD HH:mm:ss')
          : '',
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        issuedAt: payment.issuedAt
          ? dayjs(payment.issuedAt).format('YYYY-MM-DD HH:mm:ss')
          : '',
        confirmedAt: payment.confirmedAt
          ? dayjs(payment.confirmedAt).format('YYYY-MM-DD HH:mm:ss')
          : '',
        duedAt: payment.duedAt
          ? dayjs(payment.duedAt).format('YYYY-MM-DD HH:mm:ss')
          : '',
      };
      resultPayment.push(formattedPayment);
    }

    let allPayments = [] as Payment[];

    if (userId) {
      const roomNumberRes = await this.roomService.getRoomNumberByUserId(
        userId,
      );
      allPayments = await this.paymentRepository.find({
        where: { businessId: businessId, roomId: roomNumberRes.id },
      });
    } else {
      allPayments = await this.paymentRepository.find({
        where: { businessId: businessId },
      });
    }

    const statusCount = {
      all: allPayments.length,
      pending: allPayments.filter((payment) => payment.status === 'pending')
        .length,
      active: allPayments.filter((payment) => payment.status === 'active')
        .length,
      reject: allPayments.filter((payment) => payment.status === 'rejected')
        .length,
      complete: allPayments.filter((payment) => payment.status === 'complete')
        .length,
      overdue: allPayments.filter((payment) => payment.status === 'overdue')
        .length,
    };

    return {
      payments: resultPayment,
      statusCount: statusCount,
    };
  }

  // Done
  async renewAllPayment() {
    const rooms = await this.roomService.getRoomsForRenewPayment();

    for await (const room of rooms) {
      const payments = await this.paymentRepository.find({
        where: {
          roomId: room.id,
        },
      });
      const user = await this.userService.getUser(room.userId);

      if (payments.length < 1) {
        if (user.deviceId) {
          await admin.messaging().sendToDevice(
            user.deviceId,
            {
              notification: {
                title: 'New Payment',
                body: 'A new payment has been added!',
              },
            },
            { priority: 'high' },
          );
        }

        const commonChargePayment = new CreatePaymentDto();
        commonChargePayment.amount = this.getCommonCharge();
        commonChargePayment.businessId = room.businessId;
        commonChargePayment.isRenew = true;
        commonChargePayment.roomId = room.id;
        commonChargePayment.status = 'active';
        commonChargePayment.type = 'common-charge';
        const rentPayment = new CreatePaymentDto();
        rentPayment.amount = room.pricePerMonth;
        rentPayment.businessId = room.businessId;
        rentPayment.isRenew = true;
        rentPayment.roomId = room.id;
        rentPayment.status = 'active';
        rentPayment.type = 'rent';

        await this.createPayment(commonChargePayment);
        await this.createPayment(rentPayment);
      }
    }
  }

  // Done
  async paySpecificPayment(id: string, payDto: PayPaymentDto) {
    await this.paymentRepository.save({
      id: id,
      updatedAt: dayjs().format(),
      receiptUrl: payDto.receiptUrl,
      paidAt: dayjs().format(),
      status: 'pending',
    });
  }

  // Done
  async getReceipt(id: string) {
    return await this.paymentRepository.findOne(id, { select: ['receiptUrl'] });
  }

  // Done
  async confirmPayment(id: string) {
    const specificPayment = await this.paymentRepository.findOne(id);

    if (
      specificPayment.status !== 'pending' &&
      specificPayment.status !== 'rejected'
    ) {
      throw new ConflictException();
    }

    const room = await this.roomService.getRoom(specificPayment.roomId);
    const user = await this.userService.getUser(room.resident.userId);

    if (user.deviceId) {
      await admin.messaging().sendToDevice(
        user.deviceId,
        {
          notification: {
            title: 'Complete Payment',
            body: 'Your pending payment has complete',
          },
        },
        { priority: 'high' },
      );
    }

    await this.paymentRepository.save({
      id: id,
      updatedAt: dayjs().format(),
      confirmedAt: dayjs().format(),
      status: 'complete',
    });
  }

  // Done
  async rejectPayment(id: string) {
    const specificPayment = await this.paymentRepository.findOne(id);
    const room = await this.roomService.getRoom(specificPayment.roomId);
    const user = await this.userService.getUser(room.resident.userId);

    if (user.deviceId) {
      await admin.messaging().sendToDevice(
        user.deviceId,
        {
          notification: {
            title: 'Reject Payment',
            body: 'Your payment has been rejected. Please check it in application',
          },
        },
        { priority: 'high' },
      );
    }

    if (specificPayment.status !== 'pending') {
      throw new ConflictException();
    }

    await this.paymentRepository.save({
      id: id,
      updatedAt: dayjs().format(),
      confirmedAt: dayjs().format(),
      status: 'rejected',
    });
  }

  async deletePayment(id: string) {
    await this.paymentRepository.delete(id);
  }

  getCommonCharge() {
    return 3000;
  }
}
