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
import { UsersService } from 'src/users/users.service';
import * as admin from 'firebase-admin';

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
    private usersService: UsersService,
  ) {}

  // Done
  async getPackages(query: GetPackageQuery, businessId: string) {
    try {
      const { roomNumber, status, buildingId } = query;

      const roomId = roomNumber
        ? await this.roomsService.getRoomIdByRoomNumber(roomNumber, businessId)
        : Not(IsNull());

      let result = await this.packageRepository.find({
        order: {
          updatedAt: 'DESC',
        },
        where: {
          businessId: businessId,
          roomId: roomId,
          status: status ? status : Not(IsNull()),
        },
        relations: ['room'],
      });

      if (buildingId) {
        result = result.filter((res) => res.room.buildingId === buildingId);
      }
      let packages = [];
      for await (const packageEle of result) {
        const room = await this.roomsService.getRoom(packageEle.roomId);

        const imgList = await this.packageImageRepository.find({
          where: { packageId: packageEle.id },
        });

        const formattedPackage = {
          id: packageEle.id,
          note: packageEle.note,
          roomNumber: room.room.roomNumber,
          roomOwner: room.resident.name,
          arrivedAt: packageEle.arrivedAt
            ? dayjs(packageEle.arrivedAt).format('YYYY-MM-DD HH:mm:ss')
            : '',
          deliveredAt: packageEle.deliveredAt
            ? dayjs(packageEle.deliveredAt).format('YYYY-MM-DD HH:mm:ss')
            : '',
          postalService: packageEle.postalService,
          status: packageEle.status,
          imgList: imgList.map((img) => img.imgUrl),
        };
        packages.push(formattedPackage);
      }

      const allPackages = await this.packageRepository.find({
        where: { businessId: businessId },
      });

      const statusCount = {
        all: allPackages.length,
        inStorage: allPackages.filter(
          (postal) => postal.status === 'in-storage',
        ).length,
        received: allPackages.filter((postal) => postal.status === 'received')
          .length,
      };

      return {
        packages: packages,
        statusCount: statusCount,
      };
    } catch (error) {
      console.log(`error`, error);
    }
  }

  // Done
  async getPackagesByResident(query: GetPackageQuery, userId: string) {
    try {
      const room = await this.roomsService.getRoomNumberByUserId(userId);
      const result = await this.packageRepository.find({
        where: [
          {
            roomId: room.id,
            status: query.status ? query.status : Not(IsNull()),
          },
        ],
      });

      let packages = [];
      for await (const packageEle of result) {
        const room = await this.roomsService.getRoom(packageEle.roomId);
        const imgList = await this.packageImageRepository.find({
          where: { packageId: packageEle.id },
        });
        const formattedPackage = {
          id: packageEle.id,
          note: packageEle.note,
          roomNumber: room.room.roomNumber,
          arrivedAt: packageEle.arrivedAt
            ? dayjs(packageEle.arrivedAt).format('YYYY-MM-DD HH:mm:ss')
            : '',
          deliveredAt: packageEle.deliveredAt
            ? dayjs(packageEle.deliveredAt).format('YYYY-MM-DD HH:mm:ss')
            : '',
          postalService: packageEle.postalService,
          status: packageEle.status,
          imgList: imgList.map((img) => img.imgUrl),
        };
        packages.push(formattedPackage);
      }

      const allPackages = await this.packageRepository.find({
        where: { roomId: room.id },
      });

      const statusCount = {
        all: allPackages.length,
        inStorage: allPackages.filter(
          (postal) => postal.status === 'in-storage',
        ).length,
        received: allPackages.filter((postal) => postal.status === 'received')
          .length,
      };

      return {
        packages: packages,
        statusCount: statusCount,
      };
    } catch (error) {
      console.log(`error`, error);
    }
  }

  // Done
  async getPackage(id: string) {
    try {
      const result = await this.packageRepository.findOne(id);
      const room = await this.roomsService.getRoom(result.roomId);
      const imgList = await this.packageImageRepository.find({
        where: { packageId: id },
      });

      return {
        id: result.id,
        note: result.note,
        roomNumber: room.room.roomNumber,
        roomOwner: room.resident.name,
        arrivedAt: result.arrivedAt
          ? dayjs(result.arrivedAt).format('YYYY-MM-DD HH:mm:ss')
          : '',
        deliveredAt: result.deliveredAt
          ? dayjs(result.deliveredAt).format('YYYY-MM-DD HH:mm:ss')
          : '',
        postalService: result.postalService,
        status: result.status,
        imgList: imgList.map((img) => img.imgUrl),
      };
    } catch (error) {}
  }

  // Done
  async createPackage(createPackageDto: CreatePackageDto, businessId: string) {
    const roomId = await this.roomsService.getRoomIdByRoomNumber(
      createPackageDto.roomNumber,
      businessId,
    );
    const user = await this.usersService.getUser(roomId);
    if (user.deviceId) {
      await admin.messaging().sendToDevice(
        user.deviceId,
        {
          notification: {
            title: 'New Package',
            body: 'You have new package!. Please check it in application',
          },
        },
        { priority: 'high' },
      );
    }
    const preparePackage = new Package();
    preparePackage.arrivedAt = dayjs().format();
    preparePackage.postalService = createPackageDto.postalService;
    preparePackage.note = createPackageDto.note ?? '';
    preparePackage.roomId = roomId;
    preparePackage.businessId = businessId;
    preparePackage.status = 'in-storage';
    preparePackage.roomRoomNumber = roomId;
    preparePackage.updatedAt = dayjs().format();

    const room = await this.roomsService.getRoom(roomId);

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

  // Done
  async editPackage(editPackageDto: EditPackageDto, packageId: string) {
    if (!editPackageDto.imgList) {
      editPackageDto.imgList = [];
    }
    const editedPackage = {
      note: editPackageDto.note,
      postalService: editPackageDto.postalService,
      arrivedAt: dayjs(editPackageDto.arrivedAt).format(),
      updatedAt: dayjs().format(),
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

  // Done
  async deletePackage(packageId: string) {
    await this.packageImageRepository.delete({ packageId: packageId });
    await this.packageRepository.delete(packageId);
  }

  // Done
  async confirmDeliver(packageId: string) {
    const confirmPackage = {
      deliveredAt: dayjs().format(),
      updatedAt: dayjs().format(),
      status: 'received',
    };

    await this.packageRepository.save({ id: packageId, ...confirmPackage });
  }

  // Done
  async getMasterData() {
    return {
      postalService: ['Kerry', 'Thailand Post', 'Ninja', 'Others service'],
    };
  }
}
