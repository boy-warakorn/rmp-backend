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
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Controller('building')
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
}
