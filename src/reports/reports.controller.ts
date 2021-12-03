import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
import { ReplyReportDto } from './dto/reply-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createReport(
    @Req() req: Express.Request,
    @Body() createReportDto: CreateReportDto,
  ) {
    const { businessId, id } = req.user as any;

    return await this.reportsService.createReport(
      id,
      businessId,
      createReportDto,
    );
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getReports(
    @Query() query: GetReportsQueryDto,
    @Req() req: Express.Request,
  ) {
    const { businessId } = req.user as any;
    return await this.reportsService.getReports(query, false, '', businessId);
  }

  @Get('/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingReports(@Req() req: Express.Request) {
    const { businessId } = req.user as any;
    return await this.reportsService.getPendingReport(businessId);
  }

  @Get('/resident')
  @UseGuards(JwtAuthGuard)
  async getReportsByResident(
    @Req() req: Express.Request,
    @Query() query: GetReportsQueryDto,
  ) {
    const { id, businessId } = req.user as any;
    return await this.reportsService.getReports(query, true, id, businessId);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getReport(@Param('id') id: string) {
    return await this.reportsService.getReport(id);
  }

  @Post('/:id/reply')
  @UseGuards(JwtAuthGuard)
  async replyReport(
    @Param('id') id: string,
    @Body() replyReportDto: ReplyReportDto,
  ) {
    return await this.reportsService.replyReport(replyReportDto, id);
  }

  @Post('/:id/resolve')
  @UseGuards(JwtAuthGuard)
  async resolveReport(
    @Req() req: Express.Request,
    @Param('id') id: string,
    @Body() resolveReportDto: ResolveReportDto,
  ) {
    const { id: userId, businessId } = req.user as any;
    return await this.reportsService.resolveReport(
      id,
      resolveReportDto,
      userId,
      businessId,
    );
  }
}
