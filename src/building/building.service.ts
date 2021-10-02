import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoomDto } from 'src/rooms/dto/create-room.dto';
import { RoomsService } from 'src/rooms/rooms.service';
import { Repository } from 'typeorm';
import { CreateBuildingDto } from './dto/create-building.dto';
import { Building } from './entities/building.model';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
    private readonly roomService: RoomsService,
  ) {}

  async create(createBuildingDto: CreateBuildingDto, businessId: string) {
    const existingBuilding = await this.buildingRepository.find({
      where: [
        {
          roomPrefix: createBuildingDto.roomPrefix,
          businessId: businessId,
        },
        {
          buildingName: createBuildingDto.buildingName,
          businessId: businessId,
        },
      ],
    });

    if (existingBuilding.length > 0) throw new ConflictException();

    const buildingDto = new Building();
    buildingDto.address = createBuildingDto.address;
    buildingDto.baseCommonCharge = createBuildingDto.baseCommonCharge;
    buildingDto.buildingName = createBuildingDto.buildingName;
    buildingDto.businessId = businessId;
    buildingDto.defaultCostPerMonth = Number(
      createBuildingDto.defaultCostPerMonth,
    );
    buildingDto.floors = createBuildingDto.floors;
    buildingDto.roomPrefix = createBuildingDto.roomPrefix;

    const building = await this.buildingRepository.save(buildingDto);

    for await (const room of createBuildingDto.rooms) {
      const roomDto = new CreateRoomDto();
      roomDto.buildingId = building.id;
      roomDto.floor = room.floor;
      roomDto.pricePerMonth = Number(room.costPerMonth);
      roomDto.roomNumber = room.roomNumber;
      roomDto.size = Number(room.size);
      roomDto.type = room.type;
      roomDto.unit = room.unit;

      await this.roomService.create(roomDto, businessId);
    }
  }

  async getBuildings(businessId: string) {
    const buildings = await this.buildingRepository.find({
      where: { businessId: businessId },
      select: ['buildingName', 'id'],
    });

    return {
      buildings: buildings,
    };
  }

  async getBuilding(businessId: string, id: string) {
    const building = await this.buildingRepository.findOne({
      where: { businessId: businessId, id: id },
    });

    return {
      id: building.id,
      buildingName: building.buildingName,
      roomPrefix: building.roomPrefix,
      baseCommonCharge: building.baseCommonCharge,
      address: building.address,
      floors: building.floors,
    };
  }

  async getAllRoomsFromSpecificFloor(
    businessId: string,
    id: string,
    floor: string,
  ) {
    const rooms =
      await this.roomService.getAllRoomsFromSpecificFloorAndBuilding(
        businessId,
        id,
        floor,
      );

    return {
      rooms: rooms.map((room) => ({
        roomNumber: room.roomNumber,
        size: room.size,
        type: room.type,
        costPerMonth: room.pricePerMonth,
        purchasePrice: room.purchasePrice ?? 0,
      })),
    };
  }
}
