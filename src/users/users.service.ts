import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { BusinessService } from 'src/business/business.service';
import { Business } from 'src/business/entities/business.model';
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

  create(createUserDto: CreateUserDto) {
    const user = plainToClass(User, createUserDto);
    this.userRepository.save(user);
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string) {
    const user = await this.userRepository.find({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    console.log(`user`, user);

    return user;
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOne(id);
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
}
