import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { BusinessService } from 'src/business/business.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.model';

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

    user.isDelete = false;

    return await this.userRepository.save(user);
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string) {
    const user = await this.userRepository.find({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    return user;
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
      },
      businessName: businessName,
    };
  }

  async deleteUserById(id: string) {
    this.userRepository.save({
      id: id,
      isDelete: true,
    });
  }
}
