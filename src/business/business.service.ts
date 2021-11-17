import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Business } from './entities/business.model';

const nodeMailer = require('nodemailer');

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    const businessResult = await this.businessRepository.save(
      createBusinessDto,
    );

    const createUserDto: CreateUserDto = {
      businessId: businessResult.id,
      username: createBusinessDto.email,
      email: createBusinessDto.email,
      name: `${createBusinessDto.firstname} ${createBusinessDto.lastname}`,
      password: createBusinessDto.password,
      phoneNumber: createBusinessDto.phoneNumber,
      citizenNumber: createBusinessDto.citizenNumber,
      role: 'admin',
    };
    try {
      await this.userService.create(createUserDto);

      const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'rmp.management.sys@gmail.com',
          pass: 'ltmbfxcnjenzhnje',
        },
      });
      await transporter.sendMail({
        from: 'RMP Management Automatic Bot <rmp.management.sys@gmail.com>',
        to: createBusinessDto.email,
        subject: 'Your RMP application account',
        html: `<div><h2>Thank you for trusting us!</h2><h3>This is account for login to our system</h3><h3>Click this link for access to our system <a href="https://rmps.netlify.app/">https://rmps.netlify.app/</a> </h3><p>Email: ${createBusinessDto.email}</p><p>Password: ${createBusinessDto.password}</div>`,
      });
    } catch (error) {
      console.log(error);
    }
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
