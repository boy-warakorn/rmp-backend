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
import { GetRoomsQueryDto } from './dto/get-rooms-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.model';

dayjs.extend(utc);

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private readonly userService: UsersService,
  ) {}

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
        pricePerMonth: room.pricePerMonth,
        purchasePrice: room.purchasePrice,
        lastMoveAt: room.lastMoveAt
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

  async addRoomOwner(
    addOwnerDto: AddOwnerDto,
    roomNumber: string,
    businessId: string,
  ) {
    const room = await this.roomRepository.findOne(roomNumber);
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
      lastMoveAt: dayjs().format(),
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
