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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Express.Request, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  getUser(@Req() req: Express.Request): Promise<UserDto> {
    return this.usersService.getUser(req.user['id']);
  }
}
