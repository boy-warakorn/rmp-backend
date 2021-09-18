import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { GetAccountsQueryDto } from './dto/get-accounts-query.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { AddAccountDto } from './dto/add-account.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { generate } from 'generate-password';
import { UpdateAccountDto } from './dto/update-account.dto';
import { EditOwnerDto } from 'src/rooms/dto/edit-owner.dto';

const nodeMailer = require('nodemailer');

dayjs.extend(utc);

@Injectable()
export class AccountsService {
  constructor(private readonly userService: UsersService) {}

  async getAccounts(
    businessId: string,
    getAccountsQueryDto: GetAccountsQueryDto,
  ) {
    const result = await this.userService.getUsers(
      businessId,
      getAccountsQueryDto.role,
    );

    return {
      users: result.map((user) => ({
        userId: user.id,
        role: user.role,
        name: user.name,
        createdAt: !user.createdAt
          ? ''
          : dayjs(user.createdAt).format('YYYY-MM-DD HH:MM:ss'),
      })),
    };
  }

  async getAccount(userId: string) {
    const result = await this.userService.getUser(userId);

    return {
      userId: result.id,
      profile: {
        name: result.profile.name,
        username: result.profile.username,
        role: result.profile.role,
        citizenNumber: result.profile.citizenNumber,
        email: result.profile.email,
        phoneNumber: result.profile.phoneNumber,
      },
      createdAt: result.createdAt
        ? dayjs(result.createdAt).format('YYYY-MM-DD HH:MM:ss')
        : '',
    };
  }

  async createAccount(businessId: string, addAccountDto: AddAccountDto) {
    const password = generate({ length: 10 });
    const createUserDto = new CreateUserDto();
    createUserDto.businessId = businessId;
    createUserDto.citizenNumber = addAccountDto.citizenNumber;
    createUserDto.email = addAccountDto.email;
    createUserDto.name = addAccountDto.name;
    createUserDto.phoneNumber = addAccountDto.phoneNumber;
    createUserDto.role = addAccountDto.role;
    createUserDto.username = addAccountDto.username;
    createUserDto.password = password;

    await this.userService.create(createUserDto);

    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rmp.management.sys@gmail.com',
        pass: 'ltmbfxcnjenzhnje',
      },
    });
    await transporter.sendMail({
      from: 'rmp.management.sys@gmail.com',
      to: createUserDto.email,
      subject: 'Your RMP application account',
      html: `<div><h4>Thank you for trusting us!</h4><p>Email: ${createUserDto.email}</p><p>Password: ${createUserDto.password}</div>`,
    });
  }

  async updateAccount(id: string, updateAccountDto: UpdateAccountDto) {
    const editOwnerDto = new EditOwnerDto();
    editOwnerDto.citizenNumber = updateAccountDto.citizenNumber;
    editOwnerDto.name = updateAccountDto.name;
    editOwnerDto.phoneNumber = updateAccountDto.phoneNumber;
    await this.userService.updateUserById(
      id,
      editOwnerDto,
      updateAccountDto.role,
    );
  }
}
