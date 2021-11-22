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
import { ReportImage } from './entities/report-image.model';

dayjs.extend(utc);

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportImage)
    private reportImageRepository: Repository<ReportImage>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private usersService: UsersService,
    @Inject(forwardRef(() => RoomsService))
    private roomsService: RoomsService,
  ) {}

  // Done
  async createReport(
    userId: string,
    businessId: string,
    createReportDto: CreateReportDto,
  ) {
    const room = await this.roomsService.getRoomNumberByUserId(userId);
    const report = new Report();
    report.businessId = businessId;
    report.detail = createReportDto.detail;
    report.title = createReportDto.title;
    report.userId = userId;
    report.status = 'pending';
    report.roomId = room.id;
    report.type = createReportDto.type;
    report.availableDay =
      createReportDto.type === 'maintenance'
        ? createReportDto.dayList.join(', ')
        : '';

    report.requestedDate = dayjs().format();
    const reportResult = await this.reportRepository.save(report);
    for await (const imgUrl of createReportDto.imgList) {
      await this.reportImageRepository.save({
        imgUrl: imgUrl,
        reportId: reportResult.id,
      });
    }
  }

  // Done
  async getReports(
    query: GetReportsQueryDto,
    isResident: boolean,
    userId: string,
    businessId: string,
  ) {
    const roomId = query.roomNumber
      ? await this.roomsService.getRoomIdByRoomNumber(
          query.roomNumber,
          businessId,
        )
      : Not(IsNull());

    let reports = await this.reportRepository.find({
      where: {
        status: query.status ?? Not(IsNull()),
        userId: isResident ? userId : Not(IsNull()),
        id: roomId,
        businessId: businessId,
        type: query.type ? query.type : Not(IsNull()),
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
      const imgList = await this.reportImageRepository.find({
        where: { reportId: report.id },
      });
      const roomNumber = await this.roomsService.getRoomNumberByRoomId(
        report.roomId,
      );

      const formattedReport = {
        id: report.id,
        roomNumber: roomNumber,
        reportOwner: users.profile.name,
        requestedDate: report?.requestedDate
          ? dayjs(report.requestedDate).format('YYYY-MM-DD HH:MM:ss')
          : '',
        resolvedDate: report?.resolvedDate
          ? dayjs(report.resolvedDate).format('YYYY-MM-DD HH:MM:ss')
          : '',
        type: report.type,
        title: report.title,
        detail: report.detail,
        status: report.status,
        availableDay: report.availableDay,
        resolvedBy: report.resolveBy,
        imgList: imgList.map((img) => img.imgUrl),
      };
      result.push(formattedReport);
    }

    return {
      reports: result,
    };
  }

  // Done
  async getReport(id: string) {
    const report = await this.reportRepository.findOne(id);
    const user = await this.usersService.getUser(report.userId);
    const roomNumber = await this.roomsService.getRoomNumberByRoomId(
      report.roomId,
    );

    const imgList = await this.reportImageRepository.find({
      where: { reportId: report.id },
    });

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
      type: report.type,
      availableDay: report.availableDay,
      roomNumber: roomNumber,
      requestedDate: report?.requestedDate
        ? dayjs(report.requestedDate).format('YYYY-MM-DD HH:MM:ss')
        : '',
      resolvedDate: report?.resolvedDate
        ? dayjs(report.resolvedDate).format('YYYY-MM-DD HH:MM:ss')
        : '',
      status: report.status,
      imgList: imgList.map((img) => img.imgUrl),
    };
  }

  // Done
  async replyReport(replyReportDto: ReplyReportDto, id: string) {
    await this.reportRepository.save({
      id: id,
      respondDetail: replyReportDto.detail,
      status: 'responded',
    });
  }

  // Done
  async resolveReport(id: string, resolveReportDto: ResolveReportDto) {
    await this.reportRepository.save({
      id: id,
      status: 'resolved',
      resolvedDate: dayjs().format(),
      resolveDetail: resolveReportDto.detail,
      resolveBy: resolveReportDto.resolveBy,
    });
  }

  // Done
  async getPendingReport(businessId: string) {
    return {
      count: await this.reportRepository.count({
        where: [{ status: 'pending', businessId: businessId }],
      }),
    };
  }

  // Done
  async deleteReport(reportId: string) {
    await this.reportRepository.delete(reportId);
  }
}
