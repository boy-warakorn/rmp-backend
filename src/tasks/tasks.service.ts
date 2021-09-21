import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PaymentsService } from 'src/payments/payments.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private readonly paymentService: PaymentsService) {}

  @Cron('* * * *')
  //Cronjob every 24th of month
  //@Cron('0 0 24 * *')
  automaticRenewPayment() {
    this.logger.debug('Automaticly Renew');
    this.paymentService.renewAllPayment();
  }
}
