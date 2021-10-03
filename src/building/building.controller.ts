import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createBuildingDto: CreateBuildingDto,
    @Req() req: Express.Request,
  ) {
    const { businessId } = req.user as any;
    return this.buildingService.create(createBuildingDto, businessId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getBuildings(@Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.buildingService.getBuildings(businessId);
  }

  @Delete('/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteBuilding(@Param('id') id: string, @Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.buildingService.deleteBuilding(businessId, id);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  getBuilding(@Param('id') id: string, @Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.buildingService.getBuilding(businessId, id);
  }

  @Get('/:id/floor/:floor')
  @UseGuards(JwtAuthGuard)
  getRoomInSpecificFloor(
    @Param('floor') floor: string,
    @Param('id') id: string,
    @Req() req: Express.Request,
  ) {
    const { businessId } = req.user as any;
    return this.buildingService.getAllRoomsFromSpecificFloor(
      businessId,
      id,
      floor,
    );
  }
}
