import { Injectable } from '@nestjs/common';
import { PaymentsService } from 'src/payments/payments.service';
import { PackagesService } from 'src/postals/postals.service';
import { ReportsService } from 'src/reports/reports.service';
import { RoomsService } from 'src/rooms/rooms.service';

@Injectable()
export class DashboardService {
  constructor(
    private paymentsService: PaymentsService,
    private roomsService: RoomsService,
    private postalsService: PackagesService,
    private reportsService: ReportsService,
  ) {}

  async getSummary(businessId: string) {
    try {
      const payments = await this.paymentsService.getPayments(
        businessId,
        'active',
        '',
        '',
        '',
      );
      const packages = await this.postalsService.getPackages(
        { status: 'in-storage' },
        businessId,
      );
      const reports = await this.reportsService.getReports(
        {} as any,
        false,
        '',
        businessId,
      );

      return {
        count: {
          overdued: payments.statusCount.all,
          held: packages.statusCount.inStorage,
          maintenance: reports.reports.filter(
            (report) => report.type === 'maintenance',
          ).length,
          complaint: reports.reports.filter(
            (report) => report.type === 'complaint',
          ).length,
        },
      };
    } catch (error) {
      console.log(error);
    }
  }

  async recentPackages(businessId: string) {
    try {
      const packages = await this.postalsService.getPackages(
        {
          status: 'in-storage',
        },
        businessId,
      );
      if (packages.packages.length > 2) {
        return { packages: packages.packages.slice(0, 3) };
      }
      return { packages: packages.packages.slice(0, 3) };
    } catch (error) {}
  }

  async recentReports(businessId: string) {
    try {
      const reports = await this.reportsService.getReports(
        { status: 'pending' },
        false,
        '',
        businessId,
      );
      if (reports.reports.length > 2) {
        return { reports: reports.reports.slice(0, 3) };
      }
      return { reports: reports.reports };
    } catch (error) {}
  }

  async getRoom(businessId: string) {
    try {
      const rooms = await this.roomsService.getRooms({} as any, businessId);

      return {
        count: {
          totalRoom: rooms.statusCount.all,
          occupiedRoom: rooms.statusCount.occupied,
        },
      };
    } catch (error) {}
  }
}
