import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { CreatePackageDto } from './dto/create-package.dto';
import { EditPackageDto } from './dto/edit-package.dto';
import { GetPackageQuery } from './dto/get-package-query.dto';
import { PackagesService } from './postals.service';

// @todo implement business id to every get method

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  getPackages(@Query() query: GetPackageQuery, @Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.packagesService.getPackages(query, businessId);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  createPackage(
    @Body() createPackageDto: CreatePackageDto,
    @Req() req: Express.Request,
  ) {
    const { businessId } = req.user as any;
    return this.packagesService.createPackage(createPackageDto, businessId);
  }

  @Get('/residents')
  @UseGuards(JwtAuthGuard)
  getPackagesResident(
    @Req() req: Express.Request,
    @Query() query: GetPackageQuery,
  ) {
    const { id } = req.user as any;
    return this.packagesService.getPackagesByResident(query, id);
  }

  @Get('/master-data')
  @UseGuards(JwtAuthGuard)
  getPackagesMasterData() {
    return this.packagesService.getMasterData();
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  getPackage(@Param('id') id: string) {
    return this.packagesService.getPackage(id);
  }

  @Delete('/:id/delete')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deletePackage(@Param('id') id: string) {
    return this.packagesService.deletePackage(id);
  }

  @Post('/:id/confirm')
  @HttpCode(204)
  confirmPackage(@Param('id') id: string) {
    return this.packagesService.confirmDeliver(id);
  }

  @Post('/:id/update')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  updatePackage(
    @Param('id') id: string,
    @Body() editPackageDto: EditPackageDto,
  ) {
    return this.packagesService.editPackage(editPackageDto, id);
  }
}
