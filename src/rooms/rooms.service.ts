import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.model';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

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
}
