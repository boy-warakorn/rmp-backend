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
import * as admin from 'firebase-admin';

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
    const users = await this.usersService.getUsers(businessId, '');
    const deviceIds = [];
    for await (const user of users) {
      if (user.deviceId) deviceIds.push(user.deviceId);
    }
    if (deviceIds.length > 0) {
      await admin.messaging().sendToDevice(
        deviceIds,
        {
          notification: {
            title:
              createReportDto.type === 'complaint'
                ? 'Complaint'
                : 'Maintenance Report',
            body: `You have new ${
              createReportDto.type === 'complaint'
                ? 'complaint'
                : 'maintenance report'
            } from ${room.roomNumber}`,
          },
        },
        { priority: 'high' },
      );
    }

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
    report.updatedAt = dayjs().format();
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
      order: {
        updatedAt: 'DESC',
      },
      where: {
        status: query.status ?? Not(IsNull()),
        userId: isResident ? userId : Not(IsNull()),
        roomId: roomId,
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
          ? dayjs(report.requestedDate).format('YYYY-MM-DD HH:mm:ss')
          : '',
        resolvedDate: report?.resolvedDate
          ? dayjs(report.resolvedDate).format('YYYY-MM-DD HH:mm:ss')
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

    let allReport = [] as Report[];
    if (query.mobile) {
      allReport = await this.reportRepository.find({
        where: { type: query.type },
      });
    } else if (isResident) {
      allReport = await this.reportRepository.find({
        where: { userId: userId, type: query.type },
      });
    } else {
      allReport = await this.reportRepository.find({
        where: { businessId: businessId },
      });
    }

    const statusCount = {
      all: allReport.length,
      pending: allReport.filter((report) => report.status === 'pending').length,
      responded: allReport.filter((report) => report.status === 'responded')
        .length,
      resolved: allReport.filter((report) => report.status === 'resolved')
        .length,
    };

    return {
      reports: result,
      statusCount: statusCount,
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
        ? dayjs(report.requestedDate).format('YYYY-MM-DD HH:mm:ss')
        : '',
      resolvedDate: report?.resolvedDate
        ? dayjs(report.resolvedDate).format('YYYY-MM-DD HH:mm:ss')
        : '',
      status: report.status,
      imgList: imgList.map((img) => img.imgUrl),
    };
  }

  // Done
  async replyReport(replyReportDto: ReplyReportDto, id: string) {
    const report = await this.reportRepository.findOne(id);
    const room = await this.roomsService.getRoom(report.roomId);
    const user = await this.usersService.getUser(room.resident.userId);

    if (user.deviceId) {
      await admin.messaging().sendToDevice(
        user.deviceId,
        {
          notification: {
            title:
              report.type === 'complaint' ? 'Complaint' : 'Maintenance Report',
            body: `Your ${
              report.type === 'complaint' ? 'complaint' : 'maintenance report'
            } has been reply`,
          },
        },
        { priority: 'high' },
      );
    }

    await this.reportRepository.save({
      id: id,
      respondDetail: replyReportDto.detail,
      updatedAt: dayjs().format(),
      status: 'responded',
    });
  }

  // Done
  async resolveReport(
    id: string,
    resolveReportDto: ResolveReportDto,
    userId: string,
    businessId: string,
  ) {
    const deviceIds = [];
    const users = await this.usersService.getUsers(businessId, '');
    const report = await this.reportRepository.findOne(id);

    if (resolveReportDto.resolveBy === 'condos personnel') {
      for await (const user of users) {
        if (user.deviceId) deviceIds.push(user.deviceId);
      }
    } else {
      const user = await this.usersService.getUser(userId);
      if (user.deviceId) deviceIds.push(user.deviceId);
    }

    if (deviceIds.length > 0) {
      await admin.messaging().sendToDevice(
        deviceIds,
        {
          notification: {
            title:
              report.type === 'complaint' ? 'Complaint' : 'Maintenance Report',
            body: `Your ${
              report.type === 'complaint' ? 'complaint' : 'maintenance report'
            } has been resolve`,
          },
        },
        { priority: 'high' },
      );
    }

    await this.reportRepository.save({
      id: id,
      status: 'resolved',
      updatedAt: dayjs().format(),
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
    await this.reportImageRepository.delete({ reportId: reportId });
    await this.reportRepository.delete(reportId);
  }
}
