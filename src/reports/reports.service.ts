import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomsService } from 'src/rooms/rooms.service';
import { UsersService } from 'src/users/users.service';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/report.model';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { ReplyReportDto } from './dto/reply-report.dto';
import { GetReportsQueryDto } from './dto/get-reports-query.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';

dayjs.extend(utc);

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private usersService: UsersService,
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
  ) {}

  async createReport(
    userId: string,
    businessId: string,
    createReportDto: CreateReportDto,
  ) {
    const roomNumber = await this.roomsService.getRoomNumberByUserId(userId);
    const report = new Report();
    report.businessId = businessId;
    report.detail = createReportDto.detail;
    report.title = createReportDto.title;
    report.userId = userId;
    report.status = 'pending';
    report.roomRoomNumber = roomNumber;
    report.requestedDate = dayjs().format();
    await this.reportRepository.save(report);
  }

  async getReports(
    query: GetReportsQueryDto,
    isResident: boolean,
    userId: string,
    businessId: string,
  ) {
    let reports = await this.reportRepository.find({
      where: {
        status: query.status ?? Not(IsNull()),
        userId: isResident ? userId : Not(IsNull()),
        roomRoomNumber: query.roomNumber ?? Not(IsNull()),
        businessId: businessId,
      },
      relations: ['room'],
    });

    if (query.buildingId) {
      reports = reports.filter(
        (report) => report.room.buildingId === query.buildingId,
      );
    }

    let result = [];
    for await (const report of reports) {
      const users = await this.usersService.getUser(report.userId);
      const formattedReport = {
        id: report.id,
        roomNumber: report.roomRoomNumber,
        reportOwner: users.profile.name,
        requestedDate: report?.requestedDate
          ? dayjs(report.requestedDate).format('YYYY-MM-DD HH:MM:ss')
          : '',
        resolvedDate: report?.resolvedDate
          ? dayjs(report.resolvedDate).format('YYYY-MM-DD HH:MM:ss')
          : '',
        title: report.title,
        detail: report.detail,
        status: report.status,
        resolvedBy: report.resolveBy,
      };
      result.push(formattedReport);
    }

    return {
      reports: result,
    };
  }

  async getReport(id: string) {
    const report = await this.reportRepository.findOne(id);
    const user = await this.usersService.getUser(report.userId);

    return {
      id: report.id,
      content: {
        reportOwner: user.profile.name,
        title: report.title,
        detail: report.detail,
        respondDetail: report.respondDetail ?? '',
        resolveDetail: report.resolveDetail ?? '',
        resolveBy: report.resolveBy,
      },
      roomNumber: report.roomRoomNumber,
      requestedDate: report?.requestedDate
        ? dayjs(report.requestedDate).format('YYYY-MM-DD HH:MM:ss')
        : '',
      resolvedDate: report?.resolvedDate
        ? dayjs(report.resolvedDate).format('YYYY-MM-DD HH:MM:ss')
        : '',
      status: report.status,
    };
  }

  async replyReport(replyReportDto: ReplyReportDto, id: string) {
    await this.reportRepository.save({
      id: id,
      respondDetail: replyReportDto.detail,
      status: 'responded',
    });
  }

  async resolveReport(id: string, resolveReportDto: ResolveReportDto) {
    await this.reportRepository.save({
      id: id,
      status: 'resolved',
      resolvedDate: dayjs().format(),
      resolveDetail: resolveReportDto.detail,
      resolveBy: resolveReportDto.resolveBy,
    });
  }

  async getPendingReport(businessId: string) {
    return {
      count: await this.reportRepository.count({
        where: [{ status: 'pending', businessId: businessId }],
      }),
    };
  }

  async deleteReport(reportId: string) {
    await this.reportRepository.delete(reportId);
  }
}
