import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomsService } from 'src/rooms/rooms.service';
import { IsNull, Not, Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { EditPackageDto } from './dto/edit-package.dto';
import { Package } from './entities/package.model';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { GetPackageQuery } from './dto/get-package-query.dto';
import { PackageImage } from './entities/package-image.model';

dayjs.extend(utc);

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(PackageImage)
    private packageImageRepository: Repository<PackageImage>,
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
  ) {}

  async getPackages(query: GetPackageQuery, businessId: string) {
    try {
      const { roomNumber, status, buildingId } = query;
      let result = await this.packageRepository.find({
        where: {
          businessId: businessId,
          roomRoomNumber: roomNumber ?? Not(IsNull()),
          status: status ? status : Not(IsNull()),
        },
        relations: ['room'],
      });

      if (buildingId) {
        result = result.filter((res) => res.room.buildingId === buildingId);
      }

      let packages = [];
      for await (const packageEle of result) {
        const room = await this.roomsService.getRoom(packageEle.roomRoomNumber);

        const imgList = await this.packageImageRepository.find({
          where: { packageId: packageEle.id },
        });

        const formattedPackage = {
          id: packageEle.id,
          note: packageEle.note,
          roomNumber: packageEle.roomRoomNumber,
          roomOwner: room.resident.name,
          arrivedAt: packageEle.arrivedAt
            ? dayjs(packageEle.arrivedAt).format('YYYY-MM-DD HH:MM:ss')
            : '',
          deliveredAt: packageEle.deliveredAt
            ? dayjs(packageEle.deliveredAt).format('YYYY-MM-DD HH:MM:ss')
            : '',
          postalService: packageEle.postalService,
          status: packageEle.status,
          imgList: imgList.map((img) => img.imgUrl),
        };
        packages.push(formattedPackage);
      }
      return {
        packages: packages,
      };
    } catch (error) {
      console.log(`error`, error);
    }
  }

  async getPackagesByResident(query: GetPackageQuery, userId: string) {
    try {
      const roomNumber = await this.roomsService.getRoomNumberByUserId(userId);
      const result = await this.packageRepository.find({
        where: [
          {
            roomRoomNumber: roomNumber,
            status: query.status ? query.status : Not(IsNull()),
          },
        ],
      });

      let packages = [];
      for await (const packageEle of result) {
        const imgList = await this.packageImageRepository.find({
          where: { packageId: packageEle.id },
        });
        const formattedPackage = {
          id: packageEle.id,
          note: packageEle.note,
          roomNumber: packageEle.roomRoomNumber,
          arrivedAt: packageEle.arrivedAt
            ? dayjs(packageEle.arrivedAt).format('YYYY-MM-DD HH:MM:ss')
            : '',
          deliveredAt: packageEle.deliveredAt
            ? dayjs(packageEle.deliveredAt).format('YYYY-MM-DD HH:MM:ss')
            : '',
          postalService: packageEle.postalService,
          status: packageEle.status,
          imgList: imgList.map((img) => img.imgUrl),
        };
        packages.push(formattedPackage);
      }

      return {
        packages: packages,
      };
    } catch (error) {
      console.log(`error`, error);
    }
  }

  async getPackage(id: string) {
    try {
      const result = await this.packageRepository.findOne(id);
      const room = await this.roomsService.getRoom(result.roomRoomNumber);
      const imgList = await this.packageImageRepository.find({
        where: { packageId: id },
      });

      return {
        id: result.id,
        note: result.note,
        roomNumber: result.roomRoomNumber,
        roomOwner: room.resident.name,
        arrivedAt: result.arrivedAt
          ? dayjs(result.arrivedAt).format('YYYY-MM-DD HH:MM:ss')
          : '',
        deliveredAt: result.deliveredAt
          ? dayjs(result.deliveredAt).format('YYYY-MM-DD HH:MM:ss')
          : '',
        postalService: result.postalService,
        status: result.status,
        imgList: imgList.map((img) => img.imgUrl),
      };
    } catch (error) {}
  }

  async createPackage(createPackageDto: CreatePackageDto, businessId: string) {
    const preparePackage = new Package();
    preparePackage.arrivedAt = dayjs(createPackageDto.arrivedAt).format();
    preparePackage.postalService = createPackageDto.postalService;
    preparePackage.note = createPackageDto.note ?? '';
    preparePackage.roomRoomNumber = createPackageDto.roomNumber;
    preparePackage.businessId = businessId;
    preparePackage.status = 'in-storage';

    const room = await this.roomsService.getRoom(createPackageDto.roomNumber);

    if (!room.resident?.citizenNumber) {
      throw new ForbiddenException();
    }

    const packageResult = await this.packageRepository.save(preparePackage);
    for await (const imgUrl of createPackageDto.imgList) {
      await this.packageImageRepository.save({
        packageId: packageResult.id,
        imgUrl: imgUrl,
      });
    }
  }

  async editPackage(editPackageDto: EditPackageDto, packageId: string) {
    const editedPackage = {
      note: editPackageDto.note,
      postalService: editPackageDto.postalService,
      arrivedAt: dayjs(editPackageDto.arrivedAt).format(),
    };
    await this.packageRepository.save({
      id: packageId,
      ...editedPackage,
    });
    for await (const imgUrl of editPackageDto.imgList) {
      await this.packageImageRepository.save({
        packageId: packageId,
        imgUrl: imgUrl,
      });
    }
  }

  async deletePackage(packageId: string) {
    await this.packageRepository.delete(packageId);
  }

  async confirmDeliver(packageId: string) {
    const confirmPackage = {
      deliveredAt: dayjs().format(),
      status: 'received',
    };

    await this.packageRepository.save({ id: packageId, ...confirmPackage });
  }

  async getMasterData() {
    return {
      postalService: ['Kerry', 'Thailand Post', 'Ninja', 'Others service'],
    };
  }
}
