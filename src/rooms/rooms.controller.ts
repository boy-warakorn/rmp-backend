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
  HttpCode,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Express.Request, @Body() createRoomDto: CreateRoomDto) {
    const { businessId } = req.user as any;
    return this.roomsService.create(createRoomDto, businessId);
  }
}
