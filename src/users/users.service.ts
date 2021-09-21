import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { BusinessService } from 'src/business/business.service';
import { EditOwnerDto } from 'src/rooms/dto/edit-owner.dto';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.model';

dayjs.extend(utc);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly businessService: BusinessService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = plainToClass(User, createUserDto);

    const found = await this.userRepository.find({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (found.length > 0) {
      throw new ConflictException();
    }

    user.createdAt = dayjs().format();
    user.isDelete = false;

    return await this.userRepository.save(user);
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string) {
    const user = await this.userRepository.find({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    return user;
  }

  async updateUserById(id: string, editOwnerDto: EditOwnerDto, role: string) {
    await this.userRepository.save({ id: id, ...editOwnerDto, role: role });
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOne(id, {
      where: { isDelete: false },
    });

    if (!user) {
      throw new NotFoundException();
    }

    const businessName = await this.businessService.getBusinessName(
      user.businessId,
    );

    return {
      id: user.id,
      profile: {
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        citizenNumber: user.citizenNumber,
      },
      businessName: businessName,
      createdAt: user.createdAt,
    };
  }

  async getUsers(businessId: string, role: string) {
    const result = await this.userRepository.find({
      where: role
        ? [{ businessId: businessId, role: role, isDelete: false }]
        : [{ businessId: businessId, isDelete: false }],
    });
    return result;
  }

  async deleteUserById(id: string) {
    // Force Hard delele
    await this.userRepository.delete(id);
  }
}
