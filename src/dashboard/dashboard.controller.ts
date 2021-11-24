import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/summary')
  @UseGuards(JwtAuthGuard)
  getSummary(@Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.dashboardService.getSummary(businessId);
  }

  @Get('/package')
  @UseGuards(JwtAuthGuard)
  getRecentPackage(@Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.dashboardService.recentPackages(businessId);
  }

  @Get('/report')
  @UseGuards(JwtAuthGuard)
  getRecentReport(@Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.dashboardService.recentReports(businessId);
  }

  @Get('/room')
  @UseGuards(JwtAuthGuard)
  getRoom(@Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return this.dashboardService.getRoom(businessId);
  }
}
