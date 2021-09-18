import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Business } from './entities/business.model';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    const business = plainToClass(Business, createBusinessDto);

    const businessResult = await this.businessRepository.save(business);

    return {
      id: businessResult.id,
      name: business.name,
    };
  }

  async getAllUserFromBusinessId(id: string) {
    const business = await this.businessRepository.findOne(id, {
      relations: ['user'],
    });

    const resultUsers = business.user.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
    }));

    return {
      businessName: business.name,
      users: resultUsers,
    };
  }

  async getBusinessName(id: string) {
    const result = await this.businessRepository.findOne(id);
    return result.name;
  }
}
