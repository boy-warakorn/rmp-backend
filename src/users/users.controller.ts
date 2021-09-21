import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';

// @todo implement business id to every get method

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  getUser(@Req() req: Express.Request): Promise<UserDto> {
    return this.usersService.getUser(req.user['id']);
  }
}
