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
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { AddOwnerDto } from './dto/add-owner.dto';
import { GetRoomsQueryDto } from './dto/get-rooms-query.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  getRooms(@Req() req: Express.Request, @Query() query: GetRoomsQueryDto) {
    const { businessId } = req.user as any;
    return this.roomsService.getRooms(query, businessId);
  }

  @Post('')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Express.Request, @Body() createRoomDto: CreateRoomDto) {
    const { businessId } = req.user as any;
    return this.roomsService.create(createRoomDto, businessId);
  }

  @Post('/:id/update')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.updateRoom(id, updateRoomDto);
  }

  @Post('/:id/owner')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  addRoomOwner(
    @Req() req: Express.Request,
    @Param('id') id: string,
    @Body() addOwnerDto: AddOwnerDto,
  ) {
    const { businessId } = req.user as any;
    return this.roomsService.addRoomOwner(addOwnerDto, id, businessId);
  }

  @Delete('/:id/owner')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteRoomOwner(@Param('id') id: string) {
    return this.roomsService.deleteRoomOwner(id);
  }
}
