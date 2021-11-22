import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { generate } from 'generate-password';
import { PaymentsService } from 'src/payments/payments.service';
import { PackagesService } from 'src/postals/postals.service';
import { ReportsService } from 'src/reports/reports.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { IsNull, Not, Repository } from 'typeorm';
import { AddOwnerDto } from './dto/add-owner.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { EditOwnerDto } from './dto/edit-owner.dto';
import { GetRoomIDsQueryDto } from './dto/get-room-ids-query.dto';
import { GetRoomsQueryDto } from './dto/get-rooms-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.model';
import { v4 as uuidv4 } from 'uuid';

const nodeMailer = require('nodemailer');

dayjs.extend(utc);

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => PackagesService))
    private readonly packageService: PackagesService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentService: PaymentsService,
    @Inject(forwardRef(() => ReportsService))
    private readonly reportService: ReportsService,
  ) {}

  // Done
  async getRoomNumberByUserId(userId: string) {
    const room = await this.roomRepository.find({
      where: [{ userId: userId }],
    });
    if (room.length < 1) throw new NotFoundException();

    return {
      id: room[0].id,
      roomNumber: room[0].roomNumber,
    };
  }

  // Done
  async getRoomNumberByRoomId(roomId: string) {
    const room = await this.roomRepository.findOne(roomId);

    if (!room) throw new NotFoundException();

    return room.roomNumber;
  }

  // Done
  async getRoomIdByRoomNumber(roomNumber: string, businessId: string) {
    const room = await this.roomRepository.find({
      where: { roomNumber: roomNumber, businessId: businessId },
    });

    if (room.length < 1) throw new NotFoundException();

    return room[0].id;
  }

  // Done
  async getRoom(roomId: string) {
    const room = await this.roomRepository.findOne(roomId);

    if (!room) throw new NotFoundException();

    let user;

    const isOccupied = room.userId !== null;

    if (isOccupied) user = await this.userService.getUser(room.userId);
    return {
      id: room.id,
      resident: isOccupied
        ? {
            name: user.profile.name,
            phoneNumber: user.profile.phoneNumber,
            citizenNumber: user.profile.citizenNumber,
          }
        : {},
      room: {
        roomNumber: room.roomNumber,
        size: room.size,
        type: room.type,
        pricePerMonth: room.pricePerMonth,
        purchasePrice: room.purchasePrice,
        unit: room.unit,
        lastMoveAt: room.lastMoveAt
          ? dayjs(room.lastMoveAt).format('YYYY-MM-DD HH:mm:ss')
          : '',
      },
      status: isOccupied ? 'occupied' : 'unoccupied',
    };
  }

  // Done
  async getRoomsForRenewPayment() {
    return await this.roomRepository.find({
      select: ['id', 'roomNumber', 'pricePerMonth', 'businessId'],
      where: [{ userId: Not(IsNull()) }],
    });
  }

  // Done
  async getRooms(getRoomsQueryDto: GetRoomsQueryDto, businessId: string) {
    const { filter_tab, roomNumber, buildingId } = getRoomsQueryDto;

    const selectCondition: (keyof Room)[] = [
      'id',
      'lastMoveAt',
      'pricePerMonth',
      'purchasePrice',
      'roomNumber',
      'size',
      'type',
      'unit',
      'userId',
    ];
    const roomId = roomNumber
      ? await this.getRoomIdByRoomNumber(roomNumber, businessId)
      : Not(IsNull());

    const rooms = await this.roomRepository.find({
      select: selectCondition,
      order: {
        updatedAt: 'DESC',
      },
      where: filter_tab
        ? {
            businessId: businessId,
            userId: filter_tab === 'unoccupied' ? IsNull() : Not(IsNull()),
            id: roomId,
            buildingId: buildingId ?? Not(IsNull()),
          }
        : {
            businessId: businessId,
            id: roomId,
            buildingId: buildingId ?? Not(IsNull()),
          },
    });

    const formattedRooms = [];

    for await (const room of rooms) {
      let formattedRoom: any = {};

      formattedRoom.id = room.id;
      formattedRoom.roomNumber = room.roomNumber;
      formattedRoom.size = room.size;
      formattedRoom.type = room.type;
      formattedRoom.contractType = room.userId ? 'rent' : 'unoccupied';
      formattedRoom.lastMoveAt = !room.lastMoveAt
        ? ''
        : dayjs(room.lastMoveAt).format('YYYY-MM-DD HH:mm:ss');
      formattedRoom.unit = room.unit;
      formattedRoom.paymentDues = 0;
      formattedRoom.packageRemaining = 0;

      if (room.userId) {
        const payments = await this.paymentService.getPayments(
          businessId,
          '',
          room.roomNumber,
          '',
          '',
        );
        const packages = await this.packageService.getPackages(
          {
            roomNumber: room.roomNumber,
          },
          businessId,
        );
        const overduePayments = payments.payments.filter(
          (curPay) =>
            curPay.status === 'active' ||
            curPay.status === 'rejected' ||
            curPay.status === 'pending',
        );

        formattedRoom.paymentDues = overduePayments.length;
        formattedRoom.packageRemaining = packages.packages.length;
      }

      if (filter_tab !== 'overdued') {
        formattedRooms.push(formattedRoom);
      } else if (formattedRoom.paymentDues) {
        formattedRooms.push(formattedRoom);
      }
    }

    const allRoom = await this.roomRepository.find({
      relations: ['payment'],
      where: { businessId: businessId },
    });

    const occupiedRoom = await this.roomRepository.find({
      where: { businessId: businessId, userId: Not(IsNull()) },
    });

    const statusCount = {
      all: allRoom.length,
      overdued: allRoom.filter(
        (room) =>
          room.payment.filter(
            (pay) =>
              pay.status === 'active' ||
              pay.status === 'rejected' ||
              pay.status === 'pending',
          ).length > 0 && room.userId,
      ).length,
      occupied: occupiedRoom.length,
      unoccupied: allRoom.length - occupiedRoom.length,
    };

    return {
      rooms: formattedRooms,
      statusCount: statusCount,
    };
  }

  // Done
  async create(createRoomDto: CreateRoomDto, businessId: string) {
    const isExist = await this.roomRepository.find({
      where: { businessId: businessId, roomNumber: createRoomDto.roomNumber },
    });

    if (isExist.length > 1) throw new ConflictException();

    const room = new Room();
    const {
      lastMoveAt,
      size,
      pricePerMonth,
      roomNumber,
      type,
      purchasePrice,
      unit,
      buildingId,
      floor,
    } = createRoomDto;

    room.businessId = businessId;
    if (lastMoveAt) room.lastMoveAt = lastMoveAt;
    room.size = size;
    room.pricePerMonth = pricePerMonth;
    room.roomNumber = roomNumber;
    room.type = type;
    room.purchasePrice = purchasePrice;
    room.unit = unit;
    room.buildingId = buildingId;
    room.floor = floor;
    room.id = uuidv4();
    room.updatedAt = dayjs().format();

    try {
      await this.roomRepository.save(room);
    } catch (error) {
      console.log(error);
    }
  }

  // Done
  async updateRoom(roomId: string, updateRoomDto: UpdateRoomDto) {
    const { type, size, pricePerMonth, purchasePrice, lastMoveAt, unit } =
      updateRoomDto;
    const room = new Room();

    if (lastMoveAt) room.lastMoveAt = lastMoveAt;
    room.pricePerMonth = pricePerMonth;
    room.type = type;
    room.size = size;
    room.purchasePrice = purchasePrice;
    room.unit = unit;
    room.updatedAt = dayjs().format();

    await this.roomRepository.save({
      id: roomId,
      updatedAt: dayjs().format(),
      ...room,
    });
  }

  // Done
  async deleteRoom(roomId: string) {
    const room = await this.getRoom(roomId);

    if (room.resident?.citizenNumber) {
      throw new ConflictException();
    }
    await this.roomRepository.delete(roomId);
  }

  // Done
  async updateRoomOwner(editRoomOwner: EditOwnerDto, roomId: string) {
    const room = await this.roomRepository.findOne(roomId);
    await this.userService.updateUserById(
      room.userId,
      editRoomOwner,
      'resident',
    );
  }

  // Done
  async addRoomOwner(
    addOwnerDto: AddOwnerDto,
    roomId: string,
    businessId: string,
  ) {
    const room = await this.roomRepository.findOne(roomId);
    if (!room) {
      throw new NotFoundException();
    }
    if (room.userId) {
      throw new ConflictException('This room already have owner');
    }
    const { name, email, phoneNumber, citizenNumber } = addOwnerDto;
    const userDto = new CreateUserDto();
    // const password = generate({ length: 10 });
    const password = '123456';

    userDto.businessId = businessId;
    userDto.citizenNumber = citizenNumber;
    userDto.name = name;
    userDto.email = email;
    userDto.role = 'resident';
    userDto.phoneNumber = phoneNumber;
    userDto.password = password;

    const result = await this.userService.create(userDto);
    await this.roomRepository.save({
      id: roomId,
      userId: result.id,
      lastMoveAt: result.createdAt,
      updatedAt: dayjs().format(),
    });

    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rmp.management.sys@gmail.com',
        pass: 'ltmbfxcnjenzhnje',
      },
    });
    await transporter.sendMail({
      from: 'RMP Management Automatic Bot <rmp.management.sys@gmail.com>',
      to: email,
      subject: 'Your RMP application account',
      html: `<div><h4>Thank you for trusting us!</h4><h3>This is account for login to our system</h3><p>Email: ${userDto.email}</p><p>Password: ${userDto.password}</div>`,
    });

    return {
      email: email,
      password: password,
    };
  }

  // Done
  async deleteRoomOwner(roomId: string, businessId: string) {
    const room = await this.roomRepository.findOne(roomId);

    const packages = await this.packageService.getPackages(
      {
        roomNumber: room.roomNumber,
      },
      businessId,
    );
    const payments = await this.paymentService.getPayments(
      businessId,
      '',
      room.roomNumber,
      '',
      '',
    );

    if (packages.packages.length > 0 || payments.payments.length > 0) {
      throw new ConflictException();
    }
    if (!room) {
      throw new NotFoundException();
    }

    await this.roomRepository.save({
      id: roomId,
      updatedAt: dayjs().format(),
      userId: null,
    });
    await this.userService.deleteUserById(room.userId);
  }

  // Done
  async forceDeleteRoomOwner(roomId: string, businessId: string) {
    const room = await this.roomRepository.findOne(roomId);
    const packages = await this.packageService.getPackages(
      {
        roomNumber: room.roomNumber,
      },
      businessId,
    );
    const payments = await this.paymentService.getPayments(
      businessId,
      '',
      room.roomNumber,
      '',
      '',
    );
    const rooms = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['report'],
    });

    for await (const postal of packages.packages) {
      await this.packageService.deletePackage(postal.id);
    }
    for await (const payment of payments.payments) {
      await this.paymentService.deletePayment(payment.id);
    }
    for await (const report of rooms.report) {
      await this.reportService.deleteReport(report.id);
    }

    await this.roomRepository.save({
      id: roomId,
      userId: null,
      updatedAt: dayjs().format(),
    });
    await this.userService.deleteUserById(room.userId);
  }

  // Done
  async getRoomNumberList(businessId: string, query: GetRoomIDsQueryDto) {
    let roomNumbers: Room[];

    if (query.allRoom) {
      roomNumbers = await this.roomRepository.find({
        select: ['roomNumber'],
        where: [
          {
            businessId: businessId,
            buildingId: query.buildingId ?? Not(IsNull()),
          },
        ],
      });
    } else {
      roomNumbers = await this.roomRepository.find({
        select: ['roomNumber'],
        where: [
          {
            businessId: businessId,
            userId: Not(IsNull()),
            buildingId: query.buildingId ?? Not(IsNull()),
          },
        ],
      });
    }

    return {
      roomNumbers: roomNumbers.map((room) => room.roomNumber),
    };
  }

  // Done
  async getAllRoomsFromSpecificFloorAndBuilding(
    businessId: string,
    buildingId: string,
    floor: string,
  ) {
    const rooms = await this.roomRepository.find({
      where: { businessId: businessId, buildingId: buildingId, floor: floor },
    });

    return rooms;
  }

  // Done
  async getAllRoomsFromBuilding(businessId: string, buildingId: string) {
    const rooms = await this.roomRepository.find({
      where: { businessId: businessId, buildingId: buildingId },
    });
    return rooms;
  }

  // Done
  async deleteAllRoomFromBuilding(businessId: string, buildingId: string) {
    const roomIds = await this.roomRepository.find({
      select: ['id'],
      where: { buildingId: buildingId, businessId: businessId },
    });

    for await (const room of roomIds) {
      await this.roomRepository.delete(room.id);
    }
  }
}
