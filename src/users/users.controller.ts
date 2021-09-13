import { Controller, Get, Post } from '@nestjs/common';
import { InsertResult } from 'typeorm';
import { User } from './users.model';
import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('')
  async getUser(): Promise<User> {
    return this.userService.findOne(1);
  }

  @Post('')
  async createUser(): Promise<InsertResult> {
    return this.userService.create();
  }
}
