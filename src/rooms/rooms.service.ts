import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { generate } from 'generate-password';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { IsNull, Not, Repository } from 'typeorm';
import { AddOwnerDto } from './dto/add-owner.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { EditOwnerDto } from './dto/edit-owner.dto';
import { GetRoomsQueryDto } from './dto/get-rooms-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.model';

const nodeMailer = require('nodemailer');

dayjs.extend(utc);

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private readonly userService: UsersService,
  ) {}

  async getRoom(roomNumber: string) {
    const room = await this.roomRepository.findOne(roomNumber);

    if (!room) throw new NotFoundException();

    let user;
    const isOccupied = room.userId !== null;

    if (isOccupied) user = await this.userService.getUser(room.userId);
    return {
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
        lastMoveAt: dayjs(room.lastMoveAt).format('YYYY-MM-DD HH:MM:ss'),
      },
      status: isOccupied ? 'occupied' : 'unoccupied',
    };
  }

  async getRooms(getRoomsQueryDto: GetRoomsQueryDto, businessId: string) {
    const { filter_tab } = getRoomsQueryDto;
    const selectCondition: (keyof Room)[] = [
      'lastMoveAt',
      'pricePerMonth',
      'purchasePrice',
      'roomNumber',
      'size',
      'type',
      'unit',
      'userId',
    ];

    let rooms: Room[];
    if (!filter_tab) {
      rooms = await this.roomRepository.find({
        select: selectCondition,
        where: { businessId: businessId },
      });
    } else {
      rooms = await this.roomRepository.find({
        select: selectCondition,
        where: {
          businessId: businessId,
          userId: filter_tab === 'unoccupied' ? IsNull() : Not(IsNull()),
        },
      });
    }

    return {
      rooms: rooms.map((room) => ({
        roomNumber: room.roomNumber,
        size: room.size,
        type: room.type,
        // @todo will change this to real value
        contractType: room.userId ? 'purchase' : 'unoccupied',
        lastMoveAt: !room.lastMoveAt
          ? ''
          : dayjs(room.lastMoveAt).format('YYYY-MM-DD HH:MM:ss'),
        unit: room.unit,
      })),
    };
  }

  async create(createRoomDto: CreateRoomDto, businessId: string) {
    const room = new Room();
    const {
      lastMoveAt,
      size,
      pricePerMonth,
      roomNumber,
      type,
      purchasePrice,
      unit,
    } = createRoomDto;

    room.businessId = businessId;
    if (lastMoveAt) room.lastMoveAt = lastMoveAt;
    room.size = size;
    room.pricePerMonth = pricePerMonth;
    room.roomNumber = roomNumber;
    room.type = type;
    room.purchasePrice = purchasePrice;
    room.unit = unit;

    await this.roomRepository.save(room);
  }

  async updateRoom(roomNumber: string, updateRoomDto: UpdateRoomDto) {
    const { type, size, pricePerMonth, purchasePrice, lastMoveAt, unit } =
      updateRoomDto;
    const room = new Room();

    if (lastMoveAt) room.lastMoveAt = lastMoveAt;
    room.pricePerMonth = pricePerMonth;
    room.type = type;
    room.size = size;
    room.purchasePrice = purchasePrice;
    room.unit = unit;

    await this.roomRepository.save({
      roomNumber: roomNumber,
      ...room,
    });
  }

  async deleteRoom(roomNumber: string) {
    const room = await this.getRoom(roomNumber);
    if (room.resident?.citizenNumber) {
      await this.deleteRoomOwner(roomNumber);
    }
    await this.roomRepository.delete(roomNumber);
  }

  async updateRoomOwner(editRoomOwner: EditOwnerDto, roomNumber: string) {
    const room = await this.roomRepository.findOne(roomNumber);
    await this.userService.updateUserById(
      room.userId,
      editRoomOwner,
      'resident',
    );
  }

  async addRoomOwner(
    addOwnerDto: AddOwnerDto,
    roomNumber: string,
    businessId: string,
  ) {
    const room = await this.roomRepository.findOne(roomNumber);
    if (!room) {
      throw new NotFoundException();
    }
    if (room.userId) {
      throw new ConflictException('This room already have owner');
    }
    const { name, email, phoneNumber, citizenNumber } = addOwnerDto;
    const userDto = new CreateUserDto();
    const password = generate({ length: 10 });

    userDto.businessId = businessId;
    userDto.citizenNumber = citizenNumber;
    userDto.name = name;
    userDto.email = email;
    userDto.role = 'resident';
    userDto.phoneNumber = phoneNumber;
    userDto.password = password;

    const result = await this.userService.create(userDto);
    await this.roomRepository.save({
      roomNumber: roomNumber,
      userId: result.id,
      lastMoveAt: result.createdAt,
    });

    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rmp.management.sys@gmail.com',
        pass: 'ltmbfxcnjenzhnje',
      },
    });
    await transporter.sendMail({
      from: 'rmp.management.sys@gmail.com',
      to: email,
      subject: 'Your RMP application account',
      html: `<div><h4>Thank you for trusting us!</h4><p>Email: ${userDto.email}</p><p>Password: ${userDto.password}</div>`,
    });

    return {
      email: email,
      password: password,
    };
  }

  async deleteRoomOwner(roomNumber: string) {
    const room = await this.roomRepository.findOne(roomNumber);
    if (!room) {
      throw new NotFoundException();
    }

    await this.roomRepository.save({
      roomNumber: roomNumber,
      userId: null,
    });
    await this.userService.deleteUserById(room.userId);
  }
}
